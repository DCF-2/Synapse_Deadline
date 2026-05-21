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

import com.synapse.deadline.dto.AuthResponseDTO;
import com.synapse.deadline.dto.LoginDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.EmpresaRepository;

@ExtendWith(MockitoExtension.class)
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
        // empresaCadastrada.setId(1L);
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
        // assertEquals(1L, response.getIdEmpresa()); // Validar o ID mapeado
        
        verify(jwtTokenProvider, times(1)).gerarToken(empresaCadastrada);
    }

    @Test
    @DisplayName("TC_AUTH_002: Verificação do Payload do Token (Chamada ao Provider)")
    void devePassarEntidadeCorretaParaGeracaoDeToken() {
        // Em um teste unitário de Service, verificamos se o Provider (que injeta as claims)
        // é chamado corretamente com a entidade da Empresa, garantindo que o idEmpresa vá para o payload.
        
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
        
        // Simula que o repository busca com o toLowerCase() ou ignora o case no banco
        when(empresaRepository.findByEmailLogin("contato@mercado.com"))
                .thenReturn(Optional.of(empresaCadastrada));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtTokenProvider.gerarToken(any())).thenReturn("token");

        // Act
        AuthResponseDTO response = authService.autenticar(loginDTO);

        // Assert
        assertNotNull(response);
        verify(empresaRepository, times(1)).findByEmailLogin("contato@mercado.com");
    }

    @Test
    @DisplayName("TC_AUTH_004: Erro de Autenticação - E-mail não encontrado")
    void deveLancarErroQuandoEmailNaoExistir() {
        // Arrange
        when(empresaRepository.findByEmailLogin(loginDTO.getEmailLogin()))
                .thenReturn(Optional.empty());

        // Act & Assert
        // Substitua 'RuntimeException' por exceções específicas como 'UsernameNotFoundException' ou 'EntityNotFoundException'
        Exception exception = assertThrows(RuntimeException.class, () -> authService.autenticar(loginDTO));
        
        assertEquals("Credenciais inválidas.", exception.getMessage()); // Mensagem genérica para não vazar se é o email ou a senha
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

        // Act & Assert
        // Substitua por 'BadCredentialsException' caso esteja importando o Security
        Exception exception = assertThrows(RuntimeException.class, () -> authService.autenticar(loginDTO));
        
        assertEquals("Credenciais inválidas.", exception.getMessage());
        verify(jwtTokenProvider, never()).gerarToken(any());
    }

    @Test
    @DisplayName("TC_AUTH_006: Erro de Validação - Envio de DTO com campos nulos")
    void deveLancarErroQuandoDtoEstiverInvalido() {
        // Cenário 1: E-mail nulo
        loginDTO.setEmailLogin(null);
        assertThrows(IllegalArgumentException.class, () -> authService.autenticar(loginDTO));

        // Cenário 2: E-mail vazio e Senha nula
        loginDTO.setEmailLogin("");
        loginDTO.setSenha(null);
        assertThrows(IllegalArgumentException.class, () -> authService.autenticar(loginDTO));
        
        // Garante que não bate no banco caso a validação inicial falhe
        verify(empresaRepository, never()).findByEmailLogin(anyString());
    }
}