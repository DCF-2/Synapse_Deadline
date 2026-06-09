package com.synapse.deadline.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaPerfilDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Endereco;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;


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

    @Transactional(readOnly = true)
    public com.synapse.deadline.dto.EmpresaPerfilDTO obterPerfilLogado() {
        // Pega a empresa do contexto de segurança
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Empresa empresa = repository.findById(empresaLogada.getId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Empresa não encontrada"));

        return converterParaPerfilDTO(empresa);
    }

   @Transactional(readOnly = true)
    public List<com.synapse.deadline.entity.RamoEmpresa> listarTodosRamos() {
        return ramoRepository.findAll();
    }

    @Transactional
    public com.synapse.deadline.dto.EmpresaPerfilDTO atualizarPerfil(com.synapse.deadline.dto.EmpresaPerfilDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Empresa empresa = repository.findById(empresaLogada.getId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Empresa não encontrada"));

        // Atualiza os dados básicos
        empresa.setNomeFantasia(dto.getNomeFantasia());
        empresa.setRazaoSocial(dto.getRazaoSocial());
        empresa.setLogotipo(dto.getLogotipo()); // String recebida como URL do Cloudinary do front
        empresa.setContatoWhatsapp(dto.getContatoWhatsapp());
        empresa.setContato1(dto.getContato1());
        empresa.setContato2(dto.getContato2());
        empresa.setEmailContato(dto.getEmailContato());
        empresa.setHorarioFuncionamento(dto.getHorarioFuncionamento());
        empresa.setInstrucoesRetirada(dto.getInstrucoesRetirada());
        
        // VINCULAÇÃO DO RAMO DE FORMA DINÂMICA
        if (dto.getIdRamo() != null) {
            com.synapse.deadline.entity.RamoEmpresa ramo = ramoRepository.findById(dto.getIdRamo())
                    .orElseThrow(() -> new IllegalArgumentException("Ramo da empresa inválido"));
            empresa.setRamo(ramo);
        }

        // Atualiza o Endereço (Objeto embutido)
        if (empresa.getEndereco() == null) {
            empresa.setEndereco(new com.synapse.deadline.entity.Endereco());
        }
        if (dto.getEndereco() != null) {
            empresa.getEndereco().setLogradouro(dto.getEndereco().getLogradouro());
            empresa.getEndereco().setNumero(dto.getEndereco().getNumero());
            empresa.getEndereco().setComplemento(dto.getEndereco().getComplemento());
            empresa.getEndereco().setBairro(dto.getEndereco().getBairro());
            empresa.getEndereco().setCep(dto.getEndereco().getCep());
            empresa.getEndereco().setCidade(dto.getEndereco().getCidade());
            empresa.getEndereco().setUf(dto.getEndereco().getUf());
        }

        Empresa atualizada = repository.save(empresa);
        return converterParaPerfilDTO(atualizada);
    }

    // -- MÉTODOS AUXILIARES ---

    /**
     * Converte um objeto Empresa para um DTO de perfil.
     * @param e O objeto Empresa a ser convertido.
     * @return O DTO de perfil correspondente.
     */
    private com.synapse.deadline.dto.EmpresaPerfilDTO converterParaPerfilDTO(Empresa empresa) {
        com.synapse.deadline.dto.EmpresaPerfilDTO dto = new com.synapse.deadline.dto.EmpresaPerfilDTO();
        
        // Mapeamento Completo baseado no seu DTO
        dto.setNomeFantasia(empresa.getNomeFantasia());
        dto.setRazaoSocial(empresa.getRazaoSocial());
        dto.setCnpj(empresa.getCnpj());
        dto.setLogotipo(empresa.getLogotipo());
        dto.setIdRamo(empresa.getRamo() != null ? empresa.getRamo().getId() : null);
        dto.setContatoWhatsapp(empresa.getContatoWhatsapp());
        dto.setContato1(empresa.getContato1());
        dto.setContato2(empresa.getContato2());
        dto.setEmailContato(empresa.getEmailContato());
        dto.setInstrucoesRetirada(empresa.getInstrucoesRetirada());
        dto.setEmailLogin(empresa.getEmailLogin());
        dto.setHorarioFuncionamento(empresa.getHorarioFuncionamento());

        // Endereço
        com.synapse.deadline.dto.EnderecoDTO endDto = new com.synapse.deadline.dto.EnderecoDTO();
        if (empresa.getEndereco() != null) {
            endDto.setLogradouro(empresa.getEndereco().getLogradouro());
            endDto.setNumero(empresa.getEndereco().getNumero());
            endDto.setComplemento(empresa.getEndereco().getComplemento());
            endDto.setBairro(empresa.getEndereco().getBairro());
            endDto.setCep(empresa.getEndereco().getCep());
            endDto.setCidade(empresa.getEndereco().getCidade());
            endDto.setUf(empresa.getEndereco().getUf());
        }
        dto.setEndereco(endDto);
        
        return dto;
    }

    /* Listar ramos de empresa públicos */
    public List<RamoEmpresa> listarRamosPublicos() {
        return ramoRepository.findByAtivoTrue();
    }

    @Transactional(readOnly = true)
    public com.synapse.deadline.dto.EmpresaPerfilDTO obterPerfilPublico(Long idEmpresa) {
        
        Empresa empresa = repository.findById(idEmpresa)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Loja não encontrada."));

        com.synapse.deadline.dto.EmpresaPerfilDTO dto = new com.synapse.deadline.dto.EmpresaPerfilDTO();
        
        // 1. Dados Públicos (Visíveis para o Consumidor)
        dto.setNomeFantasia(empresa.getNomeFantasia());
        dto.setLogotipo(empresa.getLogotipo());
        dto.setContatoWhatsapp(empresa.getContatoWhatsapp());
        dto.setHorarioFuncionamento(empresa.getHorarioFuncionamento());
        dto.setInstrucoesRetirada(empresa.getInstrucoesRetirada());
        
        // 2. Omitir DADOS SENSÍVEIS (Segurança / Anti-vazamento)
        dto.setRazaoSocial(null);
        dto.setCnpj(null);
        dto.setEmailLogin(null);
        dto.setIdRamo(null); // O consumidor não precisa de saber o ID interno do ramo
        
        // Contatos extra públicos
        dto.setContato1(empresa.getContato1());
        dto.setContato2(empresa.getContato2());
        dto.setEmailContato(empresa.getEmailContato());

        // 3. Endereço Público
        com.synapse.deadline.dto.EnderecoDTO endDto = new com.synapse.deadline.dto.EnderecoDTO();
        if (empresa.getEndereco() != null) {
            endDto.setLogradouro(empresa.getEndereco().getLogradouro());
            endDto.setNumero(empresa.getEndereco().getNumero());
            endDto.setComplemento(empresa.getEndereco().getComplemento());
            endDto.setBairro(empresa.getEndereco().getBairro());
            endDto.setCidade(empresa.getEndereco().getCidade());
            endDto.setUf(empresa.getEndereco().getUf());
            // Cep opcional omitir se não for necessário para segurança, mas geralmente é público.
            endDto.setCep(empresa.getEndereco().getCep()); 
        }
        dto.setEndereco(endDto);
        
        return dto;
    }

    @Transactional(readOnly = true)
    public List<com.synapse.deadline.dto.EmpresaResumoDTO> buscarLojasPorNome(String nome) {
        if (nome == null || nome.trim().length() < 3) return java.util.List.of();
        
        return repository.findTop3ByNomeFantasiaContainingIgnoreCase(nome)
                .stream().map(emp -> {
                    com.synapse.deadline.dto.EmpresaResumoDTO dto = new com.synapse.deadline.dto.EmpresaResumoDTO();
                    dto.setId(emp.getId());
                    dto.setNomeFantasia(emp.getNomeFantasia());
                    dto.setLogotipo(emp.getLogotipo());
                    return dto;
                }).toList();
    }
}