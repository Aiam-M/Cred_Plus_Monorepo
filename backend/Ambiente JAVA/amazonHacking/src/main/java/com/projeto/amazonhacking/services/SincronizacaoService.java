package com.projeto.amazonhacking.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projeto.amazonhacking.dto.sync.PlantacaoSyncDTO;
import com.projeto.amazonhacking.dto.sync.ResultadoItemDTO;
import com.projeto.amazonhacking.dto.sync.SafraSyncItemDTO;
import com.projeto.amazonhacking.dto.sync.SincronizacaoRequestDTO;
import com.projeto.amazonhacking.dto.sync.SincronizacaoResponseDTO;
import com.projeto.amazonhacking.events.SafraCriadaEvent;
import com.projeto.amazonhacking.models.Plantacao;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.repository.PlantacaoRepository;
import com.projeto.amazonhacking.repository.SafraRepository;

/**
 * Recebe as safras cadastradas offline pelo app do produtor e as grava no banco.
 *
 * Garantias importantes:
 * - Idempotência: cada safra carrega um localId (UUID gerado no app). Se o mesmo
 *   localId já existir no banco, o cadastro NÃO é duplicado — apenas devolvemos
 *   JA_SINCRONIZADO. Isso protege contra reenvios causados por queda de rede.
 * - Segurança: a safra é sempre vinculada ao produtor autenticado (vindo do JWT),
 *   nunca a um id enviado pelo cliente. Assim ninguém cadastra safra em nome de outro.
 * - Atomicidade: todo o lote roda em uma transação. Se algo falhar, nada é gravado
 *   e o app reenvia depois (sem duplicar, graças ao localId).
 */
@Service
public class SincronizacaoService {

    // Status inicial de uma safra recém-sincronizada: aguardando a validação por satélite.
    private static final String STATUS_INICIAL = "AGUARDANDO_VALIDACAO_SATELITE";

    private final SafraRepository safraRepository;
    private final PlantacaoRepository plantacaoRepository;
    private final TraceabilityService traceabilityService;
    private final ApplicationEventPublisher eventPublisher;

    public SincronizacaoService(SafraRepository safraRepository,
                                PlantacaoRepository plantacaoRepository,
                                TraceabilityService traceabilityService,
                                ApplicationEventPublisher eventPublisher) {
        this.safraRepository = safraRepository;
        this.plantacaoRepository = plantacaoRepository;
        this.traceabilityService = traceabilityService;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Sincroniza um lote de safras enviadas pelo app.
     * @param produtor produtor autenticado (dono das safras)
     * @param request lote de safras pendentes
     * @return um resultado por safra, identificado pelo localId
     */
    @Transactional
    public SincronizacaoResponseDTO sincronizar(Usuario produtor, SincronizacaoRequestDTO request) {
        List<ResultadoItemDTO> resultados = new ArrayList<>();

        for (SafraSyncItemDTO item : request.safras()) {
            resultados.add(processarItem(produtor, item));
        }

        return new SincronizacaoResponseDTO(resultados);
    }

    /**
     * Processa uma única safra: se o localId já existir, devolve JA_SINCRONIZADO;
     * caso contrário, grava a safra, suas plantações e o evento inicial da cadeia.
     */
    private ResultadoItemDTO processarItem(Usuario produtor, SafraSyncItemDTO item) {
        Optional<Safra> existente = safraRepository.findByLocalId(item.localId());
        if (existente.isPresent()) {
            return new ResultadoItemDTO(item.localId(), "JA_SINCRONIZADO", existente.get().getId());
        }

        Safra safra = criarSafra(produtor, item);
        salvarPlantacoes(safra, item.plantacoes());
        registrarEventoInicial(produtor, safra, item);

        // Dispara o cálculo automático do AgroScore. O evento só é processado
        // após o commit desta transação e roda em segundo plano (ver AgroScoreAutomacaoService),
        // então não atrasa a resposta da sincronização para o produtor.
        eventPublisher.publishEvent(new SafraCriadaEvent(safra.getId()));

        return new ResultadoItemDTO(item.localId(), "SINCRONIZADO", safra.getId());
    }

    /**
     * Cria e persiste a entidade Safra vinculada ao produtor autenticado.
     */
    private Safra criarSafra(Usuario produtor, SafraSyncItemDTO item) {
        Safra safra = new Safra();
        safra.setProdutor(produtor);
        safra.setName(item.nome());
        safra.setAreaPlantacao(item.areaHectares());
        safra.setStatus(STATUS_INICIAL);
        safra.setLocalId(item.localId());
        safra.setCreatedAt(LocalDateTime.now());
        safra.setSyncedAt(LocalDateTime.now());
        return safraRepository.save(safra);
    }

    /**
     * Persiste as plantações informadas para a safra.
     */
    private void salvarPlantacoes(Safra safra, List<PlantacaoSyncDTO> plantacoes) {
        for (PlantacaoSyncDTO p : plantacoes) {
            Plantacao plantacao = new Plantacao();
            plantacao.setSafra(safra);
            plantacao.setTipo(p.tipo());
            plantacao.setQuantidade(p.quantidade());
            plantacao.setUnidade(p.unidade());
            plantacaoRepository.save(plantacao);
        }
    }

    /**
     * Registra o primeiro evento da cadeia de rastreabilidade (CADASTRO_INICIAL),
     * marcando a entrada da safra no sistema com hash SHA-256.
     */
    private void registrarEventoInicial(Usuario produtor, Safra safra, SafraSyncItemDTO item) {
        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("nome", item.nome());
        dados.put("areaHectares", item.areaHectares());
        dados.put("plantacoes", item.plantacoes());

        traceabilityService.criarEvento(
                safra,
                "CADASTRO_INICIAL",
                dados,
                produtor.getNome(),
                "PRODUTOR",
                "Safra cadastrada no app offline e sincronizada com o servidor");
    }
}
