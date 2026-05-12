package com.synapse.deadline.service;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.EmpresaRepository;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder; // <-- FIX: Injeção do BCrypt

    public EmpresaResponseDTO cadastrar(EmpresaCadastroDTO dto) {
        
        // <-- FIX: Validação de Duplicidade
        if (repository.existsByEmailLogin(dto.getEmailLogin())) {
            throw new RuntimeException("Já existe uma empresa registrada com este e-mail.");
        }
        if (repository.existsByCnpj(dto.getCnpj())) {
            throw new RuntimeException("Já existe uma empresa registrada com este CNPJ.");
        }

        Empresa e = new Empresa();
        e.setNomeFantasia(dto.getNomeFantasia());
        e.setRazaoSocial(dto.getRazaoSocial());
        e.setCnpj(dto.getCnpj());
        e.setEndereco(dto.getEndereco());
        e.setEmailLogin(dto.getEmailLogin());
        
        // <-- FIX: Encriptar a senha ANTES de salvar
        e.setSenha(passwordEncoder.encode(dto.getSenha()));
        
        e.setContatoWhatsapp(dto.getContatoWhatsapp());
        e.setContato1(dto.getContato1());
        e.setContato2(dto.getContato2());
        e.setInstrucoesRetirada(dto.getInstrucoesRetirada());
        e.setDiasFuncionamento(dto.getDiasFuncionamento());
        e.setHorarioAbertura(dto.getHorarioAbertura());
        e.setHorarioFechamento(dto.getHorarioFechamento());

        Empresa salva = repository.save(e);

        // <-- FIX: Retorna o DTO seguro
        return new EmpresaResponseDTO(salva.getId(), salva.getNomeFantasia(), salva.getCnpj(), salva.getEmailLogin());
    }

    public void recuperarSenha(String email) {
    Empresa empresa = repository.findByEmailLogin(email)
        .orElseThrow(() -> new RuntimeException("E-mail não encontrado"));

    // Gera uma senha aleatória simples
    String novaSenhaPlana = UUID.randomUUID().toString().substring(0, 8);
    
    // Atualiza no banco (criptografada)
    empresa.setSenha(passwordEncoder.encode(novaSenhaPlana));
    repository.save(empresa);

    // TODO: Integrar com Spring Mail para enviar 'novaSenhaPlana' por e-mail
    System.out.println("NOVA SENHA PARA " + email + ": " + novaSenhaPlana);
    }
}