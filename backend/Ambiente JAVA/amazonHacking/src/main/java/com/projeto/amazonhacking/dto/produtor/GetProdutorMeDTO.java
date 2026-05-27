package com.projeto.amazonhacking.dto.produtor;

/**
 * Dados do produtor autenticado retornados pelo endpoint GET /cred/produtor/me.
 * Usado pelo app mobile para exibir o perfil real em vez de dados mockados.
 *
 * @param id             UUID do produtor (como String para facilitar o frontend)
 * @param nome           Nome completo do produtor
 * @param email          Email de login
 * @param role           Papel no sistema (ex: PRODUTOR)
 * @param associacaoId   ID da associação à qual pertence
 * @param nomeAssociacao Nome completo da associação
 * @param municipio      Município da associação
 * @param estado         UF da associação (ex: PA)
 */
public record GetProdutorMeDTO(
        String id,
        String nome,
        String email,
        String role,
        int associacaoId,
        String nomeAssociacao,
        String municipio,
        String estado
) {
}
