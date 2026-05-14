package com.synapse.deadline.controller;

import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.dto.ProdutoResponseDTO;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.service.ProdutoService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produto")
public class ProdutoController {

    @Autowired
    private ProdutoService service;

    @PostMapping("/{idEmpresa}")
    public ResponseEntity<Produto> cadastrar(
            @Valid @RequestBody ProdutoRequestDTO dto,
            @PathVariable Long idEmpresa
    ) {

        return ResponseEntity.ok(
                service.cadastrarProduto(dto, idEmpresa)
        );
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        return ResponseEntity.ok(
                service.listarProdutos()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(
            @PathVariable Long id
    ) {

        service.remover(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint GET /produto/empresa
     * Retorna a lista de produtos da empresa autenticada.
     */
    @GetMapping("/empresa")
    public ResponseEntity<List<ProdutoResponseDTO>> listarPorEmpresa() {
        return ResponseEntity.ok(
                service.listarProdutosPorEmpresaLogada()
        );
    }
}
