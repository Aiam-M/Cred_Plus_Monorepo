package com.projeto.amazonhacking.dto.sync;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Uma safra cadastrada offline e enviada para o backend.
 * O localId é o UUID gerado no app — chave de idempotência da sincronização.
 */
public record SafraSyncItemDTO(
        @NotNull(message = "localId é obrigatório")
        UUID localId,

        @NotBlank(message = "nome é obrigatório")
        @Size(max = 250, message = "nome deve ter no máximo 250 caracteres")
        String nome,

        @NotNull(message = "areaHectares é obrigatória")
        @Positive(message = "areaHectares deve ser maior que zero")
        @DecimalMax(value = "100000.0", message = "areaHectares fora do limite aceito")
        Double areaHectares,

        @NotEmpty(message = "a safra precisa de ao menos uma plantação")
        @Size(max = 50, message = "máximo de 50 plantações por safra")
        @Valid
        List<PlantacaoSyncDTO> plantacoes
) {
}
