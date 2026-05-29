package com.projeto.amazonhacking.models;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Dados enviados pelo app no cadastro de um novo produtor.
 *
 * Observação de segurança: o papel (role) NÃO vem do cliente. Todo cadastro por
 * este endpoint público é sempre um produtor (UsuarioRole.USER), definido no
 * servidor. Aceitar role do corpo permitiria que qualquer um se cadastrasse como
 * ADMIN (escalonamento de privilégio).
 *
 * @param nome            Nome completo do produtor
 * @param email           Email de acesso
 * @param passwordHash    Senha em texto puro (o hash BCrypt é feito no servidor)
 * @param associacaoId    ID da associação à qual o produtor pertence
 * @param cpf             CPF do produtor (formato: 000.000.000-00)
 * @param dataNascimento  Data de nascimento (validação de ≥ 18 anos no frontend)
 * @param municipio       Município onde o produtor atua
 * @param estado          UF do município (ex: PA)
 */
public record RegisterDTO(
        @NotBlank(message = "nome é obrigatório")
        String nome,

        @NotBlank(message = "email é obrigatório")
        @Email(message = "email inválido")
        String email,

        @NotBlank(message = "senha é obrigatória")
        @Size(min = 8, message = "a senha deve ter pelo menos 8 caracteres")
        String passwordHash,

        int associacaoId,
        String cpf,
        LocalDate dataNascimento,
        String municipio,
        String estado
) {
}
