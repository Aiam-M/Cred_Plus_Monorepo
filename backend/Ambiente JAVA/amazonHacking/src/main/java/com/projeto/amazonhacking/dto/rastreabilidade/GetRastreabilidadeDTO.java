package com.projeto.amazonhacking.dto.rastreabilidade;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cadeia de rastreabilidade completa de uma safra.
 * cadeiaValida indica se a verificação de integridade dos hashes passou.
 */
public record GetRastreabilidadeDTO(
        boolean cadeiaValida,
        LocalDateTime ultimaVerificacao,
        List<EventoRastreabilidadeDTO> eventos
) {
}
