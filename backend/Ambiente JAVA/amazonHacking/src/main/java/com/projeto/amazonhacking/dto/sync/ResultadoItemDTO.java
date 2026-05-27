package com.projeto.amazonhacking.dto.sync;

import java.util.UUID;

/**
 * Resultado da sincronização de uma safra.
 * O app usa o localId para casar o resultado com o registro local e atualizar
 * o status conforme o campo "status":
 *  - SINCRONIZADO     -> salva agora no backend
 *  - JA_SINCRONIZADO  -> localId já existia (envio repetido); nada foi duplicado
 *  - ERRO             -> não foi possível salvar
 */
public record ResultadoItemDTO(
        UUID localId,
        String status,
        Integer servidorId
) {
}
