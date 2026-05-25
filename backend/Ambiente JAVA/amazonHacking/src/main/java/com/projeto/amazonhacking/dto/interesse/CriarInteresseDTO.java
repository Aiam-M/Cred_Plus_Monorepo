package com.projeto.amazonhacking.dto.interesse;

import jakarta.validation.constraints.Size;

/**
 * Dados enviados pela empresa ao demonstrar interesse em uma safra.
 * A mensagem é opcional; a empresa é identificada pelo token (não pelo corpo).
 */
public record CriarInteresseDTO(
        @Size(max = 1000, message = "A mensagem deve ter no máximo 1000 caracteres")
        String mensagem
) {
}
