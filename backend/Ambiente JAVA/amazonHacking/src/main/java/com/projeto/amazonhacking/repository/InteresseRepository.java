package com.projeto.amazonhacking.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.projeto.amazonhacking.models.Interesse;

public interface InteresseRepository extends JpaRepository<Interesse, Integer> {

    /**
     * Lista os interesses de uma empresa, com a safra, o produtor e a associação
     * já carregados, ordenados do mais recente para o mais antigo.
     */
    @Query("""
            SELECT i FROM Interesse i
            LEFT JOIN FETCH i.safra s
            LEFT JOIN FETCH s.produtor p
            LEFT JOIN FETCH p.associacao
            WHERE i.empresa.id = :empresaId
            ORDER BY i.createdAt DESC
            """)
    List<Interesse> buscarPorEmpresa(UUID empresaId);

    /**
     * Verifica se a empresa já demonstrou interesse na safra (evita duplicidade).
     */
    boolean existsBySafra_IdAndEmpresa_Id(Integer safraId, UUID empresaId);
}
