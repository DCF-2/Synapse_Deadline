package com.synapse.deadline.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Endereco;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.ProdutoRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Teste de integração - ProdutoEmpresaService")
class ProdutoEmpresaServiceIntegrationTest {

    @Autowired
    private ProdutoEmpresaService produtoEmpresaService;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private CategoriaProdutoRepository categoriaProdutoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private RamoEmpresaRepository ramoEmpresaRepository;

    @AfterEach
    void limparContextoSeguranca() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("deve listar produtos com categoria sem LazyInitializationException")
    void deveListarProdutosComCategoriaSemLazyInitializationException() {
        RamoEmpresa ramo = new RamoEmpresa();
        ramo.setNome("Padaria");
        ramo.setDescricao("Padaria");
        ramo.setAtivo(true);
        ramo = ramoEmpresaRepository.save(ramo);

        Endereco endereco = new Endereco();
        endereco.setLogradouro("Rua A");
        endereco.setNumero("100");
        endereco.setComplemento("Sala 1");
        endereco.setBairro("Centro");
        endereco.setCep("01001000");
        endereco.setCidade("São Paulo");
        endereco.setUf("SP");

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia("Empresa Teste");
        empresa.setRazaoSocial("Empresa Teste LTDA");
        empresa.setCnpj("11.222.333/0001-81");
        empresa.setRamo(ramo);
        empresa.setEndereco(endereco);
        empresa.setEmailLogin("integ-" + UUID.randomUUID() + "@example.com");
        empresa.setSenhaHash("hash");
        empresa.setInstrucoesRetirada("Retirar no balcão");
        empresa.setHorarioFuncionamento("08:00-18:00");
        empresa = empresaRepository.save(empresa);

        CategoriaProduto categoria = new CategoriaProduto();
        categoria.setNome("Padaria");
        categoria.setSlug("padaria");
        categoria.setAtivo(true);
        categoria = categoriaProdutoRepository.save(categoria);

        Produto produto = new Produto();
        produto.setEmpresa(empresa);
        produto.setCategoria(categoria);
        produto.setTituloProduto("Pão de Forma");
        produto.setCodBarrasEan("1234567890123");
        produto.setDescricao("Pão fresco");
        produto.setPrecoOriginal(new BigDecimal("12.50"));
        produto.setFoto("img.png");
        produto.setAtivo(true);
        produtoRepository.save(produto);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(empresa, null, List.of())
        );

        Page<ProdutoEmpresaResumoDTO> pagina = produtoEmpresaService.listarProdutosPorEmpresaLogada(PageRequest.of(0, 10));

        assertFalse(pagina.isEmpty());
        assertEquals(1, pagina.getTotalElements());
        assertEquals("Pão de Forma", pagina.getContent().get(0).getTituloProduto());
        assertEquals("Padaria", pagina.getContent().get(0).getNomeCategoria());
    }
}
