package com.synapse.deadline.service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO;
import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO;
import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.ProdutoRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Teste Unitário - ProdutoEmpresaService")
@ActiveProfiles("test")
class ProdutoEmpresaServiceTest {

    @InjectMocks
    private ProdutoEmpresaService produtoEmpresaService;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private CategoriaProdutoRepository categoriaProdutoRepository;

    @Mock
    private OfertaRepository ofertaRepository;

    private ProdutoRequestDTO produtoEntradaDTO;
    private Produto produtoSalvo;
    private Empresa empresaLogada;
    private CategoriaProduto categoriaValida;

    @BeforeEach
    void setUp() {
        empresaLogada = new Empresa();
        empresaLogada.setId(1L);
        empresaLogada.setNomeFantasia("Mercado da Esquina");

        categoriaValida = new CategoriaProduto();
        categoriaValida.setId(1L);
        categoriaValida.setNome("Padaria");

        produtoEntradaDTO = new ProdutoRequestDTO();
        produtoEntradaDTO.setTituloProduto("Pão de Forma");
        produtoEntradaDTO.setCodBarrasEan("1919191919199");
        produtoEntradaDTO.setDescricao("Pão macio");
        produtoEntradaDTO.setFoto("foto.png");
        produtoEntradaDTO.setPrecoOriginal(new BigDecimal("20.00"));
        produtoEntradaDTO.setIdCategoria(1L);

        produtoSalvo = new Produto();
        produtoSalvo.setId(10L);
        produtoSalvo.setTituloProduto("Pão de Forma");
        produtoSalvo.setCodBarrasEan("1919191919199");
        produtoSalvo.setPrecoOriginal(new BigDecimal("20.00"));
        produtoSalvo.setEmpresa(empresaLogada);
        produtoSalvo.setCategoria(categoriaValida);
        produtoSalvo.setAtivo(true);
    }

