package com.projeto.amazonhacking.dto.safra;

/**
 * Plantação exibida dentro de uma safra (ex.: Cacau, 500, KG).
 */
public record PlantacaoDTO(
        String tipo,
        Double quantidade,
        String unidade
) {
}
