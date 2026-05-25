package com.projeto.amazonhacking.dto.agroscore;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Detalhamento completo do AgroScore de uma safra, exibido na aba AgroScore.
 */
public record GetAgroScoreDTO(
        int score,
        String nota,
        List<CriterioDTO> criterios,
        List<NdviSerieDTO> ndviSeries,
        MapabiomasDTO mapabiomas,
        List<String> fontesDados,
        LocalDateTime dataAtualizacao
) {
}
