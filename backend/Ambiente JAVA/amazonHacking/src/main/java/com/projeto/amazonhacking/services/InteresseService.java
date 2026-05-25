package com.projeto.amazonhacking.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.projeto.amazonhacking.dto.interesse.CriarInteresseDTO;
import com.projeto.amazonhacking.dto.interesse.GetInteresseDTO;
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

        if (interesseRepository.existsBySafra_IdAndEmpresa_Id(safraId, empresa.getId())) {
            throw new ValidacaoException("Você já demonstrou interesse nesta safra");
        }

        Interesse interesse = new Interesse(safra, empresa, dto.mensagem(), STATUS_INICIAL);
        interesseRepository.save(interesse);

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
