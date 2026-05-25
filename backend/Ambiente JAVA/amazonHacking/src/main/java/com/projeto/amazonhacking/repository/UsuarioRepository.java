package com.projeto.amazonhacking.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.projeto.amazonhacking.models.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID>{
    UserDetails findByEmail(String email);
}
