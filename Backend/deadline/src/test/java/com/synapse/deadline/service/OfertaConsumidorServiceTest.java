// package com.synapse.deadline.service;

// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageImpl;
// import org.springframework.data.domain.Pageable;

// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.util.Collections;
// import java.util.List;
// import java.util.Optional;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.eq;
// import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class)
//@ActiveProfiles("test")
// class OfertaConsumidorServiceTest {

//     @InjectMocks
//     private OfertaConsumidorService ofertaConsumidorService;

//     @Mock
//     private OfertaRepository ofertaRepository;

//     private FiltroOfertasDTO filtroBasico;
//     private Oferta ofertaAtivaEValida;
//     private Oferta ofertaInativa;
//     private Oferta ofertaExpirada;

//     @BeforeEach
//     void setUp() {
//         filtroBasico = new FiltroOfertasDTO();

//         // Setup Oferta Válida
//         ofertaAtivaEValida = new Oferta();
//         // ofertaAtivaEValida.setId(1L);
//         ofertaAtivaEValida.setPrecoPromocional(new BigDecimal("15.00"));
//         ofertaAtivaEValida.setAtivo(true);
//         ofertaAtivaEValida.setDataFimOferta(LocalDate.now().plusDays(10));
//         ofertaAtivaEValida.setValidadeProduto(LocalDate.now().plusDays(20)); 
        
//         Produto produtoValido = new Produto();
//         produtoValido.setAtivo(true);
        
//         Empresa empresaValida = new Empresa();
//         produtoValido.setEmpresa(empresaValida);
//         ofertaAtivaEValida.setProduto(produtoValido);

//         // Setup Oferta Inativa
//         ofertaInativa = new Oferta();
//         // ofertaInativa.setId(2L);
//         ofertaInativa.setAtivo(false);
//         ofertaInativa.setDataFimOferta(LocalDate.now().plusDays(10));

//         // Setup Oferta Expirada (Data Fim no Passado)
//         ofertaExpirada = new Oferta();
//         // ofertaExpirada.setId(3L);
//         ofertaExpirada.setAtivo(true);
//         ofertaExpirada.setDataFimOferta(LocalDate.now().minusDays(1)); // Venceu ontem
//     }

//     // ==========================================
//     // BLOCO 1: LISTAGEM E FILTROS (PAGINADOS)
//     // ==========================================

//     @Test
//     @DisplayName("TC_CONS_001 e TC_CONS_002: Listagem sem Filtros e Ocultando Inativos")
//     void deveListarOfertasAtivasSemFiltros() {
//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
        
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class)))
//                 .thenReturn(paginaOfertas);

//         List<OfertaConsumidorResumoDTO> resultado = ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         assertFalse(resultado.isEmpty());
//         verify(ofertaRepository, times(1)).buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_003: Listagem com Filtro - Por Categoria")
//     void devePassarFiltroDeCategoriaParaORepositorio() {
//         filtroBasico.setIdCategoria(2L);

//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class))).thenReturn(paginaOfertas);

//         ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         verify(ofertaRepository).buscarOfertasConsumidor(argThat(filtro -> 
//             filtro.getIdCategoria() != null && filtro.getIdCategoria() == 2L
//         ), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_004: Listagem com Filtro - Preço Máximo")
//     void devePassarFiltroDePrecoMaximoParaORepositorio() {
//         filtroBasico.setPrecoMax(new BigDecimal("50.00"));

//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class))).thenReturn(paginaOfertas);

//         ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         verify(ofertaRepository).buscarOfertasConsumidor(argThat(filtro -> 
//             filtro.getPrecoMax() != null && filtro.getPrecoMax().equals(new BigDecimal("50.00"))
//         ), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_005: Listagem com Filtro - Preço Mínimo")
//     void devePassarFiltroDePrecoMinimoParaORepositorio() {
//         filtroBasico.setPrecoMin(new BigDecimal("10.00"));

//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class))).thenReturn(paginaOfertas);

//         ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         verify(ofertaRepository).buscarOfertasConsumidor(argThat(filtro -> 
//             filtro.getPrecoMin() != null && filtro.getPrecoMin().equals(new BigDecimal("10.00"))
//         ), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_006: Listagem com Filtro - Raio de Distância")
//     void devePassarFiltroDeDistanciaParaORepositorio() {
//         filtroBasico.setDistanciaMaxKm(15);

//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class))).thenReturn(paginaOfertas);

