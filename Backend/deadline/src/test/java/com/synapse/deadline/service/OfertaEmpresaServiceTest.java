// package com.synapse.deadline.service;

// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.ArgumentCaptor;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;

// import java.math.BigDecimal;
// import java.math.RoundingMode;
// import java.time.LocalDate;
// import java.util.Collections;
// import java.util.List;
// import java.util.Optional;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class)
// class OfertaEmpresaServiceTest {

//     @InjectMocks
//     private OfertaEmpresaService ofertaEmpresaService;

//     @Mock
//     private OfertaRepository ofertaRepository;

//     @Mock
//     private ProdutoRepository produtoRepository;

//     private Produto produtoValido;
//     private Empresa empresaLogada;
//     private OfertaEmpresaDetalhesDTO ofertaDTOEntrada;
//     private Oferta ofertaSalva;

//     @BeforeEach
//     void setUp() {
//         empresaLogada = new Empresa();
//         // empresaLogada.setId(1L);

//         produtoValido = new Produto();
//         // produtoValido.setId(10L);
//         produtoValido.setEmpresa(empresaLogada);
//         produtoValido.setPrecoOriginal(new BigDecimal("20.00"));
//         produtoValido.setAtivo(true);

//         ofertaDTOEntrada = new OfertaEmpresaDetalhesDTO();
//         ofertaDTOEntrada.setIdProduto(10L);
//         ofertaDTOEntrada.setPrecoPromocional(new BigDecimal("15.00"));
//         ofertaDTOEntrada.setValidadeProduto(LocalDate.now().plusDays(30));
//         ofertaDTOEntrada.setDataFimOferta(LocalDate.now().plusDays(15));
        
//         ofertaSalva = new Oferta();
//         // ofertaSalva.setId(100L);
//         ofertaSalva.setProduto(produtoValido);
//         ofertaSalva.setPrecoPromocional(new BigDecimal("15.00"));
//         ofertaSalva.setPercentualDesconto(25.0);
//         ofertaSalva.setAtivo(true);
//     }

//     // ==========================================
//     // BLOCO 1: CRIAÇÃO DE OFERTA
//     // ==========================================

//     @Test
//     @DisplayName("TC_OFER_001 e TC_OFER_002: Criação com Sucesso e Cálculo de Desconto")
//     void deveCriarOfertaECalcularDescontoCorretamente() {
//         // Usa o método anti-IDOR do ProdutoRepository
//         when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoValido));
//         when(ofertaRepository.save(any(Oferta.class))).thenReturn(ofertaSalva);

//         OfertaEmpresaDetalhesDTO resultado = ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L);

//         assertNotNull(resultado);
        
//         ArgumentCaptor<Oferta> ofertaCaptor = ArgumentCaptor.forClass(Oferta.class);
//         verify(ofertaRepository).save(ofertaCaptor.capture());
        
//         assertEquals(25.0, ofertaCaptor.getValue().getPercentualDesconto());
//         assertTrue(ofertaCaptor.getValue().getAtivo());
//     }

//     @Test
//     @DisplayName("TC_OFER_003: Segurança/Erro na Criação - IDOR")
//     void deveBloquearCriacaoDeOfertaIdor() {
//         // Retorna vazio pois o produto não pertence à empresa logada
//         when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.empty());
        
//         assertThrows(RuntimeException.class, () -> ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L));
//     }

//     @Test
//     @DisplayName("TC_OFER_004: Erro na Criação - Produto Inativo")
//     void deveLancarErroProdutoInativo() {
//         produtoValido.setAtivo(false);
//         when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoValido));
        
//         assertThrows(IllegalArgumentException.class, () -> ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L));
//     }

//     @Test
//     @DisplayName("TC_OFER_005: Regra - Preço Promocional maior/igual ao Original")
//     void deveBloquearPrecoPromocionalInvalido() {
//         when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoValido));
        
//         ofertaDTOEntrada.setPrecoPromocional(new BigDecimal("25.00")); // Maior
//         assertThrows(IllegalArgumentException.class, () -> ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L));
//     }

//     @Test
//     @DisplayName("TC_OFER_006 e TC_OFER_007: Regras de Data (Retroativa e Validade)")
//     void deveBloquearDatasInvalidasNaCriacao() {
//         when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoValido));

//         ofertaDTOEntrada.setDataFimOferta(LocalDate.now().minusDays(1)); // TC_OFER_006
//         assertThrows(IllegalArgumentException.class, () -> ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L));

//         ofertaDTOEntrada.setDataFimOferta(LocalDate.now().plusDays(20));
//         ofertaDTOEntrada.setValidadeProduto(LocalDate.now().plusDays(10)); // TC_OFER_007
//         assertThrows(IllegalArgumentException.class, () -> ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L));
//     }

//     @Test
//     @DisplayName("TC_OFER_021 e TC_OFER_022: Limites de Preço Zero e Arredondamento")
//     void deveValidarPrecoZeroEArredondamento() {
//         when(produtoRepository.findByIdAndEmpresaId(10L, 1L)).thenReturn(Optional.of(produtoValido));

//         ofertaDTOEntrada.setPrecoPromocional(new BigDecimal("0.00"));
//         assertThrows(IllegalArgumentException.class, () -> ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L));

//         ofertaDTOEntrada.setPrecoPromocional(new BigDecimal("15.33333"));
//         when(ofertaRepository.save(any())).thenReturn(ofertaSalva);
        
