package com.projeto.amazonhacking.services;

import com.google.auth.oauth2.GoogleCredentials;
import com.projeto.amazonhacking.dto.gee.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import tools.jackson.databind.ObjectMapper;

@Service
public class GeeService {

    private static final Logger log = LoggerFactory.getLogger(GeeService.class);

    // Mensagem genérica devolvida ao chamador. Os detalhes (status, body, stack)
    // ficam só no log do servidor — não vazam caminhos/versões do serviço externo.
    private static final String ERRO_GENERICO = "Serviço de validação ambiental indisponível";

    @Value("${gee.python-url}")
    private String pythonServiceUrl;

    @Value("${gee.timeout-seconds}")
    private int timeoutSeconds;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeeService(HttpClient httpClient, ObjectMapper objectMapper){
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Busca todos os dados ambientais de Jutaiteua do microserviço Python GEE.
     * A requisição pode demorar até {@code gee.timeout-seconds} segundos
     * dependendo do tempo de processamento do serviço externo.
     *
     * @return dados ambientais completos (série NDVI, Hansen, etc.)
     * @throws RuntimeException se o serviço Python retornar erro HTTP ou não responder no tempo limite
     */
    public GeeDataDTO buscarDadosCompletos() {
        String url = pythonServiceUrl + "/gee/jutaiteua/completo";

        HttpResponse<String> response;
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .build();

            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            log.error("Falha ao chamar o serviço GEE em {}", url, e);
            throw new RuntimeException(ERRO_GENERICO);
        }

        if (response.statusCode() != 200) {
            // Status e body só no log interno (podem revelar paths/versões do serviço).
            log.error("Serviço GEE retornou status {} - body: {}", response.statusCode(), response.body());
            throw new RuntimeException(ERRO_GENERICO);
        }

        try {
            return objectMapper.readValue(response.body(), GeeDataDTO.class);
        } catch (Exception e) {
            log.error("Falha ao interpretar a resposta do serviço GEE", e);
            throw new RuntimeException(ERRO_GENERICO);
        }
    }

    /**
     * Verifica se o microserviço Python está online.
     *
     * Útil para health check do sistema.
     */
    public boolean isGeeServiceOnline() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(pythonServiceUrl + "/health"))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            return response.statusCode() == 200;

        } catch (Exception e) {
            return false;
        }
    }

}
