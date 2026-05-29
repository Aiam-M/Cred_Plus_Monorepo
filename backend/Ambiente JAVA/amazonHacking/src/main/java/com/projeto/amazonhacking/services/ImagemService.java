package com.projeto.amazonhacking.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.projeto.amazonhacking.dto.imagem.SafraImagemDTO;
import com.projeto.amazonhacking.infra.exception.RecursoNaoEncontradoException;
import com.projeto.amazonhacking.infra.exception.ValidacaoException;
import com.projeto.amazonhacking.infra.storage.ImagemStorageService;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.models.SafraImagem;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.repository.SafraImagemRepository;
import com.projeto.amazonhacking.repository.SafraRepository;

/**
 * Regras de negócio das imagens de safra.
 *
 * Garantias de segurança importantes:
 * - Dono da safra: só o produtor autenticado (vindo do JWT) que é dono da safra
 *   pode anexar fotos a ela. Evita IDOR (anexar foto na safra de outro produtor).
 * - Tipo real do arquivo: o tipo é checado pelos "magic bytes" (a assinatura real
 *   nos primeiros bytes), e não pela extensão ou pelo Content-Type, que podem ser
 *   falsificados. Assim um .exe renomeado para .jpg é recusado.
 * - Limite por safra: no máximo MAX_IMAGENS fotos, para evitar abuso/DoS.
 * - O nome do arquivo enviado pelo cliente é ignorado: usamos só os bytes.
 */
@Service
public class ImagemService {

    // Limite de fotos por safra (o app do produtor também limita em 5).
    private static final int MAX_IMAGENS = 5;

    // Tamanho máximo aceito por imagem (10 MB). O multipart já barra antes, isto é defesa extra.
    private static final long TAMANHO_MAXIMO_BYTES = 10L * 1024 * 1024;

    private final SafraRepository safraRepository;
    private final SafraImagemRepository safraImagemRepository;
    private final ImagemStorageService imagemStorageService;

    public ImagemService(SafraRepository safraRepository,
                         SafraImagemRepository safraImagemRepository,
                         ImagemStorageService imagemStorageService) {
        this.safraRepository = safraRepository;
        this.safraImagemRepository = safraImagemRepository;
        this.imagemStorageService = imagemStorageService;
    }

    /**
     * Anexa uma foto a uma safra do próprio produtor.
     * @param safraId id da safra (do servidor)
     * @param produtor produtor autenticado (dono esperado da safra)
     * @param arquivo arquivo de imagem enviado
     * @return a imagem salva, no formato de DTO
     * @throws RecursoNaoEncontradoException se a safra não existir ou não for do produtor
     * @throws ValidacaoException se o arquivo for inválido ou o limite for atingido
     */
    public SafraImagemDTO fazerUpload(Integer safraId, Usuario produtor, MultipartFile arquivo) {
        Safra safra = buscarSafraDoProdutor(safraId, produtor);

        if (safraImagemRepository.countBySafraId(safraId) >= MAX_IMAGENS) {
            throw new ValidacaoException("Esta safra já atingiu o limite de " + MAX_IMAGENS + " imagens.");
        }

        byte[] conteudo = validarArquivo(arquivo);
        ImagemStorageService.ImagemEnviada enviada = imagemStorageService.enviar(conteudo);

        try {
            SafraImagem imagem = new SafraImagem();
            imagem.setSafra(safra);
            imagem.setUrl(enviada.url());
            imagem.setCreatedAt(LocalDateTime.now());
            safraImagemRepository.save(imagem);

            return toDTO(imagem);
        } catch (RuntimeException e) {
            // O upload deu certo mas o registro no banco falhou: apaga a imagem do
            // Cloudinary para não deixar arquivo órfão (foto pública sem dono).
            imagemStorageService.remover(enviada.publicId());
            throw e;
        }
    }

    /**
     * Lista as imagens de uma safra para o dashboard das empresas.
     * @param safraId id da safra
     * @return imagens da safra no formato de DTO (lista vazia se não houver)
     * @throws RecursoNaoEncontradoException se a safra não existir
     */
    public List<SafraImagemDTO> listarPorSafra(Integer safraId) {
        if (!safraRepository.existsById(safraId)) {
            throw new RecursoNaoEncontradoException("Safra não encontrada");
        }
        return safraImagemRepository.findBySafraIdOrderByIdAsc(safraId).stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Busca a safra garantindo que ela pertence ao produtor autenticado.
     * Se não existir OU for de outro produtor, responde 404 de propósito
     * (não revela a existência de safras de terceiros).
     */
    private Safra buscarSafraDoProdutor(Integer safraId, Usuario produtor) {
        Safra safra = safraRepository.buscarPorIdComDetalhes(safraId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Safra não encontrada"));

        boolean ehDono = safra.getProdutor() != null
                && produtor.getId().equals(safra.getProdutor().getId());
        if (!ehDono) {
            throw new RecursoNaoEncontradoException("Safra não encontrada");
        }
        return safra;
    }

    /**
     * Valida o arquivo recebido e devolve seus bytes.
     * Recusa arquivos vazios, grandes demais ou que não sejam imagens de verdade.
     */
    private byte[] validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ValidacaoException("Nenhum arquivo enviado.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_BYTES) {
            throw new ValidacaoException("A imagem excede o tamanho máximo de 10 MB.");
        }

        byte[] conteudo;
        try {
            conteudo = arquivo.getBytes();
        } catch (IOException e) {
            throw new ValidacaoException("Não foi possível ler o arquivo enviado.");
        }

        if (!ehImagemReal(conteudo)) {
            throw new ValidacaoException("Arquivo inválido: envie uma imagem JPEG, PNG ou WEBP.");
        }
        return conteudo;
    }

    /**
     * Confere a "assinatura" (magic bytes) do arquivo. É o tipo REAL do conteúdo,
     * independente da extensão ou do Content-Type informado pelo cliente.
     */
    private boolean ehImagemReal(byte[] b) {
        return ehJpeg(b) || ehPng(b) || ehWebp(b);
    }

    // JPEG começa com FF D8 FF
    private boolean ehJpeg(byte[] b) {
        return b.length >= 3
                && (b[0] & 0xFF) == 0xFF
                && (b[1] & 0xFF) == 0xD8
                && (b[2] & 0xFF) == 0xFF;
    }

    // PNG começa com 89 50 4E 47 0D 0A 1A 0A
    private boolean ehPng(byte[] b) {
        return b.length >= 8
                && (b[0] & 0xFF) == 0x89
                && (b[1] & 0xFF) == 0x50
                && (b[2] & 0xFF) == 0x4E
                && (b[3] & 0xFF) == 0x47
                && (b[4] & 0xFF) == 0x0D
                && (b[5] & 0xFF) == 0x0A
                && (b[6] & 0xFF) == 0x1A
                && (b[7] & 0xFF) == 0x0A;
    }

    // WEBP é um contêiner RIFF: bytes 0-3 = "RIFF" e bytes 8-11 = "WEBP"
    private boolean ehWebp(byte[] b) {
        return b.length >= 12
                && (b[0] & 0xFF) == 0x52
                && (b[1] & 0xFF) == 0x49
                && (b[2] & 0xFF) == 0x46
                && (b[3] & 0xFF) == 0x46
                && (b[8] & 0xFF) == 0x57
                && (b[9] & 0xFF) == 0x45
                && (b[10] & 0xFF) == 0x42
                && (b[11] & 0xFF) == 0x50;
    }

    private SafraImagemDTO toDTO(SafraImagem imagem) {
        return new SafraImagemDTO(imagem.getId(), imagem.getUrl(), imagem.getCreatedAt());
    }
}
