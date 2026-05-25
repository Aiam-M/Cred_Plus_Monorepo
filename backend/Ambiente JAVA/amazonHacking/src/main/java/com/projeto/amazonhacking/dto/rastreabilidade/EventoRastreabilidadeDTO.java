package com.projeto.amazonhacking.dto.rastreabilidade;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Um evento da cadeia de rastreabilidade, no formato exibido pela timeline do dashboard.
 */
public record EventoRastreabilidadeDTO(
        UUID id,
        String tipo,
        String tipoLabel,
        LocalDateTime data,
        String responsavel,
        String responsavelTipo,
        String observacao,
        Map<String, Object> dados,
        String hash,
        String hashAnterior,
        String icone,
        String cor
) {
}
