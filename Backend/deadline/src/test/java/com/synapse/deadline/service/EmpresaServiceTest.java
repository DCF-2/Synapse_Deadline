package com.synapse.deadline.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaPerfilDTO;
import com.synapse.deadline.dto.EnderecoDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
    private RamoEmpresaRepository ramoRepository; // Adicionado para validação do Ramo

    @Mock
    private PasswordEncoder passwordEncoder;

    private EmpresaCadastroDTO dtoPreset;
    private RamoEmpresa mockRamo;

    @BeforeEach
    void setUp() {
        // PRESET adaptado para os novos DTOs aninhados
        dtoPreset = new EmpresaCadastroDTO();
        dtoPreset.setNomeFantasia("Empresa Alpha");
        dtoPreset.setRazaoSocial("Empresa Alpha LTDA");
        dtoPreset.setCnpj("12.345.678/0001-99");
        dtoPreset.setIdRamo(1L);
        
        EnderecoDTO endereco = new EnderecoDTO();
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("123");
        endereco.setBairro("Centro");
        endereco.setCep("00000-000");
        endereco.setCidade("Recife");
        endereco.setUf("PE");
        dtoPreset.setEndereco(endereco);
        
        dtoPreset.setContatoWhatsapp("11999999999");
        dtoPreset.setEmailLogin("login@alpha.com");
        dtoPreset.setSenha("SenhaForte123!");
        dtoPreset.setInstrucoesRetirada("Retirar no balcão.");
        dtoPreset.setHorarioFuncionamento("Seg a Sex - 08:00 as 18:00"); // Substituiu abertura/fechamento

        mockRamo = new RamoEmpresa();
        mockRamo.setId(1L);
        mockRamo.setNome("Tecnologia");
    }

    @Test
    @DisplayName("TC_001 - Deve cadastrar empresa com todos os dados válidos")
    void deveCadastrarEmpresaComSucesso() {
        // Arrange
        when(empresaRepository.findByEmailLogin(dtoPreset.getEmailLogin())).thenReturn(Optional.empty());
        when(empresaRepository.findByCnpj(dtoPreset.getCnpj())).thenReturn(Optional.empty());
        when(ramoRepository.findById(dtoPreset.getIdRamo())).thenReturn(Optional.of(mockRamo));
        when(passwordEncoder.encode(dtoPreset.getSenha())).thenReturn("senhaCriptografada");
        
        Empresa empresaSalva = new Empresa();
        empresaSalva.setId(1L);
        empresaSalva.setNomeFantasia(dtoPreset.getNomeFantasia());
        empresaSalva.setCnpj(dtoPreset.getCnpj());
        empresaSalva.setEmailLogin(dtoPreset.getEmailLogin());
        
        when(empresaRepository.save(any(Empresa.class))).thenReturn(empresaSalva);

        // Act
        EmpresaPerfilDTO resultado = empresaService.cadastrar(dtoPreset);

        // Assert
        assertNotNull(resultado);
        assertEquals("Empresa Alpha", resultado.getNomeFantasia()); 
        verify(passwordEncoder, times(1)).encode("SenhaForte123!"); 
        verify(empresaRepository, times(1)).save(any(Empresa.class));
    }

    @Test
    @DisplayName("TC_018 - Deve lançar exceção ao cadastrar com CNPJ duplicado")
    void deveLancarExcecaoQuandoCnpjDuplicado() {
        // Arrange
        when(empresaRepository.findByEmailLogin(dtoPreset.getEmailLogin())).thenReturn(Optional.empty());
        when(empresaRepository.findByCnpj(dtoPreset.getCnpj())).thenReturn(Optional.of(new Empresa()));

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
        when(empresaRepository.findByEmailLogin(dtoPreset.getEmailLogin())).thenReturn(Optional.of(new Empresa()));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            empresaService.cadastrar(dtoPreset); 
        });

        assertEquals("E-mail de login já cadastrado", exception.getMessage());
        verify(empresaRepository, never()).save(any(Empresa.class));
    }
}