package com.projeto.amazonhacking.infra.security;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.models.Usuario;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    // Emissor (issuer) do token. Precisa ser EXATAMENTE o mesmo na geração e na
    // validação; se divergir, a verificação falha e o usuário nunca é autenticado.
    private static final String ISSUER = "cred-plus-api";

    public String generateToken(Usuario usuario){
        return gerarToken(usuario.getEmail());
    }

    public String generateToken(Empresa empresa){
        return gerarToken(empresa.getEmail());
    }

    // Gera o token JWT a partir do email (subject). Centraliza a lógica para
    // produtores e empresas usarem o mesmo formato de token.
    private String gerarToken(String subject){
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String token = JWT.create()
                .withIssuer(ISSUER)
                .withSubject(subject)
                .withExpiresAt(genExpirationDate())
                .sign(algorithm);
            return token;
        }catch(JWTCreationException exception){
            throw new RuntimeException("error while generating token", exception);
        }
    }

    public String validateToken(String token){
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                .withIssuer(ISSUER)
                .build()
                .verify(token)
                .getSubject();
        }catch(JWTVerificationException exception){
            return "";

        }
    }

    private Instant genExpirationDate(){
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
