package com.synapse.deadline.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para receção das credenciais de acesso da Empresa.
 */
public class LoginDTO {

    @NotBlank(message = "O e-mail não pode estar vazio.")
    @Email(message = "Formato de e-mail inválido.")
    private String emailLogin;

    @NotBlank(message = "A palavra-passe não pode estar vazia.")
    private String senha;

    public String getEmailLogin() { return emailLogin; }
    public void setEmailLogin(String emailLogin) { this.emailLogin = emailLogin; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}