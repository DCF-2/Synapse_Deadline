package com.synapse.deadline.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.deadline.dto.LoginDTO;
import com.synapse.deadline.dto.TokenDTO;
import com.synapse.deadline.exceptions.CredenciaisInvalidasException;
import com.synapse.deadline.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import com.synapse.deadline.exceptions.CredenciaisInvalidasException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("TC_045 - Login com credenciais válidas deve retornar 200 e Token")
    void deveRetornarTokenComCredenciaisValidas() throws Exception {
        LoginDTO loginDto = new LoginDTO();
        loginDto.setEmail("empresa@valida.com");
        loginDto.setSenha("SenhaForte123!");

        // FIX: O TokenDTO recebe apenas 1 parâmetro
        TokenDTO tokenDto = new TokenDTO("token-jwt-simulado");

        when(authService.autenticar(any(LoginDTO.class))).thenReturn(tokenDto.token()); // Usando record .token() ou .getToken()

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-jwt-simulado"));
    }

    @Test
    @DisplayName("TC_046 e TC_047 - Login com email não cadastrado ou senha incorreta deve retornar 401")
    void deveRetornar401ComCredenciaisInvalidas() throws Exception {
        LoginDTO loginDto = new LoginDTO();
        loginDto.setEmail("errado@empresa.com");
        loginDto.setSenha("SenhaErrada!");

        when(authService.autenticar(any(LoginDTO.class)))
                .thenThrow(new CredenciaisInvalidasException());

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC_048 - Tentativa de login com e-mail vazio deve retornar 400 Bad Request")
    void deveRetornar400QuandoEmailVazio() throws Exception {
        LoginDTO loginDto = new LoginDTO();
        loginDto.setEmail(""); // E-mail vazio
        loginDto.setSenha("SenhaForte123!");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC_049 - Tentativa de login com senha vazia deve retornar 400 Bad Request")
    void deveRetornar400QuandoSenhaVazia() throws Exception {
        LoginDTO loginDto = new LoginDTO();
        loginDto.setEmail("empresa@valida.com");
        loginDto.setSenha(""); // Senha vazia

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC_050 - Login com formato de e-mail inválido deve retornar 400 Bad Request")
    void deveRetornar400QuandoFormatoEmailInvalido() throws Exception {
        LoginDTO loginDto = new LoginDTO();
        loginDto.setEmail("empresasemarroba.com"); // Formato inválido
        loginDto.setSenha("SenhaForte123!");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isBadRequest());
    }
}