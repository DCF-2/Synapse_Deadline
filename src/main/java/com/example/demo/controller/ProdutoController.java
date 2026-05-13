package com.example.demo.controller;

import com.example.demo.dto.ProdutoRequestDTO;
import com.example.demo.entity.Produto;
import com.example.demo.service.ProdutoService;

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
}
