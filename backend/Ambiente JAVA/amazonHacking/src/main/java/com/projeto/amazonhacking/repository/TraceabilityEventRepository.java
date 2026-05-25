package com.projeto.amazonhacking.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projeto.amazonhacking.models.TraceabilityEvent;

public interface TraceabilityEventRepository extends JpaRepository<TraceabilityEvent, UUID> {

    /**
     * Retorna os eventos da cadeia de uma safra em ordem cronológica,
     * que é a ordem em que os hashes foram encadeados.
     */
    List<TraceabilityEvent> findBySafra_IdOrderByCreatedAtAsc(Integer safraId);
}
