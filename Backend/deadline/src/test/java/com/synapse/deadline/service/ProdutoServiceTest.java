package com.synapse.deadline.service;

import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Produto;
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
import java.time.LocalDate;
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

    private ProdutoRequestDTO validDto;
    private Empresa mockEmpresa;

    @BeforeEach
    void setUp() {
        // PRESET (Conforme CSV)
        validDto = new ProdutoRequestDTO();
        validDto.setNome("Pao de forma");
        validDto.setCodigoBarrasEan("1919191919199");
        validDto.setCategoria("1");
        validDto.setDescricao("Pao de forma macio e cheiroso");
        validDto.setDataValidade(LocalDate.now().plusYears(1)); // Garante data futura
        validDto.setPrecoOriginal(new BigDecimal("20.00"));
        validDto.setPrecoPromocional(new BigDecimal("13.00"));
        validDto.setPercentualDesconto(10.0);

        mockEmpresa = new Empresa();
        mockEmpresa.setId(1L);
        mockEmpresa.setNomeFantasia("Empresa Alpha");
    }

    @Test
    @DisplayName("TC_055 - Deve cadastrar produto com todos os dados válidos")
    void deveCadastrarProdutoComSucesso() {
        // Arrange
        when(produtoRepository.existsByCodigoBarrasEan(validDto.getCodigoBarrasEan())).thenReturn(false);
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(mockEmpresa));
        
        Produto produtoSalvo = new Produto();
        produtoSalvo.setId(100L);
        produtoSalvo.setNome(validDto.getNome());
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        // Act
        Produto resultado = produtoService.cadastrarProduto(validDto, 1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(100L, resultado.getId());
        assertEquals("Pao de forma", resultado.getNome());
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("TC_058 - Deve lançar exceção ao tentar cadastrar produto com EAN duplicado")
    void deveLancarExcecaoQuandoEanDuplicado() {
        // Arrange
        when(produtoRepository.existsByCodigoBarrasEan(validDto.getCodigoBarrasEan())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            produtoService.cadastrarProduto(validDto, 1L);
        });

        assertEquals("Produto com este código de barras já cadastrado", exception.getMessage());
        verify(produtoRepository, never()).save(any(Produto.class));
    }

    @Test
    @DisplayName("TC_061 - Deve lançar exceção se o preço promocional for maior que o preço original")
    void deveLancarExcecaoQuandoPrecoPromocionalMaiorQueOriginal() {
        // Arrange
        validDto.setPrecoOriginal(new BigDecimal("50.00"));
        validDto.setPrecoPromocional(new BigDecimal("60.00")); // Inválido

        when(produtoRepository.existsByCodigoBarrasEan(validDto.getCodigoBarrasEan())).thenReturn(false);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            produtoService.cadastrarProduto(validDto, 1L);
        });

        assertEquals("O preço promocional não pode ser maior que o original", exception.getMessage());
        verify(produtoRepository, never()).save(any(Produto.class));
    }
}