package com.synapse.deadline.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.service.TokenService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Test
    @DisplayName("Deve retornar 401 quando o token refere uma empresa inexistente")
    void deveRetornar401QuandoTokenReferenciarEmpresaInexistente() throws Exception {
        Empresa empresa = new Empresa();
        empresa.setEmailLogin("ghost@invalid.test");

        String token = tokenService.gerarToken(empresa);

        mockMvc.perform(get("/produto/empresa")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
