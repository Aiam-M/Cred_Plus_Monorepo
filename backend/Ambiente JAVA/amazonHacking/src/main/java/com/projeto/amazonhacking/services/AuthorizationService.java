package com.projeto.amazonhacking.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.projeto.amazonhacking.repository.EmpresaRepository;
import com.projeto.amazonhacking.repository.UsuarioRepository;

/**
 * Carrega o usuário autenticado pelo email. O sistema tem dois tipos de conta:
 * produtores (tabela users) e empresas (tabela empresas). Este service procura
 * primeiro entre os produtores e, se não achar, entre as empresas.
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
}
