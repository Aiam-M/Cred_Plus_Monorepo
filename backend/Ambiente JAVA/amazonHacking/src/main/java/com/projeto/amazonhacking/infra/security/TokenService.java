package com.projeto.amazonhacking.infra.security;

import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.models.Usuario;

import jakarta.annotation.PostConstruct;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    // Emissor (issuer) do token. Precisa ser EXATAMENTE o mesmo na geração e na
    // validação; se divergir, a verificação falha e o usuário nunca é autenticado.
    private static final String ISSUER = "cred-plus-api";

    // Tamanho mínimo do segredo. Um segredo curto enfraquece a assinatura HMAC.
    private static final int TAMANHO_MINIMO_SECRET = 32;

    /**
     * Valida o segredo do JWT assim que a aplicação sobe. Sem isso, um JWT_SECRET
     * ausente ou muito curto só quebraria no primeiro login, e em produção isso
     * passaria despercebido até alguém tentar entrar.
     */
    @PostConstruct
    public void validarSecret() {
        if (secret == null || secret.length() < TAMANHO_MINIMO_SECRET) {
            throw new IllegalStateException(
                    "JWT_SECRET ausente ou muito curto: defina um segredo com pelo menos "
                            + TAMANHO_MINIMO_SECRET + " caracteres.");
        }
    }

    // Tipos de conta gravados no claim "tipo". Servem para o filtro saber em qual
    // tabela buscar o usuário (users x empresas) e evitar colisão de identidade
    // quando um produtor e uma empresa têm o mesmo email.
    public static final String TIPO_USER = "USER";
    public static final String TIPO_EMPRESA = "EMPRESA";

    /**
     * Dados extraídos de um token válido: email (subject), tipo de conta e a
     * versão do token. {@code versao} é null em tokens antigos sem o claim "ver".
     */
    public record DadosToken(String email, String tipo, Integer versao) {
    }

    public String generateToken(Usuario usuario){
        return gerarToken(usuario.getEmail(), TIPO_USER, usuario.getTokenVersion());
    }

    public String generateToken(Empresa empresa){
        return gerarToken(empresa.getEmail(), TIPO_EMPRESA, empresa.getTokenVersion());
    }

    // Gera o token JWT com o email (subject), o tipo de conta (claim "tipo") e a
    // versão do token (claim "ver"). Centraliza o formato para produtores e empresas.
    private String gerarToken(String subject, String tipo, int versao){
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String token = JWT.create()
                .withIssuer(ISSUER)
                .withSubject(subject)
                .withClaim("tipo", tipo)
                .withClaim("ver", versao)
                .withExpiresAt(genExpirationDate())
                .sign(algorithm);
            return token;
        }catch(JWTCreationException exception){
            throw new RuntimeException("error while generating token", exception);
        }
    }

    /**
     * Valida o token e devolve email + tipo + versão. Retorna {@code null} se o
     * token for inválido ou expirado (nesse caso o filtro não autentica ninguém).
     */
    public DadosToken validateToken(String token){
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            var jwt = JWT.require(algorithm)
                .withIssuer(ISSUER)
                .build()
                .verify(token);
            return new DadosToken(
                jwt.getSubject(),
                jwt.getClaim("tipo").asString(),
                jwt.getClaim("ver").asInt());
        }catch(JWTVerificationException exception){
            return null;
        }
    }

    // Expira em 2 horas a partir de agora. Usa Instant (UTC) para não depender do
    // fuso da JVM: no servidor (Render/Railway costuma rodar em UTC) o fuso fixo
    // -03:00 fazia o token expirar 3h antes do esperado.
    private Instant genExpirationDate(){
        return Instant.now().plus(Duration.ofHours(2));
    }
}
