package com.synapse.deadline.service;

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

    public String autenticar(LoginDTO dto) {
        Empresa empresa = repository.findByEmailLogin(dto.emailLogin())
                .orElseThrow(() -> new CredenciaisInvalidasException());

        if (!passwordEncoder.matches(dto.senha(), empresa.getSenha())) {
            throw new CredenciaisInvalidasException();
        }

        return tokenService.gerarToken(empresa);
    }
}