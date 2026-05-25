package com.projeto.amazonhacking.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.projeto.amazonhacking.dto.rastreabilidade.EventoRastreabilidadeDTO;
import com.projeto.amazonhacking.dto.rastreabilidade.GetRastreabilidadeDTO;
import com.projeto.amazonhacking.infra.exception.RecursoNaoEncontradoException;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.models.TipoEventoRastreabilidade;
import com.projeto.amazonhacking.models.TraceabilityEvent;
import com.projeto.amazonhacking.repository.SafraRepository;
import com.projeto.amazonhacking.repository.TraceabilityEventRepository;

import tools.jackson.databind.ObjectMapper;

/**
 * Cuida da cadeia de rastreabilidade (estilo blockchain) de cada safra.
 *
 * Cada evento recebe um hash SHA-256 calculado a partir do seu conteúdo somado
 * ao hash do evento anterior. Assim, alterar um evento antigo quebraria toda a
 * cadeia a partir dele — é isso que dá a garantia de imutabilidade.
 */
@Service
public class TraceabilityService {

    private final TraceabilityEventRepository eventRepository;
    private final SafraRepository safraRepository;
    private final ObjectMapper objectMapper;

    public TraceabilityService(TraceabilityEventRepository eventRepository,
                               SafraRepository safraRepository,
                               ObjectMapper objectMapper) {
        this.eventRepository = eventRepository;
        this.safraRepository = safraRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Monta a cadeia de rastreabilidade de uma safra para o dashboard.
     * @param safraId identificador da safra
     * @return eventos da cadeia + indicação se ela está íntegra
     * @throws RecursoNaoEncontradoException se a safra não existir
     */
    public GetRastreabilidadeDTO buscarCadeia(Integer safraId) {
        if (!safraRepository.existsById(safraId)) {
            throw new RecursoNaoEncontradoException("Safra não encontrada");
        }

        List<TraceabilityEvent> eventos = eventRepository.findBySafra_IdOrderByCreatedAtAsc(safraId);
        boolean cadeiaValida = verificarIntegridade(eventos);

        List<EventoRastreabilidadeDTO> eventosDTO = eventos.stream()
                .map(this::toDTO)
                .toList();

        return new GetRastreabilidadeDTO(cadeiaValida, LocalDateTime.now(), eventosDTO);
    }

    /**
     * Cria e persiste um novo evento na cadeia da safra, calculando o hash
     * encadeado a partir do último evento existente.
     * @param safra safra dona do evento
     * @param tipo código do tipo (ex.: CADASTRO_INICIAL)
     * @param dados pares chave/valor com dados do evento (serializados como JSON)
     * @param responsavel quem gerou o evento
     * @param responsavelTipo categoria do responsável (PRODUTOR, SISTEMA, etc.)
     * @param observacao texto livre opcional
     * @return o evento criado
     */
    public TraceabilityEvent criarEvento(Safra safra, String tipo, Map<String, Object> dados,
                                         String responsavel, String responsavelTipo, String observacao) {
        return criarEvento(safra, tipo, dados, responsavel, responsavelTipo, observacao, LocalDateTime.now());
    }

    /**
     * Mesma criação de evento, mas com data explícita. Útil para registrar eventos
     * com a data em que de fato ocorreram (ex.: ao popular dados históricos).
     */
    public TraceabilityEvent criarEvento(Safra safra, String tipo, Map<String, Object> dados,
                                         String responsavel, String responsavelTipo, String observacao,
                                         LocalDateTime data) {
        List<TraceabilityEvent> existentes = eventRepository.findBySafra_IdOrderByCreatedAtAsc(safra.getId());
        String hashAnterior = existentes.isEmpty() ? null : existentes.get(existentes.size() - 1).getHash();

        String dadosJson = escreverDados(dados);
        String hash = calcularHash(safra.getId(), tipo, dadosJson, hashAnterior, data);

        TraceabilityEvent evento = new TraceabilityEvent();
        evento.setSafra(safra);
        evento.setTipo(tipo);
        evento.setDados(dadosJson);
        evento.setHashAnterior(hashAnterior);
        evento.setHash(hash);
        evento.setResponsavel(responsavel);
        evento.setResponsavelTipo(responsavelTipo);
        evento.setObservacao(observacao);
        evento.setCreatedAt(data);

        return eventRepository.save(evento);
    }

    /**
     * Verifica a integridade do encadeamento: o primeiro evento não pode ter hash
     * anterior e cada evento seguinte deve apontar para o hash do evento anterior.
     * @param eventos eventos em ordem cronológica
     * @return true se a cadeia estiver íntegra
     */
    public boolean verificarIntegridade(List<TraceabilityEvent> eventos) {
        String hashAnteriorEsperado = null;
        for (TraceabilityEvent evento : eventos) {
            if (evento.getHash() == null || evento.getHash().isBlank()) {
                return false;
            }
            if (!Objects.equals(evento.getHashAnterior(), hashAnteriorEsperado)) {
                return false;
            }
            hashAnteriorEsperado = evento.getHash();
        }
        return true;
    }

    /**
     * Calcula o hash SHA-256 de um evento a partir do seu conteúdo e do hash anterior.
     */
    public String calcularHash(Integer safraId, String tipo, String dadosJson,
                               String hashAnterior, LocalDateTime data) {
        String conteudo = safraId + "|" + tipo + "|" + dadosJson + "|"
                + (hashAnterior == null ? "" : hashAnterior) + "|" + data;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(conteudo.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Algoritmo SHA-256 indisponível", e);
        }
    }

    private EventoRastreabilidadeDTO toDTO(TraceabilityEvent evento) {
        TipoEventoRastreabilidade tipo = TipoEventoRastreabilidade.fromCodigo(evento.getTipo());
        String label = tipo != null ? tipo.getLabel() : evento.getTipo();
        String icone = tipo != null ? tipo.getIcone() : "•";
        String cor = tipo != null ? tipo.getCor() : "blue";

        return new EventoRastreabilidadeDTO(
                evento.getId(),
                evento.getTipo(),
                label,
                evento.getCreatedAt(),
                evento.getResponsavel(),
                evento.getResponsavelTipo(),
                evento.getObservacao(),
                lerDados(evento.getDados()),
                evento.getHash(),
                evento.getHashAnterior(),
                icone,
                cor);
    }

    private String escreverDados(Map<String, Object> dados) {
        if (dados == null || dados.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(dados);
        } catch (Exception e) {
            return "{}";
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> lerDados(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            // Dados em formato inesperado: não quebra a listagem da cadeia.
            return Map.of();
        }
    }
}
