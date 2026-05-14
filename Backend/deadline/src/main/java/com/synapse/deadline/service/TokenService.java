package com.synapse.deadline.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.synapse.deadline.entity.Empresa;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    // Lê a chave secreta definida no application.properties
    @Value("${api.security.token.secret}")
    private String secret;

    public String gerarToken(Empresa empresa) {
        try {
            // Define o algoritmo de criptografia com a chave secreta
            Algorithm algorithm = Algorithm.HMAC256(secret);
            
            return JWT.create()
                    .withIssuer("deadline-api") // Quem emitiu o token
                    .withSubject(empresa.getEmailLogin()) // A quem pertence (guardamos o email)
                    .withExpiresAt(gerarDataExpiracao()) // Quando expira
                    .sign(algorithm); // Assina o token
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String validarToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            
            return JWT.require(algorithm)
                    .withIssuer("deadline-api")
                    .build()
                    .verify(token)
                    .getSubject(); // Devolve o e-mail se o token for válido e não estiver expirado
        } catch (JWTVerificationException exception) {
            return ""; // Retorna string vazia se o token for inválido/expirado
        }
    }

    private Instant gerarDataExpiracao() {
        // Define que o token tem a validade de 2 horas a partir do momento da criação
        // Utiliza o fuso horário oficial de Brasília/Recife (-03:00)
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}