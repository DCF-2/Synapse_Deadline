package com.synapse.deadline.service;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaPerfilDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Endereco;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository; 

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository repository;
    
    @Autowired
    private RamoEmpresaRepository ramoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public EmpresaPerfilDTO cadastrar(EmpresaCadastroDTO dto) {
        
        if (repository.findByEmailLogin(dto.getEmailLogin()).isPresent()) {
            throw new IllegalArgumentException("E-mail de login já cadastrado");
        }
        if (repository.findByCnpj(dto.getCnpj()).isPresent()) {
            throw new IllegalArgumentException("CNPJ já cadastrado");
        }

        // Busca o ramo no banco para garantir a integridade referencial
        RamoEmpresa ramo = ramoRepository.findById(dto.getIdRamo())
                .orElseThrow(() -> new IllegalArgumentException("Ramo de atuação inválido"));

        Empresa e = new Empresa();
        e.setNomeFantasia(dto.getNomeFantasia());
        e.setRazaoSocial(dto.getRazaoSocial());
        e.setCnpj(dto.getCnpj());
        e.setLogotipo(dto.getLogotipo());
        e.setRamo(ramo);
        
        // Mapeamento do objeto Endereco (Embeddable)
        Endereco end = new Endereco();
        end.setLogradouro(dto.getEndereco().getLogradouro());
        end.setNumero(dto.getEndereco().getNumero());
        end.setComplemento(dto.getEndereco().getComplemento());
        end.setBairro(dto.getEndereco().getBairro());
        end.setCep(dto.getEndereco().getCep());
        end.setCidade(dto.getEndereco().getCidade());
        end.setUf(dto.getEndereco().getUf());
        e.setEndereco(end);
        
        e.setEmailLogin(dto.getEmailLogin());
        e.setSenhaHash(passwordEncoder.encode(dto.getSenha())); // Atualizado para senhaHash
        
        e.setContatoWhatsapp(dto.getContatoWhatsapp());
        e.setContato1(dto.getContato1());
        e.setContato2(dto.getContato2());
        e.setEmailContato(dto.getEmailContato());
        e.setInstrucoesRetirada(dto.getInstrucoesRetirada());
        e.setHorarioFuncionamento(dto.getHorarioFuncionamento()); // Atualizado

        Empresa salva = repository.save(e);

        EmpresaPerfilDTO retorno = new EmpresaPerfilDTO();
        retorno.setNomeFantasia(salva.getNomeFantasia());
        retorno.setCnpj(salva.getCnpj());
        retorno.setEmailLogin(salva.getEmailLogin());
        // (Setar os demais campos conforme necessidade do retorno)
        
        return retorno;
    }

    public void recuperarSenha(String email) {
        Empresa empresa = repository.findByEmailLogin(email)
            .orElseThrow(() -> new RuntimeException("E-mail não encontrado"));

        String novaSenhaPlana = UUID.randomUUID().toString().substring(0, 8);
        empresa.setSenhaHash(passwordEncoder.encode(novaSenhaPlana)); // Atualizado
        repository.save(empresa);

        System.out.println("NOVA SENHA PARA " + email + ": " + novaSenhaPlana);
    }
}