package com.projeto.amazonhacking.dto.empresa;

import java.util.UUID;

/**
 * Dados públicos de uma empresa (nunca inclui a senha).
 */
public record GetEmpresaDTO(
        UUID id,
        String cnpj,
        String email,
        String segmento
) {
}
