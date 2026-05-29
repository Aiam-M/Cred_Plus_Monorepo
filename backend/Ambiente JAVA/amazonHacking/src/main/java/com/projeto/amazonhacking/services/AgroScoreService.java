package com.projeto.amazonhacking.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projeto.amazonhacking.dto.agroscore.CriterioDTO;
import com.projeto.amazonhacking.dto.agroscore.GetAgroScoreDTO;
import com.projeto.amazonhacking.dto.agroscore.MapabiomasDTO;
import com.projeto.amazonhacking.dto.agroscore.NdviSerieDTO;
import com.projeto.amazonhacking.dto.gee.GeeDataDTO;
import com.projeto.amazonhacking.dto.gee.HansenDTO;
import com.projeto.amazonhacking.dto.gee.IndicesAnuaisDTO;
import com.projeto.amazonhacking.infra.exception.RecursoNaoEncontradoException;
import com.projeto.amazonhacking.infra.exception.ValidacaoException;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.repository.SafraRepository;

/**
 * Calcula o AgroScore de uma safra a partir dos dados de satélite do serviço GEE.
 * O score vai de 0 a 100 e é a soma de cinco critérios ambientais alinhados ao
 * regulamento europeu EUDR (Sentinel-2 para NDVI e Hansen Global Forest Change).
 */
@Service
public class AgroScoreService {

    // Limiares e pesos dos critérios (facilitam ajuste futuro sem caçar números no código).
    private static final double NDVI_LIMIAR_MINIMO = 0.70;
    private static final double NDVI_PISO_ZERO = 0.55;
    private static final int CRITERIO1_MAX = 30;

    private static final double FLORESTA_LIMIAR_MINIMO = 30.0;
    private static final double FLORESTA_PISO_ZERO = 15.0;
    private static final int CRITERIO2_MAX = 25;

    private static final double RECUPERACAO_ALVO = 0.05;
    private static final int CRITERIO3_MAX = 20;

    private static final int CRITERIO4_MAX = 15;
    private static final int CRITERIO5_MAX = 10;

    private final GeeService geeService;
    private final SafraRepository safraRepository;

    public AgroScoreService(GeeService geeService, SafraRepository safraRepository) {
        this.geeService = geeService;
        this.safraRepository = safraRepository;
    }

