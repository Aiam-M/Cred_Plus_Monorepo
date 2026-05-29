package com.projeto.amazonhacking.infra.storage;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

/**
 * Envia os bytes de uma imagem para o Cloudinary e devolve a URL pública (https).
 *
 * Esta classe cuida só do "como armazenar". As validações de segurança do arquivo
 * (tipo real, tamanho, dono da safra) ficam no ImagemService, que chama este serviço
 * só depois de aprovar o arquivo.
 */
@Service
public class ImagemStorageService {

    // Pasta dentro do Cloudinary onde as fotos das safras ficam organizadas.
    private static final String PASTA = "credplus/safras";

    /**
     * Resultado de um upload: a URL pública e o public_id (identificador no
     * Cloudinary, necessário para apagar a imagem depois se algo der errado).
     */
    public record ImagemEnviada(String url, String publicId) {
    }

    private final Cloudinary cloudinary;
    private final boolean configurado;

    public ImagemStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
        // Considera configurado só se o Cloudinary conseguiu parsear a api_key da CLOUDINARY_URL.
        Object apiKey = cloudinary.config.apiKey;
        this.configurado = apiKey != null && !apiKey.toString().isBlank();
    }

    /**
     * Faz o upload dos bytes da imagem e retorna a URL segura + o public_id.
     * @param conteudo bytes do arquivo já validado pelo ImagemService
     * @return URL https e public_id da imagem hospedada
     * @throws IllegalStateException se o Cloudinary não estiver configurado no servidor
     * @throws RuntimeException se o upload falhar
     */
    public ImagemEnviada enviar(byte[] conteudo) {
        if (!configurado) {
            throw new IllegalStateException(
                    "Armazenamento de imagens não configurado. Verifique a variável CLOUDINARY_URL "
                            + "(formato: cloudinary://API_KEY:API_SECRET@CLOUD_NAME).");
        }
        try {
            // resource_type=image garante que o Cloudinary trate como imagem e a reprocesse.
            Map<?, ?> resultado = cloudinary.uploader().upload(conteudo, ObjectUtils.asMap(
                    "folder", PASTA,
                    "resource_type", "image"
            ));
            return new ImagemEnviada(
                    (String) resultado.get("secure_url"),
                    (String) resultado.get("public_id"));
        } catch (IOException e) {
            throw new RuntimeException("Falha ao enviar a imagem para o armazenamento.", e);
        }
    }

    /**
     * Remove uma imagem do Cloudinary pelo public_id. Usado para limpar uma
     * imagem que foi enviada mas não conseguiu ser registrada no banco (evita
     * arquivos órfãos e fotos públicas sem dono). Se a remoção falhar, apenas
     * ignoramos: não vale a pena derrubar a requisição por causa disso.
     * @param publicId identificador da imagem no Cloudinary
     */
    public void remover(String publicId) {
        if (!configurado || publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        } catch (Exception e) {
            // Se não der pra apagar agora, não interrompe o fluxo da requisição.
        }
    }
}
