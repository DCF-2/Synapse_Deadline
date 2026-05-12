package com.synapse.deadline.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Objeto de transferência de dados para autenticação da Farmácia")
public record LoginDTO(
        
        @Schema(description = "E-mail de acesso da empresa", example = "contato@farmaciapopular.com.br")
        @NotBlank(message = "O e-mail não pode ser vazio")
        @Email(message = "Formato de e-mail inválido")
        String emailLogin,

        @Schema(description = "Senha de acesso da empresa", example = "SenhaForte@123")
        @NotBlank(message = "A senha não pode ser vazia")
        String senha
) {}