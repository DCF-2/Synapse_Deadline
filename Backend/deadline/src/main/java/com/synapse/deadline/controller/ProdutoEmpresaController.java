package com.synapse.deadline.controller;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO;
import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO;
import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.service.ProdutoEmpresaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/produto")
public class ProdutoEmpresaController {

    @Autowired
    private ProdutoEmpresaService service;

   @PostMapping
    public ResponseEntity<ProdutoEmpresaDetalhesDTO> cadastrar(
            @Valid @RequestBody ProdutoRequestDTO dto
    ) {
        return ResponseEntity.ok(service.cadastrarProduto(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoEmpresaDetalhesDTO> visualizarProduto(@PathVariable Long id) {
        return ResponseEntity.ok(service.visualizarProdutoDaEmpresa(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoEmpresaDetalhesDTO> editarProduto(
            @PathVariable Long id, 
            @Valid @RequestBody ProdutoRequestDTO dto) {
        return ResponseEntity.ok(service.editarProduto(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id); // O serviço agora fará a validação de propriedade e o Soft Delete
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint GET /produto/empresa
     * Retorna a lista de produtos da empresa autenticada de forma resumida.
     */
   @GetMapping("/empresa")
    public ResponseEntity<Page<ProdutoEmpresaResumoDTO>> listarPorEmpresa(
            @PageableDefault(size = 12, sort = "tituloProduto") Pageable pageable,
            @RequestParam(name = "nome", required = false) String nome,
            @RequestParam(name = "categoriaId", required = false) Long categoriaId,
            @RequestParam(name = "codBarrasEan", required = false) String codBarrasEan,
            @RequestParam(name = "descricao", required = false) String descricao,
            @RequestParam(name = "ativo", required = false) Boolean ativo,
            @RequestParam(name = "precoMin", required = false) BigDecimal precoMin,
            @RequestParam(name = "precoMax", required = false) BigDecimal precoMax
    ) {
        return ResponseEntity.ok(
                service.listarProdutosPorEmpresaLogada(
                        pageable,
                        nome,
                        categoriaId,
                        codBarrasEan,
                        descricao,
                        ativo,
                        precoMin,
                        precoMax
                )
        );
    }
}