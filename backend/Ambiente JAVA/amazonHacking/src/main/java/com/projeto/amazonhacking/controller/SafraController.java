package com.projeto.amazonhacking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.dto.agroscore.GetAgroScoreDTO;
import com.projeto.amazonhacking.dto.interesse.CriarInteresseDTO;
import com.projeto.amazonhacking.dto.interesse.GetInteresseDTO;
import com.projeto.amazonhacking.dto.rastreabilidade.GetRastreabilidadeDTO;
import com.projeto.amazonhacking.dto.safra.GetSafraDTO;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.services.AgroScoreService;
import com.projeto.amazonhacking.services.InteresseService;
import com.projeto.amazonhacking.services.SafraService;
import com.projeto.amazonhacking.services.TraceabilityService;

import jakarta.validation.Valid;

/**
 * Catálogo de safras consultado pelas empresas (dashboard).
 * Caminho completo (com context-path): /api/safras/...
 * Todos os endpoints exigem ROLE_EMPRESA (configurado no SecurityConfigurations).
 */
@RestController
@RequestMapping("/safras")
public class SafraController {

    private final SafraService safraService;
    private final AgroScoreService agroScoreService;
    private final TraceabilityService traceabilityService;
    private final InteresseService interesseService;

    public SafraController(SafraService safraService,
                           AgroScoreService agroScoreService,
                           TraceabilityService traceabilityService,
                           InteresseService interesseService) {
        this.safraService = safraService;
        this.agroScoreService = agroScoreService;
        this.traceabilityService = traceabilityService;
        this.interesseService = interesseService;
    }

    /**
     * Lista o catálogo de safras com filtros opcionais por tipo, score mínimo e status.
     */
    @GetMapping
    public ResponseEntity<List<GetSafraDTO>> listar(
            @RequestParam(required = false) List<String> tipos,
            @RequestParam(required = false) Integer scoreMin,
            @RequestParam(required = false) List<String> status) {
        return ResponseEntity.ok(safraService.listar(tipos, scoreMin, status));
    }

    /**
     * Detalhe de uma safra (aba Visão Geral).
     */
    @GetMapping("/{id}")
    public ResponseEntity<GetSafraDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(safraService.buscarPorId(id));
    }

    /**
     * Detalhamento do AgroScore da safra (aba AgroScore).
     */
    @GetMapping("/{id}/agroscore")
    public ResponseEntity<GetAgroScoreDTO> agroScore(@PathVariable Integer id) {
        return ResponseEntity.ok(agroScoreService.calcular(id));
    }

    /**
     * Cadeia de rastreabilidade da safra (aba Rastreabilidade).
     */
    @GetMapping("/{id}/rastreabilidade")
    public ResponseEntity<GetRastreabilidadeDTO> rastreabilidade(@PathVariable Integer id) {
        return ResponseEntity.ok(traceabilityService.buscarCadeia(id));
    }

    /**
     * Registra o interesse da empresa autenticada na safra.
     */
    @PostMapping("/{id}/interesse")
    public ResponseEntity<GetInteresseDTO> demonstrarInteresse(
            @PathVariable Integer id,
            @RequestBody @Valid CriarInteresseDTO dto,
            @AuthenticationPrincipal Empresa empresa) {
        GetInteresseDTO criado = interesseService.criar(id, empresa, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }
}
