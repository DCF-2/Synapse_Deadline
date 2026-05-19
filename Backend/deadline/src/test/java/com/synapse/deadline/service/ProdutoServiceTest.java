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
    private CategoriaProdutoRepository categoriaRepository; // Adicionado devido à nova arquitetura

    private ProdutoRequestDTO validDto;
    private Empresa mockEmpresa;
    private CategoriaProduto mockCategoria;

    @BeforeEach
    void setUp() {
        // PRESET adaptado para o novo DTO (Catálogo base, sem dados de Oferta)
        validDto = new ProdutoRequestDTO();
        validDto.setTituloProduto("Pao de forma");
        validDto.setCodBarrasEan("1919191919199");
        validDto.setIdCategoria(1L); // Agora usa ID real para integridade
        validDto.setDescricao("Pao de forma macio e cheiroso");
        validDto.setPrecoOriginal(new BigDecimal("20.00"));
        // Removidos precoPromocional e dataValidade (foram para a entidade Oferta)

        mockEmpresa = new Empresa();
        mockEmpresa.setId(1L);
        mockEmpresa.setNomeFantasia("Empresa Alpha");

        mockCategoria = new CategoriaProduto();
        mockCategoria.setId(1L);
        mockCategoria.setNome("Padaria");
    }

    @Test
    @DisplayName("TC_055 - Deve cadastrar produto no catálogo com todos os dados válidos")
    void deveCadastrarProdutoComSucesso() {
        // Arrange
        when(produtoRepository.existsByCodBarrasEan(validDto.getCodBarrasEan())).thenReturn(false);
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(mockEmpresa));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(mockCategoria));
        
        Produto produtoSalvo = new Produto();
        produtoSalvo.setId(100L);
        produtoSalvo.setTituloProduto(validDto.getTituloProduto());
        produtoSalvo.setPrecoOriginal(validDto.getPrecoOriginal());
        produtoSalvo.setEmpresa(mockEmpresa);
        produtoSalvo.setCategoria(mockCategoria);
        produtoSalvo.setAtivo(true);
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        // Act - Agora retorna o DTO de Detalhes conforme UML
        ProdutoEmpresaDetalhesDTO resultado = produtoService.cadastrarProduto(validDto, 1L);

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
            produtoService.cadastrarProduto(validDto, 1L);
        });

        assertEquals("Produto com este código de barras já cadastrado", exception.getMessage());
        verify(produtoRepository, never()).save(any(Produto.class));
    }
}