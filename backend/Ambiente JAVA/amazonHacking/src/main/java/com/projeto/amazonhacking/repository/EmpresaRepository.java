package com.projeto.amazonhacking.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projeto.amazonhacking.models.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {

    Optional<Empresa> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCnpj(String cnpj);
}
