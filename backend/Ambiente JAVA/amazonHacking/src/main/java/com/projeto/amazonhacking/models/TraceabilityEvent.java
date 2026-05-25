package com.projeto.amazonhacking.models;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Evento da cadeia de rastreabilidade de uma safra.
 * Cada evento guarda um hash SHA-256 que encadeia com o hash do evento anterior,
 * formando uma cadeia imutável (estilo blockchain) verificável.
 */
@Entity
@Table(name = "traceability_event")
public class TraceabilityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "safra_id")
    private Safra safra;

    private String tipo;

    // Dados do evento serializados como JSON (ex.: {"agroScore":92,"ndviMedio":0.78}).
    private String dados;

    private String hash;

    @Column(name = "hash_anterior")
    private String hashAnterior;

    private String responsavel;

    @Column(name = "responsavel_tipo")
    private String responsavelTipo;

    private String observacao;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public TraceabilityEvent() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Safra getSafra() {
        return safra;
    }

    public void setSafra(Safra safra) {
        this.safra = safra;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDados() {
        return dados;
    }

    public void setDados(String dados) {
        this.dados = dados;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getHashAnterior() {
        return hashAnterior;
    }

    public void setHashAnterior(String hashAnterior) {
        this.hashAnterior = hashAnterior;
    }

    public String getResponsavel() {
        return responsavel;
    }

    public void setResponsavel(String responsavel) {
        this.responsavel = responsavel;
    }

    public String getResponsavelTipo() {
        return responsavelTipo;
    }

    public void setResponsavelTipo(String responsavelTipo) {
        this.responsavelTipo = responsavelTipo;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
