package com.projeto.amazonhacking.infra.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Limita as requisições aos endpoints públicos de login e cadastro por IP, para
 * dificultar brute force de senha e cadastro em massa.
 *
 * Usa um token bucket por IP guardado em memória: cada requisição gasta uma ficha
 * e, quando acabam, responde 429 até o balde reencher. Como a contagem é só em
 * memória, isso vale por instância; num único servidor já resolve.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    // Máximo de tentativas por IP dentro da janela de tempo.
    private static final int MAX_TENTATIVAS = 10;
    private static final Duration JANELA = Duration.ofMinutes(1);

    // Endpoints protegidos pelo limite (caminhos sem o context-path /cred).
    private static final Set<String> CAMINHOS_LIMITADOS = Set.of(
            "/auth/login",
            "/auth/register",
            "/auth/empresa/login",
            "/auth/empresa/cadastro");

    // Um balde por IP. ConcurrentHashMap porque várias requisições chegam em paralelo.
    private final Map<String, Bucket> baldesPorIp = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!ehCaminhoLimitado(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = request.getRemoteAddr();
        Bucket balde = baldesPorIp.computeIfAbsent(ip, chave -> criarBalde());

        if (balde.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                    "{\"status\":429,\"mensagem\":\"Muitas tentativas. Aguarde um instante e tente novamente.\"}");
        }
    }

    // Só limita POST nos caminhos de login/cadastro. O resto passa direto.
    private boolean ehCaminhoLimitado(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && CAMINHOS_LIMITADOS.contains(request.getServletPath());
    }

    private Bucket criarBalde() {
        Bandwidth limite = Bandwidth.classic(MAX_TENTATIVAS, Refill.greedy(MAX_TENTATIVAS, JANELA));
        return Bucket.builder().addLimit(limite).build();
    }
}
