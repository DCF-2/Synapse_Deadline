package com.synapse.deadline.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.deadline.dto.LoginDTO;
import com.synapse.deadline.dto.AuthResponseDTO;
import com.synapse.deadline.exceptions.CredenciaisInvalidasException;
import com.synapse.deadline.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
        loginDto.setEmailLogin("empresa@valida.com"); // Ajustado para o nome correto
        loginDto.setSenha("SenhaForte123!");

        // Criando a resposta com todos os dados previstos no AuthResponseDTO
        AuthResponseDTO responseDto = new AuthResponseDTO("token-jwt-simulado", 1L, "Empresa Alpha");

        // O mock agora retorna o objeto inteiro em vez de apenas uma string
        when(authService.autenticar(any(LoginDTO.class))).thenReturn(responseDto);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-jwt-simulado"))
                .andExpect(jsonPath("$.idEmpresa").value(1))
                .andExpect(jsonPath("$.nomeEmpresa").value("Empresa Alpha"));
    }

    @Test
    @DisplayName("TC_046 e TC_047 - Login com email não cadastrado ou senha incorreta deve retornar 401")
    void deveRetornar401ComCredenciaisInvalidas() throws Exception {
        LoginDTO loginDto = new LoginDTO();
        loginDto.setEmailLogin("errado@empresa.com");
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
        loginDto.setEmailLogin(""); // E-mail vazio
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
        loginDto.setEmailLogin("empresa@valida.com");
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
        loginDto.setEmailLogin("empresasemarroba.com"); // Formato inválido
        loginDto.setSenha("SenhaForte123!");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isBadRequest());
    }
}