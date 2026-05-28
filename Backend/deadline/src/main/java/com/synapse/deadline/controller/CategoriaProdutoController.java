package com.synapse.deadline.controller;

import com.synapse.deadline.dto.CategoriaResponseDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/categoria")
public class CategoriaProdutoController {

    @Autowired
    private CategoriaProdutoRepository repository;

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar() {
        // Busca as categorias e converte para DTO limpo, evitando erros de serialização do JSON
        List<CategoriaResponseDTO> listaSegura = repository.findAll().stream().map(cat -> {
            CategoriaResponseDTO dto = new CategoriaResponseDTO();
            dto.setId(cat.getId());
            dto.setNome(cat.getNome());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(listaSegura);
    }
    
}