package com.projeto.amazonhacking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.infra.exception.ValidacaoException;
import com.projeto.amazonhacking.infra.security.TokenService;
import com.projeto.amazonhacking.models.AuthenticationDTO;
import com.projeto.amazonhacking.models.LoginResponseDTO;
import com.projeto.amazonhacking.models.RegisterDTO;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.models.UsuarioRole;
import com.projeto.amazonhacking.repository.AssociacaoRepository;
import com.projeto.amazonhacking.repository.UsuarioRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private AssociacaoRepository associacaoRepository;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data){
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.passwordHash());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((Usuario)auth.getPrincipal());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid RegisterDTO data){
        if(this.repository.findByEmail(data.email()) != null) return ResponseEntity.badRequest().build();

        // Valida a associação antes de salvar: sem isso, um id inexistente só
        // estouraria como violação de FK (500). Aqui vira um 400 com mensagem clara.
        if(!this.associacaoRepository.existsById(data.associacaoId())) {
            throw new ValidacaoException("Associação não encontrada");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.passwordHash());
        // O papel é SEMPRE USER. Nunca confiar em role vindo do cliente (evita
        // que alguém se cadastre como ADMIN por este endpoint público).
        Usuario newUsuario = new Usuario(data.nome(), data.email(), encryptedPassword, data.associacaoId(), UsuarioRole.USER);

        // Salva os campos adicionais de cadastro (opcionais — podem ser null).
        newUsuario.setCpf(data.cpf());
        newUsuario.setDataNascimento(data.dataNascimento());
        newUsuario.setMunicipio(data.municipio());
        newUsuario.setEstado(data.estado());

        this.repository.save(newUsuario);

        return ResponseEntity.ok().build();
    }
}
