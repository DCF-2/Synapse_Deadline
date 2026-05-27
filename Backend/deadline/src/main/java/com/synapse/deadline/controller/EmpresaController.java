package com.synapse.deadline.controller;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaPerfilDTO;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.RamoEmpresaRepository;
import com.synapse.deadline.service.EmpresaService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/empresa")
public class EmpresaController {

    @Autowired
    private EmpresaService service;

    

    /* Cadastrar empresa */
    @PostMapping("/cadastro")
    public ResponseEntity<EmpresaPerfilDTO> cadastrar(@Valid @RequestBody EmpresaCadastroDTO dto) {
        EmpresaPerfilDTO response = service.cadastrarEmpresa(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /* Visualizar perfil da empresa */
    @GetMapping("/perfil")
    public ResponseEntity<EmpresaPerfilDTO> visualizarMeuPerfil() {
        return ResponseEntity.ok(service.visualizarPerfil());
    }

    /* Editar perfil da empresa */
    @PutMapping("/perfil")
    public ResponseEntity<EmpresaPerfilDTO> editarMeuPerfil(@Valid @RequestBody EmpresaPerfilDTO dto) {
        return ResponseEntity.ok(service.editarPerfil(dto));
    }

    /* Listar ramos de empresa públicos */
   @GetMapping("/ramo/publico")
    public ResponseEntity<List<RamoEmpresa>> listarRamosPublicos() {
        return ResponseEntity.ok(service.listarRamosPublicos());
}
}