//         ofertaEmpresaService.criarOferta(ofertaDTOEntrada, 1L);
//         ArgumentCaptor<Oferta> captor = ArgumentCaptor.forClass(Oferta.class);
//         verify(ofertaRepository).save(captor.capture());
        
//         assertEquals(new BigDecimal("15.33"), captor.getValue().getPrecoPromocional().setScale(2, RoundingMode.HALF_UP));
//     }

//     // ==========================================
//     // BLOCO 2: LISTAGEM DE OFERTAS
//     // ==========================================

//     @Test
//     @DisplayName("TC_OFER_009 e TC_OFER_010: Listagem de Ofertas")
//     void deveListarOfertasDaEmpresa() {
//         // Conforme diagrama: findByProdutoEmpresaId(idEmpresa)
//         when(ofertaRepository.findByProdutoEmpresaId(1L)).thenReturn(List.of(ofertaSalva));

//         List<OfertaEmpresaResumoDTO> lista = ofertaEmpresaService.listarOfertasDaEmpresa(1L);
//         assertFalse(lista.isEmpty());

//         when(ofertaRepository.findByProdutoEmpresaId(2L)).thenReturn(Collections.emptyList());
//         assertTrue(ofertaEmpresaService.listarOfertasDaEmpresa(2L).isEmpty());
//     }

//     // ==========================================
//     // BLOCO 3: VISUALIZAÇÃO DE DETALHES (ANTI-IDOR)
//     // ==========================================

//     @Test
//     @DisplayName("TC_OFER_011: Visualização de Detalhes com Sucesso")
//     void deveVisualizarDetalhesOferta() {
//         // Novo método anti-IDOR do diagrama
//         when(ofertaRepository.findByIdAndProdutoEmpresaId(100L, 1L)).thenReturn(Optional.of(ofertaSalva));
        
//         OfertaEmpresaDetalhesDTO dto = ofertaEmpresaService.visualizarOfertaDaEmpresa(100L, 1L);
//         assertNotNull(dto);
//     }

//     @Test
//     @DisplayName("TC_OFER_012 e TC_OFER_013: Segurança IDOR e Oferta Inexistente")
//     void deveBloquearVisualizacaoIdorOuInexistente() {
//         when(ofertaRepository.findByIdAndProdutoEmpresaId(100L, 2L)).thenReturn(Optional.empty());
//         assertThrows(RuntimeException.class, () -> ofertaEmpresaService.visualizarOfertaDaEmpresa(100L, 2L));
//     }

//     // ==========================================
//     // BLOCO 4: EDIÇÃO DE OFERTA
//     // ==========================================

//     @Test
//     @DisplayName("TC_OFER_014: Edição de Oferta e Recálculo de Desconto")
//     void deveEditarOfertaERecalcularDesconto() {
//         when(ofertaRepository.findByIdAndProdutoEmpresaId(100L, 1L)).thenReturn(Optional.of(ofertaSalva));
//         when(ofertaRepository.save(any())).thenReturn(ofertaSalva);

//         OfertaEmpresaResumoDTO edicaoDTO = new OfertaEmpresaResumoDTO();
//         edicaoDTO.setPrecoPromocional(new BigDecimal("10.00")); 
//         edicaoDTO.setDataFimOferta(LocalDate.now().plusDays(20));
//         edicaoDTO.setValidadeProduto(LocalDate.now().plusDays(30));

//         ofertaEmpresaService.editarOferta(100L, edicaoDTO, 1L);

//         ArgumentCaptor<Oferta> captor = ArgumentCaptor.forClass(Oferta.class);
//         verify(ofertaRepository).save(captor.capture());
//         assertEquals(50.0, captor.getValue().getPercentualDesconto());
//     }

//     @Test
//     @DisplayName("TC_OFER_016: Erro na Edição - Violando regras de data")
//     void deveLancarErroDatasInvalidasNaEdicao() {
//         when(ofertaRepository.findByIdAndProdutoEmpresaId(100L, 1L)).thenReturn(Optional.of(ofertaSalva));

//         OfertaEmpresaResumoDTO edicaoDTO = new OfertaEmpresaResumoDTO();
//         edicaoDTO.setDataFimOferta(LocalDate.now().plusDays(20));
//         edicaoDTO.setValidadeProduto(LocalDate.now().minusDays(1)); // Vencido

//         assertThrows(IllegalArgumentException.class, () -> ofertaEmpresaService.editarOferta(100L, edicaoDTO, 1L));
//     }

//     // ==========================================
//     // BLOCO 5: INATIVAÇÃO DE OFERTA
//     // ==========================================

//     @Test
//     @DisplayName("TC_OFER_017 e TC_OFER_020: Inativação com Sucesso e Proteção Dupla")
//     void deveInativarOfertaCorretamente() {
//         when(ofertaRepository.findByIdAndProdutoEmpresaId(100L, 1L)).thenReturn(Optional.of(ofertaSalva));

//         ofertaEmpresaService.inativarOferta(100L, 1L);

//         ArgumentCaptor<Oferta> captor = ArgumentCaptor.forClass(Oferta.class);
//         verify(ofertaRepository).save(captor.capture());
//         assertFalse(captor.getValue().getAtivo()); 

//         ofertaSalva.setAtivo(false);
//         assertThrows(IllegalArgumentException.class, () -> ofertaEmpresaService.inativarOferta(100L, 1L));
//     }
// }