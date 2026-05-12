package com.synapse.deadline.dto;

/**
 * Usamos 'record' aqui porque é a forma mais moderna e limpa do Java 
 * para criar objetos de transferência de dados (DTOs) que são apenas para leitura.
 * Ele já cria os getters, construtores e o toString automaticamente por baixo dos panos!
 */
public record EmpresaResponseDTO(
        Long id,
        String nomeFantasia,
        String cnpj,
        String emailLogin
) {}