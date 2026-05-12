package com.synapse.deadline.controller;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaResponseDTO;
import com.synapse.deadline.service.EmpresaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/empresa")
public class EmpresaController {

    @Autowired
    private EmpresaService service;

    @PostMapping("/cadastro")
    public ResponseEntity<EmpresaResponseDTO> cadastrar(@Valid @RequestBody EmpresaCadastroDTO dto) {
        EmpresaResponseDTO response = service.cadastrar(dto);
        // <-- FIX: Retorna 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}