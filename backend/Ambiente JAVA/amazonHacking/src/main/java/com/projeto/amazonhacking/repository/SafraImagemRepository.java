package com.projeto.amazonhacking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projeto.amazonhacking.models.SafraImagem;

public interface SafraImagemRepository extends JpaRepository<SafraImagem, Integer> {

    /**
     * Lista as imagens de uma safra, da mais antiga para a mais recente.
     * O Spring Data gera a query parametrizada automaticamente (sem risco de SQL Injection).
     */
    List<SafraImagem> findBySafraIdOrderByIdAsc(Integer safraId);

    /**
     * Conta quantas imagens uma safra já tem. Usado para limitar o total por safra.
     */
    long countBySafraId(Integer safraId);
}
