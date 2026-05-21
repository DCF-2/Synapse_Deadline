package com.synapse.deadline.exceptions;

public class CredenciaisInvalidasException extends RuntimeException {
    public CredenciaisInvalidasException() {
        super("E-mail ou senha inválidos."); // Mensagem genérica PROPOSITAL para segurança
    }
}