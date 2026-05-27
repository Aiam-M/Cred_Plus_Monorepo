package com.projeto.amazonhacking.dto.sync;

import java.util.List;

/**
 * Resposta do POST /sync: um resultado por safra enviada.
 */
public record SincronizacaoResponseDTO(
        List<ResultadoItemDTO> resultados
) {
}
