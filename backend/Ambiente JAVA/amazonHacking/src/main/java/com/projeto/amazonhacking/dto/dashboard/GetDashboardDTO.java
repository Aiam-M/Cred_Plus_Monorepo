package com.projeto.amazonhacking.dto.dashboard;

/**
 * Métricas gerais exibidas na tela inicial do dashboard de empresas.
 */
public record GetDashboardDTO(
        long safrasAtivas,
        int agroScoreMedio,
        double areaTotalHectares,
        DistribuicaoScoreDTO distribuicaoScore
) {

    /**
     * Quantidade de safras por faixa de AgroScore.
     * Excelente: 90-100 | Bom: 70-89 | Regular: abaixo de 70.
     */
    public record DistribuicaoScoreDTO(
            long excelente,
            long bom,
            long regular
    ) {
    }
}
