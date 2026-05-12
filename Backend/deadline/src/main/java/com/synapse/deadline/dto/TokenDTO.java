package com.synapse.deadline.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Objeto de retorno contendo o Token de acesso gerado após o login")
public record TokenDTO(
        
        @Schema(description = "Token JWT (JSON Web Token) para ser enviado no cabeçalho Authorization das requisições privadas", 
                example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjb250YXRvQGZhcm1hY2lhLmNvbSIsImV4cCI...")
        String token
) {}