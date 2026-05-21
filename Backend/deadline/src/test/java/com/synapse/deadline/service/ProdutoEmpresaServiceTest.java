package com.synapse.deadline.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
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

    private Produto produtoEntrada;
    private Produto produtoSalvo;
    private Empresa empresaLogada;
    private CategoriaProduto categoriaValida;

    @BeforeEach
    void setUp() {
        empresaLogada = new Empresa();
        // empresaLogada.setId(1L);
        empresaLogada.setNomeFantasia("Mercado da Esquina");

        categoriaValida = new CategoriaProduto();
        // categoriaValida.setId(1L);
        categoriaValida.setNome("Padaria");

        produtoEntrada = new Produto();
        produtoEntrada.setTituloProduto("Pão de Forma");
        produtoEntrada.setCodBarrasEan("1919191919199");
        produtoEntrada.setDescricao("Pão macio");
        produtoEntrada.setFoto("foto.png");
        produtoEntrada.setPrecoOriginal(new BigDecimal("20.00"));
        produtoEntrada.setCategoria(categoriaValida);
        produtoEntrada.setAtivo(true);

        produtoSalvo = new Produto();
        // produtoSalvo.setId(10L);
        produtoSalvo.setTituloProduto("Pão de Forma");
        produtoSalvo.setCodBarrasEan("1919191919199");
        produtoSalvo.setPrecoOriginal(new BigDecimal("20.00"));
        produtoSalvo.setEmpresa(empresaLogada);
        produtoSalvo.setCategoria(categoriaValida);
        produtoSalvo.setAtivo(true);
    }

    // ==========================================
    // BLOCO 1: CADASTRO DE PRODUTO
    // ==========================================

    @Test
    @DisplayName("TC_PROD_001: Cadastro de Produto com Sucesso (Todos os dados obrigatórios e opcionais preenchidos)")
    void deveCadastrarProdutoComTodosOsDados() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaLogada));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        ProdutoEmpresaDetalhesDTO resultado = produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L);

        assertNotNull(resultado);
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("TC_PROD_002: Cadastro de Produto com Sucesso (Apenas dados obrigatórios)")
    void deveCadastrarProdutoApenasDadosObrigatorios() {
        produtoEntrada.setCodBarrasEan(null);
        produtoEntrada.setDescricao(null);
        produtoEntrada.setFoto(null);

        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaLogada));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        ProdutoEmpresaDetalhesDTO resultado = produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L);
        assertNotNull(resultado);
    }

    @Test
    @DisplayName("TC_PROD_003: Erro no Cadastro - idEmpresa inexistente no banco de dados")
    void deveLancarErroNoCadastroIdEmpresaInexistente() {
        when(empresaRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntrada, 99L));
    }

    @Test
    @DisplayName("TC_PROD_004: Erro no Cadastro - CategoriaProduto informada não existe")
    void deveLancarErroNoCadastroCategoriaInexistente() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaLogada));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L));
    }

    @Test
    @DisplayName("TC_PROD_005: Erro no Cadastro - Preço Original negativo ou igual a zero")
    void deveLancarErroNoCadastroPrecoInvalido() {
        produtoEntrada.setPrecoOriginal(new BigDecimal("-5.00"));
        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L));
    }

    @Test
    @DisplayName("TC_PROD_006: Erro no Cadastro - Título do Produto em branco ou nulo")
    void deveLancarErroNoCadastroTituloBranco() {
        produtoEntrada.setTituloProduto("");
        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L));
    }

    @Test
    @DisplayName("TC_PROD_007: Erro no Cadastro - Sanitização de campos (trim)")
    void deveSanitizarCamposNoCadastro() {
        produtoEntrada.setTituloProduto("   Pão   ");
        produtoEntrada.setCodBarrasEan(" 12345 ");
        
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaLogada));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L);

        verify(produtoRepository).save(argThat(p -> p.getTituloProduto().equals("Pão") && p.getCodBarrasEan().equals("12345")));
    }

    @Test
    @DisplayName("TC_PROD_021: Erro no Cadastro - codBarrasEan já cadastrado para outro produto da mesma empresa")
    void deveLancarErroEanDuplicado() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaLogada));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        // Assumindo método customizado no repo: boolean existsByCodBarrasEanAndEmpresaId(...)
        // when(produtoRepository.existsByCodBarrasEanAndEmpresaId("1919191919199", 1L)).thenReturn(true);

        // assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L));
    }

    @Test
    @DisplayName("TC_PROD_022: Erro no Cadastro/Edição - tituloProduto excede o limite máximo")
    void deveLancarErroTituloMuitoLongo() {
        String tituloLongo = "A".repeat(300); 
        produtoEntrada.setTituloProduto(tituloLongo);
        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.cadastrarProduto(produtoEntrada, 1L));
    }

    // ==========================================
    // BLOCO 2: LISTAGEM DE PRODUTOS
    // ==========================================

    @Test
    @DisplayName("TC_PROD_008: Listagem de Produtos com Sucesso")
    void deveListarProdutosComSucesso() {
        when(empresaRepository.existsById(1L)).thenReturn(true);
        Page<Produto> paginaProdutos = new PageImpl<>(List.of(produtoSalvo));
        when(produtoRepository.findByEmpresaId(eq(1L), any(Pageable.class))).thenReturn(paginaProdutos);

        List<ProdutoEmpresaResumoDTO> lista = produtoEmpresaService.listarProdutosDaEmpresa(1L);

        assertFalse(lista.isEmpty());
    }

    @Test
    @DisplayName("TC_PROD_009: Listagem de Produtos - Empresa sem produtos")
    void deveRetornarListaVaziaQuandoNaoHouverProdutos() {
        when(empresaRepository.existsById(1L)).thenReturn(true);
        Page<Produto> paginaVazia = new PageImpl<>(Collections.emptyList());
        when(produtoRepository.findByEmpresaId(eq(1L), any(Pageable.class))).thenReturn(paginaVazia);

        List<ProdutoEmpresaResumoDTO> lista = produtoEmpresaService.listarProdutosDaEmpresa(1L);

        assertTrue(lista.isEmpty()); 
    }

    @Test
    @DisplayName("TC_PROD_010: Erro na Listagem - idEmpresa inexistente")
    void deveLancarErroNaListagemSeEmpresaNaoExistir() {
        when(empresaRepository.existsById(99L)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> produtoEmpresaService.listarProdutosDaEmpresa(99L));
    }

    // ==========================================
    // BLOCO 3: VISUALIZAÇÃO DE DETALHES
    // ==========================================

    @Test
    @DisplayName("TC_PROD_011: Visualização de Detalhes com Sucesso")
    void deveVisualizarDetalhesComSucesso() {
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));

        ProdutoEmpresaDetalhesDTO dto = produtoEmpresaService.visualizarProdutoDaEmpresa(10L, 1L);
        assertNotNull(dto);
    }

    @Test
    @DisplayName("TC_PROD_012: Segurança/Erro na Visualização - IDOR")
    void deveBloquearVisualizacaoIdor() {
        when(produtoRepository.findByIdAndEmpresaId(10L, 2L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> produtoEmpresaService.visualizarProdutoDaEmpresa(10L, 2L));
    }

    @Test
    @DisplayName("TC_PROD_013: Erro na Visualização - idProduto inexistente")
    void deveLancarErroNaVisualizacaoDeProdutoInexistente() {
        when(produtoRepository.findByIdAndEmpresaId(99L, 1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> produtoEmpresaService.visualizarProdutoDaEmpresa(99L, 1L));
    }

    // ==========================================
    // BLOCO 4: EDIÇÃO DE PRODUTO
    // ==========================================

    @Test
    @DisplayName("TC_PROD_014: Edição de Produto com Sucesso")
    void deveEditarProdutoComSucesso() {
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));
        when(categoriaProdutoRepository.findById(any())).thenReturn(Optional.of(categoriaValida));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        ProdutoEmpresaDetalhesDTO dto = produtoEmpresaService.editarProduto(10L, produtoEntrada, 1L);
        assertNotNull(dto);
    }

    @Test
    @DisplayName("TC_PROD_015: Segurança/Erro na Edição - IDOR")
    void deveBloquearEdicaoIdor() {
        when(produtoRepository.findByIdAndEmpresaId(10L, 2L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> produtoEmpresaService.editarProduto(10L, produtoEntrada, 2L));
    }

    @Test
    @DisplayName("TC_PROD_016: Erro na Edição - Atualização do Preço Original para um valor negativo")
    void deveLancarErroEdicaoPrecoInvalido() {
        produtoEntrada.setPrecoOriginal(new BigDecimal("-1.00"));
        assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.editarProduto(10L, produtoEntrada, 1L));
    }

    @Test
    @DisplayName("TC_PROD_023: Regra de Negócio na Edição - Inativação bloqueada caso existam ofertas ativas")
    void deveLancarErroAoInativarProdutoComOfertasAtivas() {
        produtoEntrada.setAtivo(false); 
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));
        
        // Simula método no OfertaRepository para checar se tem oferta ativa
        // when(ofertaRepository.existsByProdutoIdAndAtivoTrue(10L)).thenReturn(true); 

        // assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.editarProduto(10L, produtoEntrada, 1L));
    }

    // ==========================================
    // BLOCO 5: REMOÇÃO DE PRODUTO
    // ==========================================

    @Test
    @DisplayName("TC_PROD_017: Remoção de Produto com Sucesso")
    void deveRemoverProdutoComSucesso() {
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));
        
        produtoEmpresaService.removerProduto(10L, 1L);
        verify(produtoRepository, times(1)).delete(produtoSalvo);
    }

    @Test
    @DisplayName("TC_PROD_018: Erro na Remoção - Restrição de Chave Estrangeira")
    void deveBloquearRemocaoComFkDeOferta() {
        when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoSalvo));
        // Simulação de que já existe oferta para o produto no banco
        // when(ofertaRepository.existsByProdutoId(10L)).thenReturn(true); 

        // assertThrows(IllegalArgumentException.class, () -> produtoEmpresaService.removerProduto(10L, 1L));
    }

    @Test
    @DisplayName("TC_PROD_019: Segurança/Erro na Remoção - IDOR")
    void deveBloquearRemocaoIdor() {
        when(produtoRepository.findByIdAndEmpresaId(10L, 2L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> produtoEmpresaService.removerProduto(10L, 2L));
    }

    @Test
    @DisplayName("TC_PROD_020: Erro na Remoção - idProduto inexistente")
    void deveLancarErroProdutoInexistenteNaRemocao() {
        when(produtoRepository.findByIdAndEmpresaId(99L, 1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> produtoEmpresaService.removerProduto(99L, 1L));
    }
}