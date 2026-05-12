package com.synapse.deadline.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.deadline.dto.LoginDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.EmpresaRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalTime;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injetar aqui também!

    // Roda ANTES de cada teste para preparar o banco
    @BeforeEach
    void setup() {
        // Limpa o banco antes de cada teste para não dar erro de e-mail duplicado
        empresaRepository.deleteAll(); 

        
        Empresa empresa = new Empresa();
        empresa.setNomeFantasia("Farmácia Teste");
        empresa.setEmailLogin("contato@farmacia.com");
        empresa.setSenha(passwordEncoder.encode("Senha123"));
    
        empresa.setRazaoSocial("Farmácia Teste LTDA");
        empresa.setCnpj("12.345.678/0001-99");
        empresa.setEndereco("Rua dos Testes, 123");
        empresa.setInstrucoesRetirada("Retirar no balcão de testes");
        empresa.setDiasFuncionamento("Segunda a Sexta");
        empresa.setHorarioAbertura(LocalTime.of(8, 0));
        empresa.setHorarioFechamento(LocalTime.of(18, 0));

        empresaRepository.save(empresa);
    }

    @Test
    @DisplayName("Deve retornar 200 OK e o Token quando credenciais forem válidas")
    void loginComSucesso() throws Exception {
        // OBS: Requer que a empresa "contato@farmacia.com" e senha "Senha123" exista no banco de testes
        LoginDTO loginDTO = new LoginDTO("contato@farmacia.com", "Senha123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request quando o e-mail for inválido")
    void loginComEmailInvalido() throws Exception {
        LoginDTO loginDTO = new LoginDTO("email-sem-arroba.com", "Senha123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Erro de Validação"));
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request quando campos estiverem vazios")
    void loginComCamposVazios() throws Exception {
        LoginDTO loginDTO = new LoginDTO("", "");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 401 Unauthorized com mensagem genérica para e-mail inexistente")
    void loginComEmailInexistente() throws Exception {
        LoginDTO loginDTO = new LoginDTO("fantasma@farmacia.com", "Senha123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));
    }

    @Test
    @DisplayName("Deve retornar 401 Unauthorized com mensagem genérica para senha incorreta")
    void loginComSenhaIncorreta() throws Exception {
        // OBS: E-mail existe, mas a senha está errada
        LoginDTO loginDTO = new LoginDTO("contato@farmacia.com", "SenhaErrada999");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));
    }
}