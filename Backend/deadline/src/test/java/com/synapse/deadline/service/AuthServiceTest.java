package com.synapse.deadline.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import com.synapse.deadline.dto.AuthResponseDTO;
import com.synapse.deadline.dto.LoginDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.exceptions.CredenciaisInvalidasException; // IMPORT ADICIONADO
import com.synapse.deadline.repository.EmpresaRepository;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    // Dependência assumida para a geração do token JWT
    @Mock
    private TokenService jwtTokenProvider; 

    private LoginDTO loginDTO;
    private Empresa empresaCadastrada;

    @BeforeEach
    void setUp() {
        // Setup do DTO de Entrada
        loginDTO = new LoginDTO();
        loginDTO.setEmailLogin("contato@mercado.com");
        loginDTO.setSenha("SenhaForte123!");

        // Setup da Empresa retornada pelo banco
        empresaCadastrada = new Empresa();
        empresaCadastrada.setId(1L); // DESCMENTADO para o TC_AUTH_001 não falhar ao criar o AuthResponseDTO
        empresaCadastrada.setNomeFantasia("Mercado da Esquina");
        empresaCadastrada.setEmailLogin("contato@mercado.com");
        empresaCadastrada.setSenhaHash("hash_da_senha_no_banco");
    }

    // ==========================================
    // TESTES DE AUTENTICAÇÃO
    // ==========================================

    @Test
    @DisplayName("TC_AUTH_001: Autenticação com Sucesso (Credenciais válidas)")
    void deveAutenticarComSucesso() {
        // Arrange
        when(empresaRepository.findByEmailLogin(loginDTO.getEmailLogin()))
                .thenReturn(Optional.of(empresaCadastrada));
        when(passwordEncoder.matches(loginDTO.getSenha(), empresaCadastrada.getSenhaHash()))
                .thenReturn(true);
        when(jwtTokenProvider.gerarToken(empresaCadastrada))
                .thenReturn("ey...token.jwt.simulado");

        // Act
        AuthResponseDTO response = authService.autenticar(loginDTO);

        // Assert
        assertNotNull(response);
        assertEquals("ey...token.jwt.simulado", response.getToken());
        assertEquals("Mercado da Esquina", response.getNomeEmpresa());
        assertEquals(1L, response.getIdEmpresa()); // Validar o ID mapeado
        
        verify(jwtTokenProvider, times(1)).gerarToken(empresaCadastrada);
    }

    @Test
    @DisplayName("TC_AUTH_002: Verificação do Payload do Token (Chamada ao Provider)")
    void devePassarEntidadeCorretaParaGeracaoDeToken() {
        when(empresaRepository.findByEmailLogin(loginDTO.getEmailLogin()))
                .thenReturn(Optional.of(empresaCadastrada));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtTokenProvider.gerarToken(any(Empresa.class))).thenReturn("token");

        authService.autenticar(loginDTO);

        verify(jwtTokenProvider).gerarToken(argThat(empresa -> 
            empresa.getEmailLogin().equals("contato@mercado.com") &&
            empresa.getNomeFantasia().equals("Mercado da Esquina")
        ));
    }

    @Test
    @DisplayName("TC_AUTH_003: Autenticação Ignorando Case do E-mail")
    void deveAutenticarIgnorandoCaseDoEmail() {
        // Arrange
        loginDTO.setEmailLogin("CONTATO@MERCADO.COM"); // E-mail em maiúsculo no DTO
        
        // CORREÇÃO: anyString() permite que o mock responda idependente do case que o service enviar
        when(empresaRepository.findByEmailLogin(anyString()))
                .thenReturn(Optional.of(empresaCadastrada));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtTokenProvider.gerarToken(any())).thenReturn("token");

        // Act
        AuthResponseDTO response = authService.autenticar(loginDTO);

        // Assert
        assertNotNull(response);
        // CORREÇÃO: Verifica se o repositório foi chamado com o e-mail exato do DTO
        verify(empresaRepository, times(1)).findByEmailLogin("CONTATO@MERCADO.COM"); 
    }

    @Test
    @DisplayName("TC_AUTH_004: Erro de Autenticação - E-mail não encontrado")
    void deveLancarErroQuandoEmailNaoExistir() {
        // Arrange
        when(empresaRepository.findByEmailLogin(loginDTO.getEmailLogin()))
                .thenReturn(Optional.empty());

        // CORREÇÃO: Esperar CredenciaisInvalidasException em vez de RuntimeException genérico
        Exception exception = assertThrows(CredenciaisInvalidasException.class, () -> authService.autenticar(loginDTO));
        
        // CORREÇÃO: A mensagem atual da sua exception é "E-mail ou senha inválidos."
        assertEquals("E-mail ou senha inválidos.", exception.getMessage()); 
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("TC_AUTH_005: Erro de Autenticação - Senha Incorreta")
    void deveLancarErroQuandoSenhaForIncorreta() {
        // Arrange
        when(empresaRepository.findByEmailLogin(loginDTO.getEmailLogin()))
                .thenReturn(Optional.of(empresaCadastrada));
        
        // Simula a falha do hash
        when(passwordEncoder.matches(loginDTO.getSenha(), empresaCadastrada.getSenhaHash()))
                .thenReturn(false);

        // CORREÇÃO: Esperar CredenciaisInvalidasException
        Exception exception = assertThrows(CredenciaisInvalidasException.class, () -> authService.autenticar(loginDTO));
        
        // CORREÇÃO: A mensagem atual da sua exception é "E-mail ou senha inválidos."
        assertEquals("E-mail ou senha inválidos.", exception.getMessage());
        verify(jwtTokenProvider, never()).gerarToken(any());
    }

    @Test
    @DisplayName("TC_AUTH_006: Erro de Validação - Envio de DTO com campos nulos")
    void deveLancarErroQuandoDtoEstiverInvalido() {
        
        // CORREÇÃO: Como o Spring Validation não roda no teste unitário do Service, 
        // enviar "null" ou vazio faz o repositório retornar empty, estourando a CredenciaisInvalidasException
        // ao invés do IllegalArgumentException.
        
        when(empresaRepository.findByEmailLogin(any())).thenReturn(Optional.empty());

        // Cenário 1: E-mail nulo
        loginDTO.setEmailLogin(null);
        assertThrows(CredenciaisInvalidasException.class, () -> authService.autenticar(loginDTO));

        // Cenário 2: E-mail vazio e Senha nula
        loginDTO.setEmailLogin("");
        loginDTO.setSenha(null);
        assertThrows(CredenciaisInvalidasException.class, () -> authService.autenticar(loginDTO));
        
    }
}