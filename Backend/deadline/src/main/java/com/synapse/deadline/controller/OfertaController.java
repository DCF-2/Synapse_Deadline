package com.synapse.deadline.controller;

import com.synapse.deadline.dto.OfertaRequestDTO;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.service.OfertaService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/oferta")
public class OfertaController {

    @Autowired
    private OfertaService service;

    @PostMapping
    public ResponseEntity<Oferta> criar(
            @Valid @RequestBody OfertaRequestDTO dto
    ) {

        return ResponseEntity.ok(
                service.criar(dto)
        );
    }

    @GetMapping
    public ResponseEntity<List<Oferta>> listar() {

        return ResponseEntity.ok(
                service.listar()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Oferta> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody OfertaRequestDTO dto
    ) {

        return ResponseEntity.ok(
                service.atualizar(id, dto)
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
