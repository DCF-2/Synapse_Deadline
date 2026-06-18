package com.synapse.deadline.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import com.synapse.deadline.dto.FiltroOfertasConsumidorDTO;
import com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Endereco;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.ProdutoRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Integração - Geolocalização de ofertas")
class OfertaGeolocalizacaoIntegrationTest {

    @Autowired
    private OfertaService ofertaService;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private CategoriaProdutoRepository categoriaProdutoRepository;

    @Autowired
    private RamoEmpresaRepository ramoEmpresaRepository;

    private Long ofertaPertoId;
    private Long ofertaLongeId;

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Deve calcular distância, filtrar por raio e ordenar por proximidade")
    void deveFiltrarEOrdenarPorDistancia() {
        criarCenarioComDuasLojas();

        FiltroOfertasConsumidorDTO filtro = new FiltroOfertasConsumidorDTO();
        // Consumidor no centro de Recife
        filtro.setLatitude(-8.0476);
        filtro.setLongitude(-34.8770);

        Page<OfertaResponseDTO> comDistancia = ofertaService.listarOfertasPublicas(
                filtro, PageRequest.of(0, 10));

        assertEquals(2, comDistancia.getTotalElements());
        assertNotNull(comDistancia.getContent().get(0).getDistanciaKm());
        assertTrue(comDistancia.getContent().stream()
                .anyMatch(o -> o.getDistanciaKm() != null && o.getDistanciaKm() < 5));
        assertTrue(comDistancia.getContent().stream()
                .anyMatch(o -> o.getDistanciaKm() != null && o.getDistanciaKm() > 2000));

        filtro.setDistanciaMaxKm(50.0);
        Page<OfertaResponseDTO> filtrado = ofertaService.listarOfertasPublicas(
                filtro, PageRequest.of(0, 10));

        assertEquals(1, filtrado.getTotalElements());
        assertEquals(ofertaPertoId, filtrado.getContent().get(0).getId());
        assertTrue(filtrado.getContent().get(0).getDistanciaKm() < 50);

        Page<OfertaResponseDTO> ordenado = ofertaService.listarOfertasPublicas(
                filtroSemRaio(), PageRequest.of(0, 10, Sort.by("distanciaKm").ascending()));

        assertEquals(ofertaPertoId, ordenado.getContent().get(0).getId());
        assertTrue(ordenado.getContent().get(0).getDistanciaKm()
                < ordenado.getContent().get(1).getDistanciaKm());

        OfertaConsumidorDetalhesDTO detalhe = ofertaService.buscarDetalhesPublicos(
                ofertaPertoId, -8.0476, -34.8770);

        assertNotNull(detalhe.getDistanciaKm());
        assertTrue(detalhe.getDistanciaKm() < 50);
    }

    private FiltroOfertasConsumidorDTO filtroSemRaio() {
        FiltroOfertasConsumidorDTO filtro = new FiltroOfertasConsumidorDTO();
        filtro.setLatitude(-8.0476);
        filtro.setLongitude(-34.8770);
        return filtro;
    }

    private void criarCenarioComDuasLojas() {
        RamoEmpresa ramo = ramoEmpresaRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    RamoEmpresa r = new RamoEmpresa();
                    r.setNome("Farmácia");
                    r.setDescricao("Teste");
                    r.setAtivo(true);
                    return ramoEmpresaRepository.save(r);
                });

        CategoriaProduto categoria = categoriaProdutoRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    CategoriaProduto c = new CategoriaProduto();
                    c.setNome("Medicamentos");
                    c.setSlug("medicamentos");
                    c.setAtivo(true);
                    return categoriaProdutoRepository.save(c);
                });

        Empresa lojaPerto = salvarEmpresa(ramo, "Farmácia Recife", -8.0500, -34.8800);
        Empresa lojaLonge = salvarEmpresa(ramo, "Farmácia SP", -23.5505, -46.6333);

        ofertaPertoId = salvarOferta(lojaPerto, categoria, "Dipirona Recife").getId();
        ofertaLongeId = salvarOferta(lojaLonge, categoria, "Dipirona SP").getId();
    }

    private Empresa salvarEmpresa(RamoEmpresa ramo, String nome, double lat, double lng) {
        Endereco endereco = new Endereco();
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("100");
        endereco.setBairro("Centro");
        endereco.setCep("50000-000");
        endereco.setCidade("Recife");
        endereco.setUf("PE");

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(nome);
        empresa.setRazaoSocial(nome + " LTDA");
        empresa.setCnpj(UUID.randomUUID().toString().substring(0, 14));
        empresa.setRamo(ramo);
        empresa.setEndereco(endereco);
        empresa.setLatitude(lat);
        empresa.setLongitude(lng);
        empresa.setEmailLogin("geo-" + UUID.randomUUID() + "@test.com");
        empresa.setSenhaHash("hash");
        empresa.setInstrucoesRetirada("Retirar no balcão");
        empresa.setHorarioFuncionamento("08:00-18:00");
        return empresaRepository.save(empresa);
    }

    private Oferta salvarOferta(Empresa empresa, CategoriaProduto categoria, String titulo) {
        Produto produto = new Produto();
        produto.setTituloProduto(titulo);
        produto.setCodBarrasEan(UUID.randomUUID().toString().substring(0, 13));
        produto.setCategoria(categoria);
        produto.setDescricao("Produto de teste");
        produto.setPrecoOriginal(new BigDecimal("20.00"));
        produto.setAtivo(true);
        produto.setEmpresa(empresa);
        produto = produtoRepository.save(produto);

        Oferta oferta = new Oferta();
        oferta.setProduto(produto);
        oferta.setValidadeProduto(LocalDate.now().plusDays(15));
        oferta.setDataFimOferta(LocalDate.now().plusDays(30));
        oferta.setPrecoPromocional(new BigDecimal("10.00"));
        oferta.setPercentualDesconto(50.0);
        oferta.setAtivo(true);
        oferta.setCliquesContato(0);
        return ofertaRepository.save(oferta);
    }
}