    private void simularUsuarioLogado() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(empresaLogada);
        SecurityContextHolder.setContext(securityContext);
    }

    // ==========================================
    // BLOCO 1: CADASTRO DE PRODUTO
    // ==========================================

    @Test
    @DisplayName("TC_PROD_001: Cadastro de Produto com Sucesso (Todos os dados obrigatórios e opcionais preenchidos)")
    void deveCadastrarProdutoComTodosOsDados() {
        simularUsuarioLogado();
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        ProdutoEmpresaDetalhesDTO resultado = produtoEmpresaService.cadastrarProduto(produtoEntradaDTO);

        assertNotNull(resultado);
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("TC_PROD_002: Cadastro de Produto com Sucesso (Apenas dados obrigatórios)")
    void deveCadastrarProdutoApenasDadosObrigatorios() {
        simularUsuarioLogado();
        produtoEntradaDTO.setCodBarrasEan(null);
        produtoEntradaDTO.setDescricao(null);
        produtoEntradaDTO.setFoto(null);

        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        ProdutoEmpresaDetalhesDTO resultado = produtoEmpresaService.cadastrarProduto(produtoEntradaDTO);
        assertNotNull(resultado);
    }

    @Test
    @DisplayName("TC_PROD_003: Erro no Cadastro - idEmpresa inexistente no banco de dados (Simulando Token Inválido)")
    void deveLancarErroNoCadastroIdEmpresaInexistente() {
        assertThrows(Exception.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntradaDTO));
    }

    @Test
    @DisplayName("TC_PROD_004: Erro no Cadastro - CategoriaProduto informada não existe")
    void deveLancarErroNoCadastroCategoriaInexistente() {
        simularUsuarioLogado();
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntradaDTO));
    }

    @Test
    @DisplayName("TC_PROD_005: Erro no Cadastro - Preço Original negativo ou igual a zero")
    void deveLancarErroNoCadastroPrecoInvalido() {
        
        produtoEntradaDTO.setPrecoOriginal(new BigDecimal("-5.00"));
        
    }

    @Test
    @DisplayName("TC_PROD_006: Erro no Cadastro - Título do Produto em branco ou nulo")
    void deveLancarErroNoCadastroTituloBranco() {
        
        produtoEntradaDTO.setTituloProduto("");
        
    }

    @Test
    @DisplayName("TC_PROD_007: Erro no Cadastro - Sanitização de campos (trim)")
    void deveSanitizarCamposNoCadastro() {
        simularUsuarioLogado();
        produtoEntradaDTO.setTituloProduto("   Pão   ");
        produtoEntradaDTO.setCodBarrasEan(" 12345 ");
        
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        produtoEmpresaService.cadastrarProduto(produtoEntradaDTO);

        verify(produtoRepository).save(argThat(p -> p.getTituloProduto().equals("   Pão   ") && p.getCodBarrasEan().equals(" 12345 ")));
    }

    @Test
    @DisplayName("TC_PROD_021: Erro no Cadastro - codBarrasEan já cadastrado para outro produto da mesma empresa")
    void deveLancarErroEanDuplicado() {
        when(produtoRepository.existsByCodBarrasEan("1919191919199")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntradaDTO));
    }

    @Test
    @DisplayName("TC_PROD_022: Erro no Cadastro/Edição - tituloProduto excede o limite máximo")
    void deveLancarErroTituloMuitoLongo() {
        
        String tituloLongo = "A".repeat(300); 
        produtoEntradaDTO.setTituloProduto(tituloLongo);
        
    }

    // ==========================================
    // BLOCO 2: LISTAGEM DE PRODUTOS
    // ==========================================

    @Test
    @DisplayName("TC_PROD_008: Listagem de Produtos com Sucesso")
    void deveListarProdutosComSucesso() {
        simularUsuarioLogado();
        Pageable pageable = mock(Pageable.class);
        Page<Produto> paginaProdutos = new PageImpl<>(List.of(produtoSalvo));
        when(produtoRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(paginaProdutos);

        Page<ProdutoEmpresaResumoDTO> resultado = produtoEmpresaService.listarProdutosPorEmpresaLogada(pageable);

        assertFalse(resultado.isEmpty());
        verify(produtoRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("TC_PROD_009: Listagem de Produtos - Empresa sem produtos")
    void deveRetornarListaVaziaQuandoNaoHouverProdutos() {
        simularUsuarioLogado();
        Page<Produto> paginaVazia = new PageImpl<>(Collections.emptyList());
        when(produtoRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(paginaVazia);

        Page<ProdutoEmpresaResumoDTO> pagina = produtoEmpresaService.listarProdutosPorEmpresaLogada(mock(Pageable.class));

        assertTrue(pagina.isEmpty());
        verify(produtoRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("TC_PROD_010: Listagem de Produtos filtrada por nome parcial")
    void deveFiltrarProdutosPorNomeParcial() {
        simularUsuarioLogado();
        Pageable pageable = mock(Pageable.class);
        Page<Produto> paginaProdutos = new PageImpl<>(List.of(produtoSalvo));

        when(produtoRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(paginaProdutos);

        Page<ProdutoEmpresaResumoDTO> resultado = produtoEmpresaService.listarProdutosPorEmpresaLogada(pageable, "pão");

        assertFalse(resultado.isEmpty());
        verify(produtoRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("TC_PROD_011: Listagem de Produtos filtrada por múltiplos critérios")
    void deveFiltrarProdutosPorMultiplosCriterios() {
        simularUsuarioLogado();
        Pageable pageable = mock(Pageable.class);
        Page<Produto> paginaProdutos = new PageImpl<>(List.of(produtoSalvo));

        when(produtoRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(paginaProdutos);

        Page<ProdutoEmpresaResumoDTO> resultado = produtoEmpresaService.listarProdutosPorEmpresaLogada(
                pageable,
                "pão",
                1L,
                "1919191919199",
                "macio",
                true,
                new BigDecimal("10.00"),
                new BigDecimal("30.00")
        );

        assertFalse(resultado.isEmpty());
        verify(produtoRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    // ==========================================
    // BLOCO 3: VISUALIZAÇÃO DE DETALHES
    // ==========================================

    @Test
    @DisplayName("TC_PROD_011: Visualização de Detalhes com Sucesso")
    void deveVisualizarDetalhesComSucesso() {
        simularUsuarioLogado();
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));
        ProdutoEmpresaDetalhesDTO dto = produtoEmpresaService.visualizarProdutoDaEmpresa(10L);
        assertNotNull(dto);
    }

    @Test
    @DisplayName("TC_PROD_012: Segurança/Erro na Visualização - IDOR")
    void deveBloquearVisualizacaoIdor() {
        simularUsuarioLogado();
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.empty());
        assertThrows(SecurityException.class, () -> produtoEmpresaService.visualizarProdutoDaEmpresa(10L));
    }

    // ==========================================
    // BLOCO 4: EDIÇÃO DE PRODUTO
    // ==========================================

    @Test
    @DisplayName("TC_PROD_014: Edição de Produto com Sucesso")
    void deveEditarProdutoComSucesso() {
        simularUsuarioLogado();
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);
        ProdutoEmpresaDetalhesDTO dto = produtoEmpresaService.editarProduto(10L, produtoEntradaDTO);
        assertNotNull(dto);
    }

    @Test
    @DisplayName("TC_PROD_014B: Edição de Produto deve bloquear EAN duplicado")
    void deveBloquearEdicaoComEanDuplicado() {
        simularUsuarioLogado();
        produtoEntradaDTO.setCodBarrasEan("9999999999999");
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produtoSalvo));
        when(produtoRepository.existsByCodBarrasEan("9999999999999")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.editarProduto(10L, produtoEntradaDTO));
    }

    @Test
    @DisplayName("TC_PROD_015: Segurança/Erro na Edição - IDOR")
    void deveBloquearEdicaoIdor() {
        simularUsuarioLogado();
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.empty());
        assertThrows(SecurityException.class, () -> produtoEmpresaService.editarProduto(10L, produtoEntradaDTO));
    }

    // ==========================================
    // BLOCO 5: REMOÇÃO DE PRODUTO
    // ==========================================

    @Test
    @DisplayName("TC_PROD_017: Remoção de Produto com Sucesso")
    void deveRemoverProdutoComSucesso() {
        simularUsuarioLogado();
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produtoSalvo));
        
        produtoEmpresaService.remover(10L);
        verify(produtoRepository, times(1)).save(produtoSalvo);
    }

    @Test
    @DisplayName("TC_PROD_019: Segurança/Erro na Remoção - IDOR")
    void deveBloquearRemocaoIdor() {
        simularUsuarioLogado();
        
        Produto produtoOutro = new Produto();
        produtoOutro.setId(10L);
        Empresa e2 = new Empresa();
        e2.setId(2L);
        produtoOutro.setEmpresa(e2);

        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produtoOutro));
        
        assertThrows(SecurityException.class, () -> produtoEmpresaService.remover(10L));
    }
}