package com.projeto.amazonhacking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.dto.dashboard.GetDashboardDTO;
import com.projeto.amazonhacking.services.DashboardService;

/**
 * Métricas gerais do dashboard de empresas.
 * Caminho completo (com context-path): /api/dashboard
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<GetDashboardDTO> obterResumo() {
        return ResponseEntity.ok(dashboardService.obterResumo());
    }
}
