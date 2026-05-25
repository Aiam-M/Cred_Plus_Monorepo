package com.projeto.amazonhacking.controller;

import com.projeto.amazonhacking.dto.gee.GeeDataDTO;
import com.projeto.amazonhacking.services.GeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/gee")
public class GeeController {

    private final GeeService geeService;

    public GeeController(GeeService geeService) {
        this.geeService = geeService;
    }

    /**
     * Health check do microserviço Python.
     *
     * GET /api/gee/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean online = geeService.isGeeServiceOnline();

        return ResponseEntity.ok(Map.of(
                "geeServiceOnline", online,
                "status", online ? "operational" : "degraded"
        ));
    }

    /**
     * Busca todos os dados ambientais.
     *
     * GET /api/gee/jutaiteua
     */
    @GetMapping("/jutaiteua")
    public ResponseEntity<GeeDataDTO> buscarDados() {
        try {
            GeeDataDTO dados = geeService.buscarDadosCompletos();
            return ResponseEntity.ok(dados);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
