package com.projeto.amazonhacking.services;

import com.google.auth.oauth2.GoogleCredentials;
import com.projeto.amazonhacking.dto.gee.*;
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

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                throw new RuntimeException(
                        "Erro no serviço GEE - Status: " + response.statusCode()
                                + " - Body: " + response.body()
                );
            }

            return objectMapper.readValue(response.body(), GeeDataDTO.class);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Erro ao buscar dados do GEE: " + e.getMessage(), e
            );
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
