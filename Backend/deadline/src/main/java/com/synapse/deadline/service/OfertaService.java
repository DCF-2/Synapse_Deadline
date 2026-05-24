package com.synapse.deadline.service;

import com.synapse.deadline.dto.OfertaRequestDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public List<OfertaResponseDTO> listarOfertasDaEmpresa() {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ofertaRepository.findByProdutoEmpresaId(empresaLogada.getId())
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
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
}
