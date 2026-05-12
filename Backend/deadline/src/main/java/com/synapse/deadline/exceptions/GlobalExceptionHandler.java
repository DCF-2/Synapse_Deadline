package com.synapse.deadline.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Captura os erros gerados pelas anotações @Valid (ex: @NotBlank, @Email) nos DTOs.
     * Retorna HTTP 400 - Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        // Pega a primeira mensagem de erro da lista gerada pelo Spring Validation
        String errorMessage = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        
        ApiError error = new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Erro de Validação",
                errorMessage,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Captura o erro de login (e-mail não existe ou senha errada).
     * Retorna HTTP 401 - Unauthorized.
     */
    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ApiError> handleCredenciaisInvalidasException(CredenciaisInvalidasException ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Não Autorizado",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Fallback: Captura qualquer outro erro inesperado (ex: NullPointerException, banco fora do ar)
     * para não vazar a stacktrace do Java para o usuário.
     * Retorna HTTP 500 - Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erro Interno do Servidor",
                "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                request.getRequestURI()
        );
        // Em produção, você colocaria um log.error(ex.getMessage(), ex); aqui.
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}