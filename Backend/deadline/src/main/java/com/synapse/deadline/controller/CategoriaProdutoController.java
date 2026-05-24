package com.synapse.deadline.controller;

import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categoria")
public class CategoriaProdutoController {

    @Autowired
    private CategoriaProdutoRepository repository;

    @PostMapping
    public ResponseEntity<CategoriaProduto> criar(
            @RequestBody CategoriaProduto categoria
    ) {

        return ResponseEntity.ok(
                repository.save(categoria)
        );
    }

    @GetMapping
    public ResponseEntity<List<CategoriaProduto>> listar() {

        return ResponseEntity.ok(
                repository.findAll()
        );
    }
}
