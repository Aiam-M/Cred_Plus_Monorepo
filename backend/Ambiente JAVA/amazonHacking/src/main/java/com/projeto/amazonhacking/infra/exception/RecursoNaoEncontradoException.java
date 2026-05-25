package com.projeto.amazonhacking.infra.exception;

/**
 * Exceção usada quando um recurso solicitado não existe (ex.: safra inexistente).
 * É tratada pelo GlobalExceptionHandler e devolve HTTP 404.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
