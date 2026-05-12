package com.synapse.deadline.service;

import org.springframework.stereotype.Service;

import com.synapse.deadline.entity.Empresa;

import java.util.UUID;

@Service
public class TokenService {
    public String gerarToken(Empresa empresa) {
        return "jwt_token_simulado_para_" + empresa.getEmailLogin() + "_" + UUID.randomUUID();
    }
}