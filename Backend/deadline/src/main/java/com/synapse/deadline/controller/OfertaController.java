package com.synapse.deadline.controller;

import com.synapse.deadline.dto.OfertaRequestDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
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
    private OfertaService ofertaService;

    @PostMapping
    public ResponseEntity<OfertaResponseDTO> criar(@Valid @RequestBody OfertaRequestDTO dto) {
        return ResponseEntity.ok(ofertaService.criarOferta(dto));
    }

    @GetMapping("/empresa")
    public ResponseEntity<List<OfertaResponseDTO>> listarDaEmpresa() {
        return ResponseEntity.ok(ofertaService.listarOfertasDaEmpresa());
    }

    @GetMapping("/publico")
    public ResponseEntity<List<OfertaResponseDTO>> listarPublico() {
        return ResponseEntity.ok(ofertaService.listarOfertasPublicas());
    }
}
