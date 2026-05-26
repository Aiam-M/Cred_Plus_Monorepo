package com.projeto.amazonhacking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.dto.empresa.EmpresaCadastroDTO;
import com.projeto.amazonhacking.dto.empresa.EmpresaLoginDTO;
import com.projeto.amazonhacking.dto.empresa.EmpresaLoginResponseDTO;
import com.projeto.amazonhacking.dto.empresa.GetEmpresaDTO;
import com.projeto.amazonhacking.infra.security.TokenService;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.services.EmpresaService;

import jakarta.validation.Valid;

/**
 * Autenticação e cadastro das empresas compradoras (dashboard).
 * Caminho completo (com context-path): /api/auth/empresa/...
 */
@RestController
@RequestMapping("/auth/empresa")
public class EmpresaAuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final EmpresaService empresaService;

    public EmpresaAuthController(AuthenticationManager authenticationManager,
                                 TokenService tokenService,
                                 EmpresaService empresaService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.empresaService = empresaService;
    }

    /**
     * Autentica a empresa e devolve um token JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<EmpresaLoginResponseDTO> login(@RequestBody @Valid EmpresaLoginDTO data) {
        var credenciais = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = authenticationManager.authenticate(credenciais);

        Empresa empresa = (Empresa) auth.getPrincipal();
        String token = tokenService.generateToken(empresa);

        return ResponseEntity.ok(new EmpresaLoginResponseDTO(
                token, empresa.getNome(), empresa.getEmail(), empresa.getCnpj(), empresa.getSegmento()));
    }

    /**
     * Cadastra uma nova empresa.
     */
    @PostMapping("/cadastro")
    public ResponseEntity<GetEmpresaDTO> cadastrar(@RequestBody @Valid EmpresaCadastroDTO data) {
        GetEmpresaDTO empresa = empresaService.cadastrar(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(empresa);
    }
}
