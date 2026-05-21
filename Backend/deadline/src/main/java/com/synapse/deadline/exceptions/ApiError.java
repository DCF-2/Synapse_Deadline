package com.synapse.deadline.exceptions;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Objeto padronizado para retorno de erros da API")
public record ApiError(
        
        @Schema(description = "Data e hora em que o erro ocorreu", example = "2026-05-06T19:08:00.000Z")
        LocalDateTime timestamp,
        
        @Schema(description = "Código HTTP do status de erro", example = "400")
        Integer status,
        
        @Schema(description = "Título curto do erro", example = "Erro de Validação")
        String error,
        
        @Schema(description = "Mensagem detalhada do que aconteceu", example = "O e-mail não pode ser vazio")
        String message,
        
        @Schema(description = "Caminho da URL que gerou o erro", example = "/auth/login")
        String path
) {}