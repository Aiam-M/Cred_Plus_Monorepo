package com.projeto.amazonhacking.infra.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centraliza o tratamento de erros da API.
 *
 * Objetivo de segurança: nunca devolver stack trace ou detalhes internos ao cliente.
 * Cada tipo de erro vira uma resposta com status HTTP adequado e mensagem clara.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Resposta padrão de erro enviada ao cliente.
     * @param status código HTTP (ex.: 400, 404)
     * @param mensagem descrição amigável do erro
     */
    public record ErroResponseDTO(int status, String mensagem) {
    }

    /**
     * Erros de regra de negócio (ex.: email já cadastrado).
     */
    @ExceptionHandler(ValidacaoException.class)
    public ResponseEntity<ErroResponseDTO> tratarValidacao(ValidacaoException ex) {
        return ResponseEntity.badRequest()
                .body(new ErroResponseDTO(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    /**
     * Recurso não encontrado (ex.: safra inexistente).
     */
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponseDTO> tratarNaoEncontrado(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErroResponseDTO(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    /**
     * Falhas de validação dos DTOs (Bean Validation). Junta as mensagens dos campos inválidos.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponseDTO> tratarCamposInvalidos(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest()
                .body(new ErroResponseDTO(HttpStatus.BAD_REQUEST.value(), mensagem));
    }

    /**
     * Credenciais inválidas no login (email ou senha incorretos).
     * Mensagem genérica de propósito: não revela se o email existe.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponseDTO> tratarCredenciaisInvalidas(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErroResponseDTO(HttpStatus.UNAUTHORIZED.value(), "Email ou senha inválidos"));
    }

    /**
     * Demais falhas de autenticação.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErroResponseDTO> tratarAutenticacao(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErroResponseDTO(HttpStatus.UNAUTHORIZED.value(), "Não autenticado"));
    }

    /**
     * Qualquer erro não previsto. Não expõe o detalhe interno ao cliente.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponseDTO> tratarErroInesperado(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Ocorreu um erro inesperado. Tente novamente mais tarde."));
    }
}
