package com.synapse.deadline.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Objeto de transferência de dados para autenticação da Farmácia")
public class LoginDTO {
        
    @Schema(description = "E-mail de acesso da empresa", example = "contato@farmaciapopular.com.br")
    @NotBlank(message = "Campo e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    private String email; // Renomeado para 'email' para compatibilidade com o frontend e testes

    @Schema(description = "Senha de acesso da empresa", example = "SenhaForte@123")
    @NotBlank(message = "Campo senha é obrigatório")
    private String senha;

    // Getters e Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}