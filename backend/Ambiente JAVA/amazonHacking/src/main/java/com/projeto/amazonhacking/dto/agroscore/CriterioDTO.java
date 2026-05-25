package com.projeto.amazonhacking.dto.agroscore;

/**
 * Um critério avaliado no AgroScore.
 * status assume "aprovado", "parcial" ou "reprovado"; icone é o emoji correspondente.
 */
public record CriterioDTO(
        int id,
        String nome,
        int pontos,
        int pontosMaximos,
        String status,
        String justificativa,
        String icone
) {
}