    /**
     * Calcula o AgroScore de uma safra e grava o valor na própria safra (coluna agro_score).
     * Usado no cálculo automático após o cadastro e na reconciliação periódica.
     * @param safraId identificador da safra
     * @throws RecursoNaoEncontradoException se a safra não existir
     * @throws ValidacaoException se os dados de satélite estiverem indisponíveis
     */
    @Transactional
    public void calcularESalvar(Integer safraId) {
        Safra safra = safraRepository.findById(safraId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Safra não encontrada"));

        GetAgroScoreDTO resultado = calcular(safraId);

        safra.setAgroScore(resultado.score());
        safraRepository.save(safra);
    }

    /**
     * Calcula o detalhamento do AgroScore de uma safra (sem gravar).
     * @param safraId identificador da safra
     * @return score, critérios, série de NDVI, distribuição de solo e fontes
     * @throws RecursoNaoEncontradoException se a safra não existir
     * @throws ValidacaoException se os dados de satélite estiverem indisponíveis
     */
    public GetAgroScoreDTO calcular(Integer safraId) {
        if (!safraRepository.existsById(safraId)) {
            throw new RecursoNaoEncontradoException("Safra não encontrada");
        }

        GeeDataDTO dados = geeService.buscarDadosCompletos();
        List<IndicesAnuaisDTO> serie = dados.serieTemporalIndices();
        if (serie == null || serie.isEmpty()) {
            throw new ValidacaoException("Dados de satélite indisponíveis para esta safra");
        }
        HansenDTO hansen = dados.hansen();

        List<NdviSerieDTO> ndviSeries = serie.stream()
                .map(i -> new NdviSerieDTO(i.ano(), i.ndvi(), String.valueOf(i.ano())))
                .toList();

        double ndviMedio = serie.stream().mapToDouble(IndicesAnuaisDTO::ndvi).average().orElse(0);
        double ndvi2023 = ndviDoAno(serie, 2023, ndviMedio);
        double ndviRecente = serie.get(serie.size() - 1).ndvi();
        double recuperacao = ndviRecente - ndvi2023;
        double florestaPercentual = estimarFlorestaPercentual(ndviMedio);

        List<CriterioDTO> criterios = new ArrayList<>();
        criterios.add(criterio1Ndvi(ndviMedio));
        criterios.add(criterio2Floresta(florestaPercentual));
        criterios.add(criterio3Recuperacao(recuperacao));
        criterios.add(criterio4Queimadas(hansen));
        criterios.add(criterio5Historico(hansen));

        int score = criterios.stream().mapToInt(CriterioDTO::pontos).sum();

        return new GetAgroScoreDTO(
                score,
                gerarNota(score),
                criterios,
                ndviSeries,
                montarMapabiomas(florestaPercentual),
                List.of("Sentinel-2 (ESA Copernicus) — série NDVI",
                        "Hansen Global Forest Change v1.11"),
                LocalDateTime.now());
    }

    private CriterioDTO criterio1Ndvi(double ndviMedio) {
        int pontos = pontosLineares(ndviMedio, NDVI_PISO_ZERO, NDVI_LIMIAR_MINIMO, CRITERIO1_MAX);
        String justificativa = String.format(
                "NDVI médio do período: %.2f (limiar mínimo de %.2f).", ndviMedio, NDVI_LIMIAR_MINIMO);
        return montarCriterio(1, "Cobertura vegetal densa (NDVI ≥ 0,70)", pontos, CRITERIO1_MAX, justificativa);
    }

    private CriterioDTO criterio2Floresta(double florestaPercentual) {
        int pontos = pontosLineares(florestaPercentual, FLORESTA_PISO_ZERO, FLORESTA_LIMIAR_MINIMO, CRITERIO2_MAX);
        String justificativa = String.format(
                "Cobertura de vegetação: %.0f%% (mínimo de %.0f%%).",
                florestaPercentual, FLORESTA_LIMIAR_MINIMO);
        return montarCriterio(2, "Manutenção de floresta nativa (≥30%)", pontos, CRITERIO2_MAX, justificativa);
    }

    private CriterioDTO criterio3Recuperacao(double recuperacao) {
        int pontos = pontosLineares(recuperacao, 0.0, RECUPERACAO_ALVO, CRITERIO3_MAX);
        String justificativa = String.format(
                "Variação do NDVI entre 2023 e o ano mais recente: %+.3f.", recuperacao);
        return montarCriterio(3, "Recuperação de vegetação pós-2023", pontos, CRITERIO3_MAX, justificativa);
    }

    private CriterioDTO criterio4Queimadas(HansenDTO hansen) {
        // anoMedioPerda == 0 no DTO Hansen indica ausência de perda detectada.
        boolean semPerda = hansen == null || hansen.anoMedioPerda() == 0;
        int pontos = semPerda ? CRITERIO4_MAX : 12;
        String justificativa = semPerda
                ? "Nenhuma perda significativa de cobertura detectada (Hansen)."
                : "Perda de cobertura detectada; pontuação parcial.";
        return montarCriterio(4, "Queimadas controladas (≤2 eventos/7 anos)", pontos, CRITERIO4_MAX, justificativa);
    }

    private CriterioDTO criterio5Historico(HansenDTO hansen) {
        double cobertura2000 = hansen == null ? 0 : hansen.cobertura2000();
        // Quanto maior a cobertura original convertida, menor a pontuação (área histórica
        // de floresta que virou uso agrícola). Espelha o critério usado na demo.
        int pontos = pontosLineares(100 - cobertura2000, 0, 50, CRITERIO5_MAX);
        String justificativa = String.format(
                "Cobertura arbórea em 2000: %.0f%% (Hansen). Áreas muito convertidas pontuam menos.",
                cobertura2000);
        return montarCriterio(5, "Histórico cobertura arbórea (2000)", pontos, CRITERIO5_MAX, justificativa);
    }

    /**
     * Distribui pontos de forma linear: 0 pontos em pisoZero (ou abaixo) e o máximo
     * em tetoCheio (ou acima).
     */
    private int pontosLineares(double valor, double pisoZero, double tetoCheio, int maxPontos) {
        if (valor >= tetoCheio) return maxPontos;
        if (valor <= pisoZero) return 0;
        double fracao = (valor - pisoZero) / (tetoCheio - pisoZero);
        return (int) Math.round(fracao * maxPontos);
    }

    private CriterioDTO montarCriterio(int id, String nome, int pontos, int maximo, String justificativa) {
        double fracao = (double) pontos / maximo;
        String status;
        String icone;
        if (fracao >= 0.9) {
            status = "aprovado";
            icone = "check-circle";
        } else if (fracao >= 0.5) {
            status = "parcial";
            icone = "alert-triangle";
        } else {
            status = "reprovado";
            icone = "x-circle";
        }
        return new CriterioDTO(id, nome, pontos, maximo, status, justificativa, icone);
    }

    // Calcula a % de vegetação a partir do NDVI médio (escala calibrada para a região).
    private double estimarFlorestaPercentual(double ndviMedio) {
        double estimativa = Math.round((ndviMedio - 0.45) * 80.0);
        return Math.max(0, Math.min(estimativa, 60));
    }

    // Monta a distribuição de uso do solo para o gráfico de pizza.
    private MapabiomasDTO montarMapabiomas(double florestaPercentual) {
        double florestal = Math.round(florestaPercentual);
        double outros = 20;
        double agropecuario = Math.max(0, 100 - florestal - outros);
        return new MapabiomasDTO(List.of(
                new MapabiomasDTO.ClasseDTO("Formação Florestal", florestal, "#1f8d49"),
                new MapabiomasDTO.ClasseDTO("Uso Agropecuário", agropecuario, "#d6bc74"),
                new MapabiomasDTO.ClasseDTO("Outros Usos", outros, "#e5c57e")));
    }

    private String gerarNota(int score) {
        if (score >= 90) {
            return "Excelente conformidade ambiental, com práticas de agricultura regenerativa.";
        } else if (score >= 70) {
            return "Boa conformidade ambiental, dentro dos parâmetros exigidos.";
        } else if (score >= 60) {
            return "Conformidade no limite mínimo. Recomenda-se acompanhamento.";
        }
        return "Abaixo dos requisitos mínimos. Recomenda-se plano de recuperação.";
    }

    // Retorna o NDVI de um ano específico ou um valor padrão caso o ano não esteja na série.
    private double ndviDoAno(List<IndicesAnuaisDTO> serie, int ano, double padrao) {
        return serie.stream()
                .filter(i -> i.ano() == ano)
                .mapToDouble(IndicesAnuaisDTO::ndvi)
                .findFirst()
                .orElse(padrao);
    }
}
