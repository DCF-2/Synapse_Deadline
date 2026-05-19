package com.synapse.deadline.service;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO;
import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProdutoServiceTest {

    @InjectMocks
    private ProdutoService produtoService;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private CategoriaProdutoRepository categoriaRepository;

    private ProdutoRequestDTO validDto;
    private Empresa mockEmpresa;
    private CategoriaProduto mockCategoria;

    @BeforeEach
    void setUp() {
        validDto = new ProdutoRequestDTO();
        validDto.setTituloProduto("Pao de forma");
        validDto.setCodBarrasEan("1919191919199");
        validDto.setIdCategoria(1L);
        validDto.setDescricao("Pao de forma macio e cheiroso");
        validDto.setPrecoOriginal(new BigDecimal("20.00"));

        mockEmpresa = new Empresa();
        mockEmpresa.setId(1L);
        mockEmpresa.setNomeFantasia("Empresa Alpha");
        mockEmpresa.setEmailLogin("empresa@alpha.com"); // Email necessário para a busca pelo Token

        mockCategoria = new CategoriaProduto();
        mockCategoria.setId(1L);
        mockCategoria.setNome("Padaria");
    }

    // Método auxiliar para criar um mock de utilizador logado no Spring Security
    private void simularUsuarioLogado(String email) {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(email);
        
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("TC_055 - Deve cadastrar produto no catálogo com todos os dados válidos")
    void deveCadastrarProdutoComSucesso() {
        // Arrange
        simularUsuarioLogado("empresa@alpha.com"); // Simula o JWT
        
        when(produtoRepository.existsByCodBarrasEan(validDto.getCodBarrasEan())).thenReturn(false);
        // Alterado de findById para findByEmailLogin, acompanhando o novo padrão de segurança
        when(empresaRepository.findByEmailLogin("empresa@alpha.com")).thenReturn(Optional.of(mockEmpresa));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(mockCategoria));
        
        Produto produtoSalvo = new Produto();
        produtoSalvo.setId(100L);
        produtoSalvo.setTituloProduto(validDto.getTituloProduto());
        produtoSalvo.setPrecoOriginal(validDto.getPrecoOriginal());
        produtoSalvo.setEmpresa(mockEmpresa);
        produtoSalvo.setCategoria(mockCategoria);
        produtoSalvo.setAtivo(true);
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        // Act - Removemos o "1L", a API agora só precisa do DTO
        ProdutoEmpresaDetalhesDTO resultado = produtoService.cadastrarProduto(validDto);

        // Assert
        assertNotNull(resultado);
        assertEquals(100L, resultado.getId());
        assertEquals("Pao de forma", resultado.getTituloProduto());
        assertEquals("Padaria", resultado.getNomeCategoria());
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("TC_058 - Deve lançar exceção ao tentar cadastrar produto com EAN duplicado")
    void deveLancarExcecaoQuandoEanDuplicado() {
        // Arrange
        when(produtoRepository.existsByCodBarrasEan(validDto.getCodBarrasEan())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            produtoService.cadastrarProduto(validDto); // Removemos o "1L"
        });

        assertEquals("Produto com este código de barras já cadastrado", exception.getMessage());
        verify(produtoRepository, never()).save(any(Produto.class));
    }
}