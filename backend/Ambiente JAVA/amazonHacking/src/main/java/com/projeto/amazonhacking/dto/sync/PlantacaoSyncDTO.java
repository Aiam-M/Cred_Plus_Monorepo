package com.projeto.amazonhacking.dto.sync;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Dados de uma plantação enviados pelo app na sincronização.
 * Ex.: Cacau, 500, KG.
 */
public record PlantacaoSyncDTO(
        @NotBlank(message = "tipo é obrigatório")
        String tipo,

        @NotNull(message = "quantidade é obrigatória")
        @Positive(message = "quantidade deve ser maior que zero")
        Double quantidade,

        @NotBlank(message = "unidade é obrigatória")
        String unidade
) {
}
