package com.projeto.amazonhacking.dto.empresa;

/**
 * Resposta do login da empresa: token JWT e dados básicos para o dashboard exibir.
 */
public record EmpresaLoginResponseDTO(
        String token,
        String email,
        String cnpj,
        String segmento
) {
}
