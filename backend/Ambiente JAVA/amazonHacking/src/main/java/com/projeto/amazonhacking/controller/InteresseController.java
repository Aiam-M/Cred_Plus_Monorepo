package com.projeto.amazonhacking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.dto.interesse.GetInteresseDTO;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.services.InteresseService;

/**
 * Interesses demonstrados pela empresa autenticada (tela "Meus Interesses").
 * Caminho completo (com context-path): /api/interesses/...
 */
@RestController
@RequestMapping("/interesses")
public class InteresseController {

    private final InteresseService interesseService;

    public InteresseController(InteresseService interesseService) {
        this.interesseService = interesseService;
    }

    /**
     * Lista os interesses da empresa autenticada.
     */
    @GetMapping("/meus")
    public ResponseEntity<List<GetInteresseDTO>> meus(@AuthenticationPrincipal Empresa empresa) {
        return ResponseEntity.ok(interesseService.listarPorEmpresa(empresa.getId()));
    }
}
