package com.projeto.amazonhacking.infra.exception;

/**
 * Exceção usada para erros de regra de negócio e validação.
 * É tratada pelo GlobalExceptionHandler e devolve uma mensagem clara ao cliente,
 * sem expor detalhes internos do sistema.
 */
public class ValidacaoException extends RuntimeException {

    public ValidacaoException(String mensagem) {
        super(mensagem);
    }
}
