package com.projeto.amazonhacking.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.projeto.amazonhacking.dto.safra.AssociacaoResumoDTO;
import com.projeto.amazonhacking.dto.safra.GetSafraDTO;
import com.projeto.amazonhacking.dto.safra.PlantacaoDTO;
import com.projeto.amazonhacking.dto.safra.ProdutorResumoDTO;
import com.projeto.amazonhacking.infra.exception.RecursoNaoEncontradoException;
import com.projeto.amazonhacking.models.Associacao;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.repository.SafraRepository;

/**
 * Regras de negócio das safras do catálogo (consulta pelas empresas).
 */
@Service
public class SafraService {

    private final SafraRepository safraRepository;

    public SafraService(SafraRepository safraRepository) {
        this.safraRepository = safraRepository;
    }

    /**
     * Lista as safras do catálogo aplicando filtros opcionais.
     * Os filtros são combinados (E lógico): uma safra só aparece se passar em todos.
     * @param tipos tipos de plantação desejados (vazio/null = qualquer tipo)
     * @param scoreMin AgroScore mínimo (null ou 0 = sem mínimo)
     * @param status status desejados (vazio/null = qualquer status)
     * @return lista de safras já no formato de DTO
     */
    public List<GetSafraDTO> listar(List<String> tipos, Integer scoreMin, List<String> status) {
        return safraRepository.buscarTodasComDetalhes().stream()
                .filter(safra -> passaFiltroScore(safra, scoreMin))
                .filter(safra -> passaFiltroStatus(safra, status))
                .filter(safra -> passaFiltroTipo(safra, tipos))
                .map(this::toDTO)
                .toList();
    }

    /**
     * Busca uma safra específica pelo id.
     * @param id identificador da safra
     * @return a safra no formato de DTO
     * @throws RecursoNaoEncontradoException se a safra não existir
     */
    public GetSafraDTO buscarPorId(Integer id) {
        Safra safra = safraRepository.buscarPorIdComDetalhes(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Safra não encontrada"));
        return toDTO(safra);
    }

    /**
     * Lista as safras de um produtor específico (app do produtor).
     * Lê sempre do banco — os dados nunca vêm direto do IndexedDB do aparelho.
     * @param produtorId id do produtor autenticado
     * @return safras do produtor no formato de DTO
     */
    public List<GetSafraDTO> listarPorProdutor(UUID produtorId) {
        return safraRepository.buscarPorProdutorComDetalhes(produtorId).stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Busca uma safra do próprio produtor pelo id.
     * Se a safra não existir OU não pertencer ao produtor, lança "não encontrada"
     * (404) de propósito: não revela a existência de safras de outros produtores.
     * @param safraId id da safra
     * @param produtorId id do produtor autenticado
     * @return a safra no formato de DTO
     * @throws RecursoNaoEncontradoException se não existir ou não for do produtor
     */
    public GetSafraDTO buscarDoProdutor(Integer safraId, UUID produtorId) {
        Safra safra = safraRepository.buscarPorIdComDetalhes(safraId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Safra não encontrada"));

        boolean ehDono = safra.getProdutor() != null
                && produtorId.equals(safra.getProdutor().getId());
        if (!ehDono) {
            throw new RecursoNaoEncontradoException("Safra não encontrada");
        }

        return toDTO(safra);
    }

    private boolean passaFiltroScore(Safra safra, Integer scoreMin) {
        if (scoreMin == null || scoreMin <= 0) return true;
        return safra.getAgroScore() != null && safra.getAgroScore() >= scoreMin;
    }

    private boolean passaFiltroStatus(Safra safra, List<String> status) {
        if (status == null || status.isEmpty()) return true;
        return status.contains(safra.getStatus());
    }

    private boolean passaFiltroTipo(Safra safra, List<String> tipos) {
        if (tipos == null || tipos.isEmpty()) return true;
        if (safra.getPlantacoes() == null) return false;
        return safra.getPlantacoes().stream()
                .anyMatch(plantacao -> tipos.contains(plantacao.getTipo()));
    }

    private GetSafraDTO toDTO(Safra safra) {
        Usuario produtor = safra.getProdutor();

        ProdutorResumoDTO produtorDTO = produtor == null
                ? null
                : new ProdutorResumoDTO(produtor.getNome());

        AssociacaoResumoDTO associacaoDTO = null;
        if (produtor != null && produtor.getAssociacao() != null) {
            Associacao a = produtor.getAssociacao();
            associacaoDTO = new AssociacaoResumoDTO(
                    a.getNome(), a.getMunicipio(), a.getEstado(), a.getLatitude(), a.getLongitude());
        }

        List<PlantacaoDTO> plantacoesDTO = safra.getPlantacoes() == null
                ? List.of()
                : safra.getPlantacoes().stream()
                    .map(p -> new PlantacaoDTO(p.getTipo(), p.getQuantidade(), p.getUnidade()))
                    .toList();

        return new GetSafraDTO(
                safra.getId(),
                safra.getName(),
                safra.getAgroScore(),
                safra.getStatus(),
                safra.getAreaPlantacao(),
                safra.getCreatedAt(),
                safra.getValidadaEm(),
                produtorDTO,
                associacaoDTO,
                plantacoesDTO);
    }
}
