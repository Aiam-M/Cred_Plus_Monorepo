package com.projeto.amazonhacking.dto.interesse;

import java.time.LocalDateTime;

/**
 * Interesse exibido na tela "Meus Interesses".
 * O status já vem traduzido para exibição (ex.: "Aguardando Contato").
 */
public record GetInteresseDTO(
        Integer id,
        Integer safraId,
        String safraNome,
        String produtor,
        String associacao,
        LocalDateTime data,
        String status
) {
}
