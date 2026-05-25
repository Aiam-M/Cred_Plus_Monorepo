package com.projeto.amazonhacking.dto.gee;

public record IndicesAnuaisDTO(
        //Todos os dados anuais
        int ano,
        double ndvi,
        double evi,
        double savi,
        double nbr,
        double ndwi
) {
}
