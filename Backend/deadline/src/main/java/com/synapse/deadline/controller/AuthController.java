package com.synapse.deadline.controller;

import com.synapse.deadline.dto.LoginDTO;
import com.synapse.deadline.dto.AuthResponseDTO;
import com.synapse.deadline.service.AuthService;
import com.synapse.deadline.service.EmpresaService;
import org.springframework.web.bind.annotation.CrossOrigin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") 
@Tag(name = "Autenticação", description = "Endpoints para gerenciamento de acesso e tokens")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmpresaService empresaService;

    @Operation(summary = "Realiza o login da Empresa")
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO dto) {
        // O serviço agora devolve o DTO corretamente populado
        AuthResponseDTO response = authService.autenticar(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<Void> esqueciSenha(@RequestParam String email) {
        empresaService.recuperarSenha(email); 
        return ResponseEntity.ok().build();
    }
}