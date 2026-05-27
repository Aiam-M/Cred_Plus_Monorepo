package com.projeto.amazonhacking.dto.empresa;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Dados editáveis do perfil da empresa (nome, segmento e e-mail).
 * O CNPJ é imutável após o cadastro e nunca aparece neste DTO.
 */
public record EmpresaAtualizarDTO(
        @NotBlank(message = "O nome da empresa é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String nome,

        @NotBlank(message = "O segmento é obrigatório")
        String segmento,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email
) {
}
