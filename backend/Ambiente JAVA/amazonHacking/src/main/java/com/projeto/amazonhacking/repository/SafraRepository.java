package com.projeto.amazonhacking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.projeto.amazonhacking.models.Safra;

public interface SafraRepository extends JpaRepository<Safra, Integer> {

    /**
     * Busca todas as safras já com produtor, associação e plantações carregados,
     * evitando o problema de N+1 queries ao montar o catálogo.
     */
    @Query("""
            SELECT DISTINCT s FROM Safra s
            LEFT JOIN FETCH s.produtor p
            LEFT JOIN FETCH p.associacao
            LEFT JOIN FETCH s.plantacoes
            ORDER BY s.id DESC
            """)
    List<Safra> buscarTodasComDetalhes();

    /**
     * Busca uma safra específica com todos os relacionamentos carregados.
     */
    @Query("""
            SELECT s FROM Safra s
            LEFT JOIN FETCH s.produtor p
            LEFT JOIN FETCH p.associacao
            LEFT JOIN FETCH s.plantacoes
            WHERE s.id = :id
            """)
    Optional<Safra> buscarPorIdComDetalhes(Integer id);

    /**
     * Média do AgroScore considerando apenas safras já avaliadas.
     */
    @Query("SELECT AVG(s.agroScore) FROM Safra s WHERE s.agroScore IS NOT NULL")
    Double mediaAgroScore();

    /**
     * Soma da área plantada de todas as safras (hectares).
     */
    @Query("SELECT COALESCE(SUM(s.areaPlantacao), 0) FROM Safra s")
    Double somaAreaPlantada();

    /**
     * Conta safras cujo AgroScore está dentro de uma faixa (inclusive).
     */
    @Query("SELECT COUNT(s) FROM Safra s WHERE s.agroScore >= :min AND s.agroScore <= :max")
    long contarPorFaixaScore(int min, int max);
}
