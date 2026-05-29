package com.projeto.amazonhacking.dto.sync;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Dados de uma plantação enviados pelo app na sincronização.
 * Ex.: Cacau, 500, KG.
 */
public record PlantacaoSyncDTO(
        @NotBlank(message = "tipo é obrigatório")
        @Size(max = 100, message = "tipo deve ter no máximo 100 caracteres")
        String tipo,

        @NotNull(message = "quantidade é obrigatória")
        @Positive(message = "quantidade deve ser maior que zero")
        @DecimalMax(value = "10000000.0", message = "quantidade fora do limite aceito")
        Double quantidade,

        @NotBlank(message = "unidade é obrigatória")
        @Size(max = 20, message = "unidade deve ter no máximo 20 caracteres")
        String unidade
) {
}
