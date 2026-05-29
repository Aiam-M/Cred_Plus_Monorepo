package com.projeto.amazonhacking.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projeto.amazonhacking.models.TraceabilityEvent;

public interface TraceabilityEventRepository extends JpaRepository<TraceabilityEvent, UUID> {

    /**
     * Retorna os eventos da cadeia de uma safra em ordem cronológica,
     * que é a ordem em que os hashes foram encadeados.
     */
    List<TraceabilityEvent> findBySafra_IdOrderByCreatedAtAsc(Integer safraId);

    /**
     * Retorna apenas o último evento da cadeia de uma safra (o mais recente).
     * Usado para encadear o próximo hash sem carregar todos os eventos (O(1) em vez de O(n)).
     */
    Optional<TraceabilityEvent> findTopBySafra_IdOrderByCreatedAtDesc(Integer safraId);
}