//         ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         verify(ofertaRepository).buscarOfertasConsumidor(argThat(filtro -> 
//             filtro.getDistanciaMaxKm() != null && filtro.getDistanciaMaxKm() == 15
//         ), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_007: Listagem com Filtro - Combinação Múltipla")
//     void devePassarFiltrosCombinadosParaORepositorio() {
//         filtroBasico.setIdCategoria(2L);
//         filtroBasico.setPrecoMax(new BigDecimal("50.00"));
//         filtroBasico.setDistanciaMaxKm(10);

//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class))).thenReturn(paginaOfertas);

//         ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         verify(ofertaRepository).buscarOfertasConsumidor(argThat(filtro -> 
//             filtro.getIdCategoria() == 2L &&
//             filtro.getPrecoMax().equals(new BigDecimal("50.00")) &&
//             filtro.getDistanciaMaxKm() == 10
//         ), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_008: Listagem com Ordenação - menor_preco")
//     void devePassarOrdenacaoPorMenorPrecoParaORepositorio() {
//         filtroBasico.setOrdenarPor("menor_preco");

//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class))).thenReturn(paginaOfertas);

//         ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         verify(ofertaRepository).buscarOfertasConsumidor(argThat(filtro -> 
//             "menor_preco".equals(filtro.getOrdenarPor())
//         ), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_009: Listagem com Ordenação - maior_desconto")
//     void devePassarOrdenacaoPorMaiorDescontoParaORepositorio() {
//         filtroBasico.setOrdenarPor("maior_desconto");

//         Page<Oferta> paginaOfertas = new PageImpl<>(List.of(ofertaAtivaEValida));
//         when(ofertaRepository.buscarOfertasConsumidor(eq(filtroBasico), any(Pageable.class))).thenReturn(paginaOfertas);

//         ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         verify(ofertaRepository).buscarOfertasConsumidor(argThat(filtro -> 
//             "maior_desconto".equals(filtro.getOrdenarPor())
//         ), any(Pageable.class));
//     }

//     @Test
//     @DisplayName("TC_CONS_010: Listagem Vazia - Filtros muito restritivos")
//     void deveRetornarListaVaziaQuandoNenhumResultadoForEncontrado() {
//         Page<Oferta> paginaVazia = new PageImpl<>(Collections.emptyList());
//         when(ofertaRepository.buscarOfertasConsumidor(any(), any(Pageable.class)))
//                 .thenReturn(paginaVazia);

//         List<OfertaConsumidorResumoDTO> resultado = ofertaConsumidorService.listarOfertasConsumidor(filtroBasico);

//         assertTrue(resultado.isEmpty());
//     }

//     // ==========================================
//     // BLOCO 2: DETALHES DA OFERTA
//     // ==========================================

//     @Test
//     @DisplayName("TC_CONS_011: Visualização de Detalhes com Sucesso")
//     void deveRetornarDetalhesDeOfertaValidaEAtiva() {
//         when(ofertaRepository.findById(1L)).thenReturn(Optional.of(ofertaAtivaEValida));

//         OfertaConsumidorDetalhesDTO detalhes = ofertaConsumidorService.visualizarDetalhesOferta(1L);

//         assertNotNull(detalhes);
//         verify(ofertaRepository, times(1)).findById(1L);
//     }

//     @Test
//     @DisplayName("TC_CONS_012: Erro na Visualização - idOferta inexistente no banco de dados")
//     void deveLancarErroParaOfertaInexistente() {
//         when(ofertaRepository.findById(99L)).thenReturn(Optional.empty());

//         assertThrows(RuntimeException.class, () -> ofertaConsumidorService.visualizarDetalhesOferta(99L));
//     }

//     @Test
//     @DisplayName("TC_CONS_013: Regra de Negócio - Tentativa de acessar oferta que já expirou")
//     void deveBloquearAcessoAoDetalheDeOfertaExpirada() {
//         when(ofertaRepository.findById(3L)).thenReturn(Optional.of(ofertaExpirada));

//         Exception exception = assertThrows(IllegalArgumentException.class, () -> ofertaConsumidorService.visualizarDetalhesOferta(3L));
//         assertTrue(exception.getMessage().toLowerCase().contains("expirou") 
//                 || exception.getMessage().toLowerCase().contains("indisponível"));
//     }

//     @Test
//     @DisplayName("TC_CONS_014: Regra de Negócio - Tentativa de acessar oferta inativada")
//     void deveBloquearAcessoAoDetalheDeOfertaInativa() {
//         when(ofertaRepository.findById(2L)).thenReturn(Optional.of(ofertaInativa));

//         Exception exception = assertThrows(IllegalArgumentException.class, () -> ofertaConsumidorService.visualizarDetalhesOferta(2L));
//         assertTrue(exception.getMessage().toLowerCase().contains("expirou") 
//                 || exception.getMessage().toLowerCase().contains("indisponível"));
//     }
// }