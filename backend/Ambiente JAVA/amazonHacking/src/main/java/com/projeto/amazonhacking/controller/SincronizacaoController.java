package com.projeto.amazonhacking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.dto.sync.SincronizacaoRequestDTO;
import com.projeto.amazonhacking.dto.sync.SincronizacaoResponseDTO;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.services.SincronizacaoService;

import jakarta.validation.Valid;

/**
 * Recebe as safras cadastradas offline pelo app do produtor.
 * Caminho completo (com context-path): /cred/sync
 * Exige ROLE_USER (configurado no SecurityConfigurations).
 */
@RestController
@RequestMapping("/sync")
public class SincronizacaoController {

    private final SincronizacaoService sincronizacaoService;

    public SincronizacaoController(SincronizacaoService sincronizacaoService) {
        this.sincronizacaoService = sincronizacaoService;
    }

    /**
     * Sincroniza o lote de safras pendentes. O produtor vem do token JWT,
     * nunca do corpo da requisição — assim ninguém cadastra safra em nome de outro.
     */
    @PostMapping
    public ResponseEntity<SincronizacaoResponseDTO> sincronizar(
            @RequestBody @Valid SincronizacaoRequestDTO request,
            @AuthenticationPrincipal Usuario produtor) {
        return ResponseEntity.ok(sincronizacaoService.sincronizar(produtor, request));
    }
}
