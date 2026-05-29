package com.projeto.amazonhacking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.dto.empresa.AlterarSenhaDTO;
import com.projeto.amazonhacking.dto.empresa.EmpresaAtualizarDTO;
import com.projeto.amazonhacking.dto.empresa.GetEmpresaDTO;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.services.EmpresaService;

import jakarta.validation.Valid;

/**
 * Gestão do perfil da empresa autenticada.
 * Todos os endpoints exigem ROLE_EMPRESA (garantido pelo SecurityConfigurations).
 */
@RestController
@RequestMapping("/empresa")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    /**
     * Atualiza nome, segmento e e-mail da empresa autenticada.
     */
    @PutMapping
    public ResponseEntity<GetEmpresaDTO> atualizarDados(
            @AuthenticationPrincipal Empresa empresa,
            @RequestBody @Valid EmpresaAtualizarDTO dto) {
        GetEmpresaDTO atualizado = empresaService.atualizarDados(empresa.getId(), dto);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Altera a senha da empresa autenticada.
     * Retorna 204 (sem corpo): evita que o cliente tente fazer parse de JSON de
     * uma resposta que era só texto.
     */
    @PutMapping("/senha")
    public ResponseEntity<Void> alterarSenha(
            @AuthenticationPrincipal Empresa empresa,
            @RequestBody @Valid AlterarSenhaDTO dto) {
        empresaService.alterarSenha(empresa.getId(), dto);
        return ResponseEntity.noContent().build();
    }
}
