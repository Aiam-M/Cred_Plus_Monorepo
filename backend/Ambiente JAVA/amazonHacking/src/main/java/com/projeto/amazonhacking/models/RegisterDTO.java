package com.projeto.amazonhacking.models;

import java.time.LocalDate;

/**
 * Dados enviados pelo app no cadastro de um novo produtor.
 *
 * @param nome            Nome completo do produtor
 * @param email           Email de acesso
 * @param passwordHash    Senha em texto puro (o hash BCrypt é feito no servidor)
 * @param associacaoId    ID da associação à qual o produtor pertence
 * @param role            Papel no sistema (normalmente PRODUTOR)
 * @param cpf             CPF do produtor (formato: 000.000.000-00)
 * @param dataNascimento  Data de nascimento (validação de ≥ 18 anos no frontend)
 * @param municipio       Município onde o produtor atua
 * @param estado          UF do município (ex: PA)
 */
public record RegisterDTO(
        String nome,
        String email,
        String passwordHash,
        int associacaoId,
        UsuarioRole role,
        String cpf,
        LocalDate dataNascimento,
        String municipio,
        String estado
) {
}
