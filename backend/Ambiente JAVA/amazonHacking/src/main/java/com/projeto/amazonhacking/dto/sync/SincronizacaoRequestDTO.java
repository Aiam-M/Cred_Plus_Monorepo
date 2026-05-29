package com.projeto.amazonhacking.dto.sync;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

/**
 * Corpo do POST /sync: lote de safras pendentes enviadas pelo app de uma só vez.
 */
public record SincronizacaoRequestDTO(
        @NotEmpty(message = "envie ao menos uma safra")
        @Size(max = 100, message = "máximo de 100 safras por lote")
        @Valid
        List<SafraSyncItemDTO> safras
) {
}
