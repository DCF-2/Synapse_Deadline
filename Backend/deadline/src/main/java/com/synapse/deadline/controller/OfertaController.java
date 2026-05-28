package com.synapse.deadline.controller;

import com.synapse.deadline.dto.OfertaRequestDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
import com.synapse.deadline.service.OfertaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

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

    @PutMapping("/{id}")
    public ResponseEntity<OfertaResponseDTO> atualizar(
            @PathVariable Long id, 
            @Valid @RequestBody OfertaRequestDTO dto) {
        return ResponseEntity.ok(ofertaService.atualizarOferta(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        ofertaService.removerOferta(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/empresa")
    public ResponseEntity<Page<OfertaResponseDTO>> listarDaEmpresa(
            @ModelAttribute com.synapse.deadline.dto.OfertaFiltroDTO filtro, // <-- Faltou adicionar isto!
            @PageableDefault(size = 12, sort = "id") Pageable pageable) {
        
        return ResponseEntity.ok(ofertaService.listarOfertasDaEmpresa(filtro, pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> alternarStatus(@PathVariable Long id, @RequestParam Boolean ativo) {
        ofertaService.alternarStatus(id, ativo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfertaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ofertaService.buscarPorId(id));
    }

    @GetMapping("/publico")
    public ResponseEntity<Page<OfertaResponseDTO>> listarPublico(
            @PageableDefault(size = 12, sort = "dataFimOferta") Pageable pageable) {
        
        return ResponseEntity.ok(ofertaService.listarOfertasPublicas(pageable));
    }
}
