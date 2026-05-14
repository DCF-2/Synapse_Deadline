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
    private PasswordEncoder passwordEncoder;

    public EmpresaResponseDTO cadastrar(EmpresaCadastroDTO dto) {
        
        // 1. Validações de Negócio (Precisam ser IllegalArgumentException para passar nos testes)
        if (repository.existsByEmailLogin(dto.getEmailLogin())) {
            throw new IllegalArgumentException("E-mail de login já cadastrado");
        }
        if (repository.existsByCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("CNPJ já cadastrado");
        }
        
        // Validação Lógica de Horários (TC_020)
        if (dto.getHorarioAbertura() != null && dto.getHorarioFechamento() != null) {
            if (dto.getHorarioFechamento().isBefore(dto.getHorarioAbertura())) {
                throw new IllegalArgumentException("Horário de fechamento não pode ser anterior ao horário de abertura");
            }
        }

        Empresa e = new Empresa();
        e.setNomeFantasia(dto.getNomeFantasia());
        e.setRazaoSocial(dto.getRazaoSocial());
        e.setCnpj(dto.getCnpj());
        
        // Concatena o endereço para salvar na entidade (já que a entidade possui apenas um campo 'endereco')
        String enderecoCompleto = String.format("%s, %s, %s, %s, %s, %s", 
            dto.getLogradouro(), dto.getNumero(), dto.getBairro(), dto.getCep(), dto.getCidade(), dto.getUf());
        e.setEndereco(enderecoCompleto);
        
        e.setEmailLogin(dto.getEmailLogin());
        
        // Encriptar a senha
        e.setSenha(passwordEncoder.encode(dto.getSenha()));
        
        e.setContatoWhatsapp(dto.getContatoWhatsapp());
        e.setContato1(dto.getContato1());
        e.setContato2(dto.getContato2());
        e.setInstrucoesRetirada(dto.getInstrucoesRetirada());
        e.setDiasFuncionamento(dto.getDiasFuncionamento());
        e.setHorarioAbertura(dto.getHorarioAbertura());
        e.setHorarioFechamento(dto.getHorarioFechamento());

        Empresa salva = repository.save(e);

        return new EmpresaResponseDTO(salva.getId(), salva.getNomeFantasia(), salva.getCnpj(), salva.getEmailLogin());
    }

    public void recuperarSenha(String email) {
        Empresa empresa = repository.findByEmailLogin(email)
            .orElseThrow(() -> new RuntimeException("E-mail não encontrado"));

        String novaSenhaPlana = UUID.randomUUID().toString().substring(0, 8);
        
        empresa.setSenha(passwordEncoder.encode(novaSenhaPlana));
        repository.save(empresa);

        System.out.println("NOVA SENHA PARA " + email + ": " + novaSenhaPlana);
    }
}