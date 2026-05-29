package com.projeto.amazonhacking.models;

/**
 * Implementada pelas contas que podem se autenticar (produtor e empresa).
 * Expõe a versão atual do token: o filtro compara este valor com a versão
 * gravada no JWT para invalidar tokens antigos após troca de senha.
 */
public interface ContaAutenticavel {
    int getTokenVersion();
}
