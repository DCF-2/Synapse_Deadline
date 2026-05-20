package com.synapse.deadline.service;

import com.synapse.deadline.dto.AuthResponseDTO;
import com.synapse.deadline.dto.LoginDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.exceptions.CredenciaisInvalidasException;
import com.synapse.deadline.repository.EmpresaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private EmpresaRepository repository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder; 

    public AuthResponseDTO autenticar(LoginDTO dto) {
        // Busca a empresa pelo novo campo emailLogin
        Empresa empresa = repository.findByEmailLogin(dto.getEmailLogin())
                .orElseThrow(() -> new CredenciaisInvalidasException());
                
        // Valida a senha usando o novo campo senhaHash
        if (!passwordEncoder.matches(dto.getSenha(), empresa.getSenhaHash())) {
            throw new CredenciaisInvalidasException();
        }
        
        String token = tokenService.gerarToken(empresa);
        
        // Retorna o DTO completo conforme o diagrama de classes
        return new AuthResponseDTO(token, empresa.getId(), empresa.getNomeFantasia());
    }
}