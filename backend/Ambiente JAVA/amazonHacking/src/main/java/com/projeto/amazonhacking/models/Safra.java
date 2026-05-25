package com.projeto.amazonhacking.models;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Safra/colheita cadastrada por um produtor.
 * O AgroScore é calculado a partir dos dados de satélite e a data de validação
 * é preenchida quando a safra passa pela validação de campo.
 */
@Entity
@Table(name = "safra")
public class Safra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id")
    private Usuario produtor;

    private String name;

    @Column(name = "area_plantacao")
    private Double areaPlantacao;

    private String status;

    @Column(name = "agro_score")
    private Integer agroScore;

    @Column(name = "validada_em")
    private LocalDateTime validadaEm;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "safra", fetch = FetchType.LAZY)
    private List<Plantacao> plantacoes;

    public Safra() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Usuario getProdutor() {
        return produtor;
    }

    public void setProdutor(Usuario produtor) {
        this.produtor = produtor;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getAreaPlantacao() {
        return areaPlantacao;
    }

    public void setAreaPlantacao(Double areaPlantacao) {
        this.areaPlantacao = areaPlantacao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getAgroScore() {
        return agroScore;
    }

    public void setAgroScore(Integer agroScore) {
        this.agroScore = agroScore;
    }

    public LocalDateTime getValidadaEm() {
        return validadaEm;
    }

    public void setValidadaEm(LocalDateTime validadaEm) {
        this.validadaEm = validadaEm;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Plantacao> getPlantacoes() {
        return plantacoes;
    }

    public void setPlantacoes(List<Plantacao> plantacoes) {
        this.plantacoes = plantacoes;
    }
}
