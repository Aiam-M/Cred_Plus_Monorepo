package com.projeto.amazonhacking.dto.interesse;

import java.time.LocalDateTime;

/**
 * Interesse de uma empresa, no formato exibido para o PRODUTOR no app dele.
 * Mostra apenas o nome da empresa — sem email, sem id, sem nenhum outro dado
 * sensível — porque o produtor não precisa (e não deve) conhecer detalhes
 * internos da empresa compradora.
 */
public record GetInteresseProdutorDTO(
        Integer id,
        Integer safraId,
        String safraNome,
        String nomeEmpresa,
        String mensagem,
        LocalDateTime data,
        String status,
        boolean lida
) {
}
