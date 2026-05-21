package com.synapse.deadline.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaPerfilDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Endereco;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository; 
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.synapse.deadline.repository.RamoEmpresaRepository;


@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository repository;
    
    @Autowired
    private RamoEmpresaRepository ramoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Cadastra uma nova empresa.
     * @param dto Os dados do cadastro da empresa.
     * @return O DTO com os dados do perfil da empresa cadastrada.
     */
    public EmpresaPerfilDTO cadastrarEmpresa(EmpresaCadastroDTO dto) {
        
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
        e.setSenhaHash(passwordEncoder.encode(dto.getSenha())); 
        
        e.setContatoWhatsapp(dto.getContatoWhatsapp());
        e.setContato1(dto.getContato1());
        e.setContato2(dto.getContato2());
        e.setEmailContato(dto.getEmailContato());
        e.setInstrucoesRetirada(dto.getInstrucoesRetirada());
        e.setHorarioFuncionamento(dto.getHorarioFuncionamento()); 

        Empresa salva = repository.save(e);

        EmpresaPerfilDTO retorno = new EmpresaPerfilDTO();
        retorno.setNomeFantasia(salva.getNomeFantasia());
        retorno.setCnpj(salva.getCnpj());
        retorno.setEmailLogin(salva.getEmailLogin());
        // (Setar os demais campos conforme necessidade do retorno)
        
        return retorno;
    }

    /**
     * Retorna os dados do perfil da empresa logada.
     * @return O DTO com os dados do perfil da empresa.
     */
    public EmpresaPerfilDTO visualizarPerfil() {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return converterParaPerfilDTO(empresaLogada);
    }

    /**
     * Atualiza os dados do perfil da empresa logada.
     * @param dto O DTO com os dados atualizados do perfil da empresa.
     * @return O DTO com os dados atualizados do perfil da empresa.
     */
    public EmpresaPerfilDTO editarPerfil(EmpresaPerfilDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Empresa e = repository.findById(empresaLogada.getId())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        e.setNomeFantasia(dto.getNomeFantasia());
        e.setRazaoSocial(dto.getRazaoSocial());
        e.setContatoWhatsapp(dto.getContatoWhatsapp());
        e.setContato1(dto.getContato1());
        e.setContato2(dto.getContato2());
        e.setInstrucoesRetirada(dto.getInstrucoesRetirada());
        e.setHorarioFuncionamento(dto.getHorarioFuncionamento());
        
        repository.save(e);
        return converterParaPerfilDTO(e);
    }

    // -- MÉTODOS AUXILIARES ---

    /**
     * Converte um objeto Empresa para um DTO de perfil.
     * @param e O objeto Empresa a ser convertido.
     * @return O DTO de perfil correspondente.
     */
    private EmpresaPerfilDTO converterParaPerfilDTO(Empresa e) {
        EmpresaPerfilDTO dto = new EmpresaPerfilDTO();
        dto.setNomeFantasia(e.getNomeFantasia());
        dto.setRazaoSocial(e.getRazaoSocial());
        dto.setCnpj(e.getCnpj());
        dto.setLogotipo(e.getLogotipo());
        dto.setContatoWhatsapp(e.getContatoWhatsapp());
        dto.setEmailContato(e.getEmailContato());
        dto.setInstrucoesRetirada(e.getInstrucoesRetirada());
        dto.setHorarioFuncionamento(e.getHorarioFuncionamento());
        return dto;
    }
}