package com.projeto.amazonhacking.services;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projeto.amazonhacking.dto.interesse.CriarInteresseDTO;
import com.projeto.amazonhacking.dto.interesse.GetInteresseDTO;
import com.projeto.amazonhacking.dto.interesse.GetInteresseProdutorDTO;
import com.projeto.amazonhacking.infra.exception.RecursoNaoEncontradoException;
import com.projeto.amazonhacking.infra.exception.ValidacaoException;
import com.projeto.amazonhacking.models.Associacao;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.models.Interesse;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.repository.InteresseRepository;
import com.projeto.amazonhacking.repository.SafraRepository;

/**
 * Regras de negócio dos interesses demonstrados por empresas em safras.
 */
@Service
public class InteresseService {

    // Status inicial de todo interesse recém-criado.
    private static final String STATUS_INICIAL = "AGUARDANDO_CONTATO";

    private final InteresseRepository interesseRepository;
    private final SafraRepository safraRepository;

    public InteresseService(InteresseRepository interesseRepository, SafraRepository safraRepository) {
        this.interesseRepository = interesseRepository;
        this.safraRepository = safraRepository;
    }

    /**
     * Registra o interesse de uma empresa em uma safra.
     * A empresa vem do usuário autenticado (não do corpo da requisição),
     * impedindo que uma empresa registre interesse em nome de outra.
     * @param safraId safra alvo do interesse
     * @param empresa empresa autenticada
     * @param dto mensagem opcional para o produtor
     * @return o interesse criado, no formato de DTO
     * @throws RecursoNaoEncontradoException se a safra não existir
     * @throws ValidacaoException se a empresa já tiver interesse registrado na safra
     */
    public GetInteresseDTO criar(Integer safraId, Empresa empresa, CriarInteresseDTO dto) {
        Safra safra = safraRepository.buscarPorIdComDetalhes(safraId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Safra não encontrada"));

        // Verificação rápida para o caso comum (dá uma mensagem amigável sem tentar gravar).
        if (interesseRepository.existsBySafra_IdAndEmpresa_Id(safraId, empresa.getId())) {
            throw new ValidacaoException("Você já demonstrou interesse nesta safra");
        }

        Interesse interesse = new Interesse(safra, empresa, dto.mensagem(), STATUS_INICIAL);
        try {
            interesseRepository.save(interesse);
        } catch (DataIntegrityViolationException e) {
            // Duas requisições quase simultâneas passaram pela verificação acima:
            // a constraint UNIQUE(safra_id, empresa_id) barra a segunda no banco.
            throw new ValidacaoException("Você já demonstrou interesse nesta safra");
        }

        return toDTO(interesse);
    }

    /**
     * Lista os interesses de uma empresa, do mais recente ao mais antigo.
     * @param empresaId id da empresa autenticada
     * @return lista de interesses no formato de DTO
     */
    public List<GetInteresseDTO> listarPorEmpresa(UUID empresaId) {
        return interesseRepository.buscarPorEmpresa(empresaId).stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Lista os interesses recebidos por um produtor (todas as mensagens
     * enviadas por empresas para qualquer uma das safras dele).
     * @param produtorId id do produtor autenticado
     * @return lista de interesses no formato exibido no app do produtor
     */
    public List<GetInteresseProdutorDTO> listarPorProdutor(UUID produtorId) {
        return interesseRepository.buscarPorProdutor(produtorId).stream()
                .map(this::toProdutorDTO)
                .toList();
    }

    /**
     * Marca um interesse como lido pelo produtor.
     * Só funciona se o interesse for de uma safra do próprio produtor: a checagem
     * fica na query. Se o id pertencer a outro produtor, a busca não retorna nada
     * e o método responde 404.
     *
     * @param interesseId id do interesse a marcar
     * @param produtorId id do produtor autenticado
     * @throws RecursoNaoEncontradoException se o interesse não existir ou não pertencer ao produtor
     */
    @Transactional
    public void marcarComoLida(Integer interesseId, UUID produtorId) {
        Interesse interesse = interesseRepository.buscarPorIdEProdutor(interesseId, produtorId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Mensagem não encontrada"));

        // Evita um UPDATE desnecessário no banco se já estiver marcada.
        if (!interesse.isLida()) {
            interesse.setLida(true);
            interesseRepository.save(interesse);
        }
    }

    /**
     * Conta quantas mensagens ainda não foram lidas pelo produtor.
     * @param produtorId id do produtor autenticado
     * @return quantidade de mensagens não lidas (zero ou mais)
     */
    public long contarNaoLidos(UUID produtorId) {
        return interesseRepository.contarNaoLidosPorProdutor(produtorId);
    }

    private GetInteresseDTO toDTO(Interesse interesse) {
        Safra safra = interesse.getSafra();
        Usuario produtor = safra != null ? safra.getProdutor() : null;
        Associacao associacao = produtor != null ? produtor.getAssociacao() : null;

        return new GetInteresseDTO(
                interesse.getId(),
                safra != null ? safra.getId() : null,
                safra != null ? safra.getName() : null,
                produtor != null ? produtor.getNome() : null,
                associacao != null ? associacao.getNome() : null,
                interesse.getCreatedAt(),
                traduzirStatus(interesse.getStatus()));
    }

    private GetInteresseProdutorDTO toProdutorDTO(Interesse interesse) {
        Safra safra = interesse.getSafra();
        Empresa empresa = interesse.getEmpresa();

        return new GetInteresseProdutorDTO(
                interesse.getId(),
                safra != null ? safra.getId() : null,
                safra != null ? safra.getName() : null,
                empresa != null ? empresa.getNome() : null,
                interesse.getMensagem(),
                interesse.getCreatedAt(),
                traduzirStatus(interesse.getStatus()),
                interesse.isLida());
    }

    // Converte o código de status guardado no banco para o texto exibido no dashboard.
    private String traduzirStatus(String status) {
        if (status == null) return null;
        return switch (status) {
            case "AGUARDANDO_CONTATO" -> "Aguardando Contato";
            case "EM_NEGOCIACAO" -> "Em Negociação";
            case "CONCLUIDO" -> "Concluído";
            default -> status;
        };
    }
}
