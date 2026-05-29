package com.projeto.amazonhacking.repository;

import java.util.List;
import java.util.Optional;
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
     * Lista todos os interesses recebidos pelo produtor (de qualquer safra dele),
     * com a safra e a empresa já carregadas, ordenados do mais recente ao mais antigo.
     * Usado pela tela "Mensagens" do app do produtor.
     */
    @Query("""
            SELECT i FROM Interesse i
            LEFT JOIN FETCH i.safra s
            LEFT JOIN FETCH i.empresa e
            WHERE s.produtor.id = :produtorId
            ORDER BY i.createdAt DESC
            """)
    List<Interesse> buscarPorProdutor(UUID produtorId);

    /**
     * Busca um interesse pelo id, mas só se ele for de uma safra do produtor
     * informado. Se o produtor tentar acessar a mensagem de outro, o Optional
     * volta vazio.
     */
    @Query("""
            SELECT i FROM Interesse i
            WHERE i.id = :id AND i.safra.produtor.id = :produtorId
            """)
    Optional<Interesse> buscarPorIdEProdutor(Integer id, UUID produtorId);

    /**
     * Conta quantas mensagens ainda não foram lidas pelo produtor.
     * Usado para o badge de "novas mensagens" no Dashboard do app.
     */
    @Query("""
            SELECT COUNT(i) FROM Interesse i
            WHERE i.safra.produtor.id = :produtorId AND i.lida = false
            """)
    long contarNaoLidosPorProdutor(UUID produtorId);

    /**
     * Verifica se a empresa já demonstrou interesse na safra (evita duplicidade).
     */
    boolean existsBySafra_IdAndEmpresa_Id(Integer safraId, UUID empresaId);
}
