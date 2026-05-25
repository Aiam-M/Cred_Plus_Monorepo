package com.projeto.amazonhacking.models;

/**
 * Tipos de evento da cadeia de rastreabilidade.
 * Cada tipo carrega o rótulo, o ícone e a cor usados pelo dashboard para exibir
 * o evento na timeline. Centralizar isso aqui evita espalhar esse mapeamento.
 */
public enum TipoEventoRastreabilidade {

    CADASTRO_INICIAL("Cadastro Inicial", "file-text", "blue"),
    VALIDACAO_SATELITE("Validação por Satélite", "satellite", "green"),
    VALIDACAO_CAMPO("Validação em Campo", "check-circle", "green"),
    INTERESSE_EMPRESA("Interesse Demonstrado", "briefcase", "yellow"),
    REPROVACAO("Reprovação", "x-circle", "red");

    private final String label;
    private final String icone;
    private final String cor;

    TipoEventoRastreabilidade(String label, String icone, String cor) {
        this.label = label;
        this.icone = icone;
        this.cor = cor;
    }

    public String getLabel() {
        return label;
    }

    public String getIcone() {
        return icone;
    }

    public String getCor() {
        return cor;
    }

    /**
     * Converte o código guardado no banco no tipo correspondente.
     * Retorna null se o código não for reconhecido (o service trata o fallback).
     */
    public static TipoEventoRastreabilidade fromCodigo(String codigo) {
        if (codigo == null) return null;
        try {
            return TipoEventoRastreabilidade.valueOf(codigo);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
