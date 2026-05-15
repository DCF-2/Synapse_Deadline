package com.synapse.deadline.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.EmpresaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.MediaType;  

@ExtendWith(MockitoExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EmpresaServiceTest {

    @InjectMocks
    private EmpresaService empresaService;

    @Autowired
    private MockMvc mockMvc; 

    @Autowired
    private ObjectMapper objectMapper;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private EmpresaCadastroDTO dtoPreset;

    @BeforeEach
    void setUp() {
        // PRESET (TC_001) - Ajustado para os novos campos
        dtoPreset = new EmpresaCadastroDTO();
        dtoPreset.setNomeFantasia("Empresa Alpha");
        dtoPreset.setRazaoSocial("Empresa Alpha LTDA");
        dtoPreset.setCnpj("12.345.678/0001-99");
        
        // FIX: Endereço quebrado conforme atualização do QA
        dtoPreset.setLogradouro("Rua Teste");
        dtoPreset.setNumero("123");
        dtoPreset.setBairro("Centro");
        dtoPreset.setCep("00000-000");
        dtoPreset.setCidade("Recife");
        dtoPreset.setUf("PE");
        
        dtoPreset.setCoordenadasLocalizacao("-23.5505, -46.6333");
        dtoPreset.setContatoWhatsapp("11999999999");
        dtoPreset.setEmailLogin("login@alpha.com");
        dtoPreset.setSenha("SenhaForte123!");
        dtoPreset.setDiasFuncionamento("Segunda a Sexta");
        dtoPreset.setHorarioAbertura(LocalTime.of(8, 0));
        dtoPreset.setHorarioFechamento(LocalTime.of(18, 0));
    }

    @Test
    @DisplayName("TC_001 - Deve cadastrar empresa com todos os dados válidos")
    void deveCadastrarEmpresaComSucesso() {
        // Arrange
        when(empresaRepository.existsByEmailLogin(dtoPreset.getEmailLogin())).thenReturn(false);
        when(empresaRepository.existsByCnpj(dtoPreset.getCnpj())).thenReturn(false);
        when(passwordEncoder.encode(dtoPreset.getSenha())).thenReturn("senhaCriptografada");
        
        Empresa empresaSalva = new Empresa();
        empresaSalva.setId(1L);
        empresaSalva.setNomeFantasia(dtoPreset.getNomeFantasia());
        empresaSalva.setCnpj(dtoPreset.getCnpj());
        empresaSalva.setEmailLogin(dtoPreset.getEmailLogin());
        
        when(empresaRepository.save(any(Empresa.class))).thenReturn(empresaSalva);

        // Act - FIX: Método correto é 'cadastrar' e retorna 'EmpresaResponseDTO'
        EmpresaResponseDTO resultado = empresaService.cadastrar(dtoPreset);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.id()); // Pode ser .getId() dependendo de como fizeste o Record/Classe
        verify(passwordEncoder, times(1)).encode("SenhaForte123!"); 
        verify(empresaRepository, times(1)).save(any(Empresa.class));
    }

    @Test
    @DisplayName("TC_018 - Deve lançar exceção ao cadastrar com CNPJ duplicado")
    void deveLancarExcecaoQuandoCnpjDuplicado() {
        // Arrange
        when(empresaRepository.existsByCnpj(dtoPreset.getCnpj())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            empresaService.cadastrar(dtoPreset);
        });

        assertEquals("CNPJ já cadastrado", exception.getMessage());
        verify(empresaRepository, never()).save(any(Empresa.class));
    }

    @Test
    @DisplayName("TC_019 - Deve lançar exceção ao cadastrar com Email de login duplicado")
    void deveLancarExcecaoQuandoEmailDuplicado() {
        // Arrange
        when(empresaRepository.existsByEmailLogin(dtoPreset.getEmailLogin())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            empresaService.cadastrar(dtoPreset); 
        });

        assertEquals("E-mail de login já cadastrado", exception.getMessage());
        verify(empresaRepository, never()).save(any(Empresa.class));
    }

    @Test
    @DisplayName("TC_020 - Deve lançar exceção se horário de fechamento for menor que abertura")
    void deveLancarExcecaoQuandoHorarioInvalido() {
        // Arrange
        dtoPreset.setHorarioAbertura(LocalTime.of(18, 0));
        dtoPreset.setHorarioFechamento(LocalTime.of(8, 0));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            empresaService.cadastrar(dtoPreset);
        });

        assertEquals("Horário de fechamento não pode ser anterior ao horário de abertura", exception.getMessage());
        verify(empresaRepository, never()).save(any(Empresa.class));
    }   
}