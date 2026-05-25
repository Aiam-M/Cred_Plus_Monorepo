package com.projeto.amazonhacking.dto.safra;

/**
 * Dados da associação exibidos no catálogo e no detalhe da safra.
 */
public record AssociacaoResumoDTO(
        String nome,
        String municipio,
        String estado,
        Double latitude,
        Double longitude
) {
}
