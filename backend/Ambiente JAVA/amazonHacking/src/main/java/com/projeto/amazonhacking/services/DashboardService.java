package com.projeto.amazonhacking.services;

import org.springframework.stereotype.Service;

import com.projeto.amazonhacking.dto.dashboard.GetDashboardDTO;
import com.projeto.amazonhacking.dto.dashboard.GetDashboardDTO.DistribuicaoScoreDTO;
import com.projeto.amazonhacking.repository.SafraRepository;

/**
 * Calcula as métricas agregadas exibidas na tela inicial do dashboard.
 */
@Service
public class DashboardService {

    private final SafraRepository safraRepository;

    public DashboardService(SafraRepository safraRepository) {
        this.safraRepository = safraRepository;
    }

    /**
     * Monta o resumo do dashboard com totais e distribuição de AgroScore.
     * @return DTO com safras ativas, score médio, área total e distribuição por faixa
     */
    public GetDashboardDTO obterResumo() {
        long safrasAtivas = safraRepository.count();

        Double media = safraRepository.mediaAgroScore();
        int agroScoreMedio = media == null ? 0 : (int) Math.round(media);

        Double area = safraRepository.somaAreaPlantada();
        double areaTotalHectares = area == null ? 0 : area;

        long excelente = safraRepository.contarPorFaixaScore(90, 100);
        long bom = safraRepository.contarPorFaixaScore(70, 89);
        long regular = safraRepository.contarPorFaixaScore(0, 69);

        return new GetDashboardDTO(
                safrasAtivas,
                agroScoreMedio,
                areaTotalHectares,
                new DistribuicaoScoreDTO(excelente, bom, regular));
    }
}
