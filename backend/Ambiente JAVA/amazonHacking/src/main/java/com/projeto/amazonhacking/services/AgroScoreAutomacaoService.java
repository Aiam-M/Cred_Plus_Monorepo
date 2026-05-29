package com.projeto.amazonhacking.services;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.projeto.amazonhacking.events.SafraCriadaEvent;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.repository.SafraRepository;

/**
 * Mantém o AgroScore das safras sempre preenchido, em duas camadas:
 *
 *  1. Cálculo imediato: ao receber o evento SafraCriadaEvent (disparado logo após
 *     o cadastro), calcula o score em uma thread separada (@Async). Assim o produtor
 *     não espera o serviço Python responder durante a sincronização.
 *
 *  2. Reconciliação periódica: de tempos em tempos procura safras que ficaram sem
 *     score (ex.: o serviço Python estava fora do ar no cadastro) e tenta recalcular.
 *     É a rede de segurança que garante que nenhuma safra fique esquecida sem score.
 */
@Service
public class AgroScoreAutomacaoService {

    private static final Logger log = LoggerFactory.getLogger(AgroScoreAutomacaoService.class);

    private final AgroScoreService agroScoreService;
    private final SafraRepository safraRepository;
    private final GeeService geeService;

    public AgroScoreAutomacaoService(AgroScoreService agroScoreService,
                                     SafraRepository safraRepository,
                                     GeeService geeService) {
        this.agroScoreService = agroScoreService;
        this.safraRepository = safraRepository;
        this.geeService = geeService;
    }

    /**
     * Calcula o AgroScore assim que uma safra é criada.
     *
     * Roda em thread separada (@Async) e somente depois que a transação do cadastro
     * tiver sido confirmada (AFTER_COMMIT) — assim a safra com certeza já existe no
     * banco quando formos calcular. Se o serviço Python falhar, apenas registramos o
     * erro: a safra fica sem score e o job de reconciliação tenta novamente depois.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void aoCriarSafra(SafraCriadaEvent evento) {
        try {
            agroScoreService.calcularESalvar(evento.safraId());
            log.info("AgroScore calculado para a safra {}", evento.safraId());
        } catch (Exception e) {
            log.warn("Não foi possível calcular o AgroScore da safra {} agora: {}. "
                    + "Será reprocessada pelo job de reconciliação.",
                    evento.safraId(), e.getMessage());
        }
    }

    /**
     * Rede de segurança: procura safras sem AgroScore e tenta recalcular.
     * Roda em intervalos fixos (configurável em agroscore.reconciliacao.intervalo-ms).
     * Se o serviço Python estiver offline, encerra o ciclo sem tentar — evita uma
     * sequência de erros e simplesmente espera o próximo ciclo.
     */
    @Scheduled(fixedDelayString = "${agroscore.reconciliacao.intervalo-ms:300000}")
    public void reprocessarSafrasSemScore() {
        List<Safra> pendentes = safraRepository.findByAgroScoreIsNull();
        if (pendentes.isEmpty()) {
            return;
        }

        if (!geeService.isGeeServiceOnline()) {
            log.warn("{} safra(s) sem AgroScore, mas o serviço GEE/Python está offline. "
                    + "Tentaremos no próximo ciclo.", pendentes.size());
            return;
        }

        log.info("Reprocessando AgroScore de {} safra(s) pendente(s).", pendentes.size());
        for (Safra safra : pendentes) {
            try {
                agroScoreService.calcularESalvar(safra.getId());
            } catch (Exception e) {
                log.warn("Falha ao recalcular AgroScore da safra {}: {}", safra.getId(), e.getMessage());
            }
        }
    }
}
