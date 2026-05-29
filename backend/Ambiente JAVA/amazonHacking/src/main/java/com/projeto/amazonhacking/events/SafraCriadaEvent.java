package com.projeto.amazonhacking.events;

/**
 * Evento publicado quando uma nova safra é gravada no banco.
 * Carrega apenas o id da safra; quem ouve o evento (AgroScoreAutomacaoService)
 * usa esse id para calcular o AgroScore em segundo plano.
 */
public record SafraCriadaEvent(Integer safraId) {
}
