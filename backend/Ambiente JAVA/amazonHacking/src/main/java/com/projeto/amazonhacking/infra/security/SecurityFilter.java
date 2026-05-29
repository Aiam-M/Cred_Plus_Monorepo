package com.projeto.amazonhacking.infra.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.projeto.amazonhacking.models.ContaAutenticavel;
import com.projeto.amazonhacking.services.AuthorizationService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    TokenService tokenService;

    // Carrega o usuário na tabela certa (produtor x empresa) a partir do tipo do token.
    @Autowired
    AuthorizationService authorizationService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        var token = this.recoverToken(request);
        if (token != null) {
            var dados = tokenService.validateToken(token);
            // Token inválido/expirado devolve null: nesse caso não autentica.
            if (dados != null && dados.email() != null && !dados.email().isEmpty()) {
                // Usa o tipo do token para buscar na tabela correta. Assim um token
                // de empresa nunca vira produtor (ROLE_USER) por colisão de email.
                UserDetails user = authorizationService.carregarPorEmailETipo(dados.email(), dados.tipo());
                if (user != null && versaoConfere(user, dados.versao())) {
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // Usuário não existe mais OU o token foi invalidado por troca de
                    // senha (versão não confere): segue sem autenticar. O endpoint
                    // protegido responderá 403.
                    SecurityContextHolder.clearContext();
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    // Confere se a versão gravada no token bate com a versão atual da conta.
    // Tokens antigos sem o claim "ver" (versao == null) são aceitos durante a
    // transição — expiram em no máximo 2h.
    private boolean versaoConfere(UserDetails user, Integer versaoToken) {
        if (versaoToken == null) return true;
        if (user instanceof ContaAutenticavel conta) {
            return conta.getTokenVersion() == versaoToken;
        }
        return true;
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        // Só aceita o formato correto "Bearer <token>". O replace() antigo
        // substituía "Bearer " em qualquer posição, podendo corromper o token.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7);
    }
}
