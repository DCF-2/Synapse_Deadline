package com.synapse.deadline.controller;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO;
import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO;
import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.service.ProdutoEmpresaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        return ResponseEntity.ok(
                service.listarProdutos()
        );
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
            @PageableDefault(size = 12, sort = "tituloProduto") Pageable pageable
    ) {
        return ResponseEntity.ok(service.listarProdutosPorEmpresaLogada(pageable));
    }
}