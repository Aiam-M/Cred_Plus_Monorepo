package com.projeto.amazonhacking.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.projeto.amazonhacking.models.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID>{
    UserDetails findByEmail(String email);

    /**
     * Busca o produtor pelo id já com a associação carregada (eager).
     * Necessário porque open-in-view=false impede lazy loading fora de uma transação.
     * O @EntityGraph faz um LEFT JOIN na query, trazendo tudo de uma vez.
     */
    @EntityGraph(attributePaths = {"associacao"})
    Optional<Usuario> findWithAssociacaoById(UUID id);
}
