package com.projeto.amazonhacking.dto.safra;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Safra exibida no catálogo e no detalhe do dashboard.
 * O campo "nome" corresponde ao name da entidade e "areaHectares" à area_plantacao.
 */
public record GetSafraDTO(
        Integer id,
        String nome,
        Integer agroScore,
        String status,
        Double areaHectares,
        LocalDateTime createdAt,
        LocalDateTime validadaEm,
        ProdutorResumoDTO produtor,
        AssociacaoResumoDTO associacao,
        List<PlantacaoDTO> plantacoes
) {
}
