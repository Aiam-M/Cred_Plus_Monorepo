package com.projeto.amazonhacking.dto.agroscore;

/**
 * Ponto da série temporal de NDVI (um valor por ano).
 */
public record NdviSerieDTO(
        int ano,
        double ndvi,
        String label
) {
}
