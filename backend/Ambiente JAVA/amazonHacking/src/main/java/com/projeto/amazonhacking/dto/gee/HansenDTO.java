package com.projeto.amazonhacking.dto.gee;

public record HansenDTO(
        double cobertura2000,       // Cobertura arbórea média em 2000 (%)
        double anoMedioPerda,       // Ano médio de perda (0 = sem perda)
        int pixelsPerda2019_2023    // Total de pixels com perda 2019-2023
) {
}
