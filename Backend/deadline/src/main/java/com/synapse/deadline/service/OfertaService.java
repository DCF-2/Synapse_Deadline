package com.synapse.deadline.service;

import com.synapse.deadline.dto.OfertaFiltroDTO;
import com.synapse.deadline.dto.OfertaRequestDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.OfertaSpecifications;
import com.synapse.deadline.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
public class OfertaService {

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Transactional
    public OfertaResponseDTO criarOferta(OfertaRequestDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Produto produto = produtoRepository.findByIdAndEmpresaId(dto.getProdutoId(), empresaLogada.getId())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado ou acesso negado"));

        Oferta oferta = new Oferta();
        oferta.setProduto(produto);
        oferta.setValidadeProduto(dto.getValidadeProduto());
        oferta.setDataFimOferta(dto.getDataFimOferta());
        oferta.setPrecoPromocional(dto.getPrecoPromocional());
        oferta.setPercentualDesconto(dto.getPercentualDesconto());
        oferta.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        Oferta salvo = ofertaRepository.save(oferta);
        return converterParaResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasDaEmpresa(Pageable pageable) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ofertaRepository.findByProdutoEmpresaId(empresaLogada.getId(), pageable)
                .map(this::converterParaResponseDTO);
    }

    private OfertaResponseDTO converterParaResponseDTO(Oferta oferta) {
        OfertaResponseDTO dto = new OfertaResponseDTO();
        dto.setId(oferta.getId());
        dto.setProdutoId(oferta.getProduto().getId());
        dto.setTituloProduto(oferta.getProduto().getTituloProduto());
        dto.setNomeCategoria(oferta.getProduto().getCategoria().getNome());
        dto.setPrecoOriginal(oferta.getProduto().getPrecoOriginal());
        dto.setFoto(oferta.getProduto().getFoto());
        dto.setPrecoPromocional(oferta.getPrecoPromocional());
        dto.setPercentualDesconto(oferta.getPercentualDesconto());
        dto.setValidadeProduto(oferta.getValidadeProduto());
        dto.setDataFimOferta(oferta.getDataFimOferta());
        dto.setAtivo(oferta.getAtivo());
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasPublicas(Pageable pageable) {
        return ofertaRepository.findOfertasAtivas(pageable)
                .map(this::converterParaResponseDTO);
    }

    @Transactional
    public OfertaResponseDTO atualizarOferta(Long idOferta, OfertaRequestDTO dto) {
        // 1. Pega a empresa logada
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Busca a oferta existente
        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        // 3. Validação de Segurança: A oferta pertence a um produto desta empresa?
        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado: Você não tem permissão para alterar esta oferta.");
        }

        // 4. Atualiza os dados
        oferta.setValidadeProduto(dto.getValidadeProduto());
        oferta.setDataFimOferta(dto.getDataFimOferta());
        oferta.setPrecoPromocional(dto.getPrecoPromocional());
        oferta.setPercentualDesconto(dto.getPercentualDesconto());
        
        if (dto.getAtivo() != null) {
            oferta.setAtivo(dto.getAtivo());
        }

        // 5. Salva e converte para DTO
        Oferta salvo = ofertaRepository.save(oferta);
        return converterParaResponseDTO(salvo);
    }

    @Transactional
    public void removerOferta(Long idOferta) {
        // 1. Pega a empresa logada
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Busca a oferta
        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        // 3. Valida se a oferta pertence à empresa logada
        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado: Você não pode remover esta oferta.");
        }

        // 4. Deleta a oferta do banco (ou faça um "Soft Delete" setando ativo = false, se preferir)
        ofertaRepository.delete(oferta);
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasDaEmpresa(OfertaFiltroDTO filtro, Pageable pageable) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Aplica a especificação de segurança e filtros dinâmicos
        return ofertaRepository.findAll(OfertaSpecifications.comFiltros(filtro, empresaLogada.getId()), pageable)
                .map(this::converterParaResponseDTO);
    }

    
    @Transactional
    public void alternarStatus(Long idOferta, Boolean novoStatus) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado.");
        }
        oferta.setAtivo(novoStatus);
        ofertaRepository.save(oferta);
    }

    @Transactional(readOnly = true)
    public OfertaResponseDTO buscarPorId(Long idOferta) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        // Validação de segurança: a empresa só pode ver a própria oferta
        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado: Você não tem permissão para visualizar esta oferta.");
        }

        return converterParaResponseDTO(oferta);
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasPublicas(com.synapse.deadline.dto.FiltroOfertasConsumidorDTO filtro, Pageable pageable) {
        // [RF01, RF02, RF03] Lista filtrada e ordenada (Spring Data Pageable já resolve o ORDER BY do RF02)
        return ofertaRepository.findAll(com.synapse.deadline.repository.OfertaSpecifications.filtroVitrinePublica(filtro), pageable)
                .map(this::converterParaResponseDTO);
    }

    @Transactional(readOnly = true)
    public com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO buscarDetalhesPublicos(Long id) {
        // [RF04] Detalhes ricos da oferta
        Oferta oferta = ofertaRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Oferta não encontrada."));

        // Validação de segurança: Oferta tem de estar ativa e não expirada
        if (!oferta.getAtivo() || !oferta.getProduto().getAtivo() || oferta.getDataFimOferta().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Esta oferta já não está disponível.");
        }

        com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO dto = new com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO();
        dto.setId(oferta.getId());
        dto.setTituloProduto(oferta.getProduto().getTituloProduto());
        dto.setDescricao(oferta.getProduto().getDescricao());
        dto.setFoto(oferta.getProduto().getFoto());
        dto.setPrecoOriginal(oferta.getProduto().getPrecoOriginal());
        dto.setPrecoPromocional(oferta.getPrecoPromocional());
        dto.setPercentualDesconto(oferta.getPercentualDesconto());
        dto.setValidadeProduto(oferta.getValidadeProduto());
        dto.setDataFimOferta(oferta.getDataFimOferta());

        Empresa empresa = oferta.getProduto().getEmpresa();
        dto.setNomeFantasiaEmpresa(empresa.getNomeFantasia());
        dto.setLogotipoEmpresa(empresa.getLogotipo());
        dto.setInstrucoesRetirada(empresa.getInstrucoesRetirada());
        dto.setHorarioFuncionamento(empresa.getHorarioFuncionamento());

        if (empresa.getEndereco() != null) {
            com.synapse.deadline.dto.EnderecoDTO endDto = new com.synapse.deadline.dto.EnderecoDTO();
            endDto.setLogradouro(empresa.getEndereco().getLogradouro());
            endDto.setNumero(empresa.getEndereco().getNumero());
            endDto.setComplemento(empresa.getEndereco().getComplemento());
            endDto.setBairro(empresa.getEndereco().getBairro());
            endDto.setCidade(empresa.getEndereco().getCidade());
            endDto.setUf(empresa.getEndereco().getUf());
            endDto.setCep(empresa.getEndereco().getCep());
            dto.setEnderecoEmpresa(endDto);
        }

        return dto;
    }
}
