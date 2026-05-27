package com.projeto.amazonhacking.dto.sync;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Uma safra cadastrada offline e enviada para o backend.
 * O localId é o UUID gerado no app — chave de idempotência da sincronização.
 */
public record SafraSyncItemDTO(
        @NotNull(message = "localId é obrigatório")
        UUID localId,

        @NotBlank(message = "nome é obrigatório")
        String nome,

        @NotNull(message = "areaHectares é obrigatória")
        @Positive(message = "areaHectares deve ser maior que zero")
        Double areaHectares,

        @NotEmpty(message = "a safra precisa de ao menos uma plantação")
        @Valid
        List<PlantacaoSyncDTO> plantacoes
) {
}
