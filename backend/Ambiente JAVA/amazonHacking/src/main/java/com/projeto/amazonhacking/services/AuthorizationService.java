package com.projeto.amazonhacking.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.projeto.amazonhacking.infra.security.TokenService;
import com.projeto.amazonhacking.repository.EmpresaRepository;
import com.projeto.amazonhacking.repository.UsuarioRepository;

/**
 * Carrega o usuário autenticado pelo email. O sistema tem dois tipos de conta:
 * produtores (tabela users) e empresas (tabela empresas).
 *
 * - {@link #loadUserByUsername(String)} é usado no LOGIN (pelo AuthenticationManager),
 *   que ainda não conhece o tipo: procura produtor primeiro e, se não achar, empresa.
 * - {@link #carregarPorEmailETipo(String, String)} é usado no FILTRO de cada request,
 *   usando o tipo gravado no token para buscar na tabela certa — assim um token de
 *   empresa nunca é resolvido como produtor (e vice-versa), mesmo com emails iguais.
 */
@Service
public class AuthorizationService implements UserDetailsService {

    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    EmpresaRepository empresaRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserDetails produtor = usuarioRepository.findByEmail(email);
        if (produtor != null) {
            return produtor;
        }

        return empresaRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    /**
     * Carrega o usuário pelo email respeitando o tipo de conta do token.
     * @param email email do subject do token
     * @param tipo  "USER" (produtor) ou "EMPRESA"; tokens antigos sem tipo caem no
     *              comportamento anterior (produtor primeiro) durante a transição
     * @return o UserDetails correspondente, ou {@code null} se não existir mais
     */
    public UserDetails carregarPorEmailETipo(String email, String tipo) {
        if (TokenService.TIPO_EMPRESA.equals(tipo)) {
            return empresaRepository.findByEmail(email).orElse(null);
        }
        if (TokenService.TIPO_USER.equals(tipo)) {
            return usuarioRepository.findByEmail(email);
        }

        // Token sem claim "tipo" (emitido antes deste deploy): mantém o
        // comportamento antigo até expirar (no máximo 2h).
        UserDetails produtor = usuarioRepository.findByEmail(email);
        if (produtor != null) {
            return produtor;
        }
        return empresaRepository.findByEmail(email).orElse(null);
    }
}
