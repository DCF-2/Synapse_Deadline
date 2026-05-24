package com.synapse.deadline.service;

import com.synapse.deadline.dto.OfertaRequestDTO;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.entity.Produto;

import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.ProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfertaService {

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public Oferta criar(OfertaRequestDTO dto) {

        Produto produto = produtoRepository
                .findById(dto.getIdProduto())
                .orElseThrow();

        Oferta oferta = new Oferta();

        oferta.setProduto(produto);

        oferta.setValidadeProduto(
                dto.getValidadeProduto()
        );

        oferta.setDataFimOferta(
                dto.getDataFimOferta()
        );

        oferta.setPrecoPromocional(
                dto.getPrecoPromocional()
        );

        oferta.setPercentualDesconto(
                dto.getPercentualDesconto()
        );

        return ofertaRepository.save(oferta);
    }

    public List<Oferta> listar() {
        return ofertaRepository.findAll();
    }

    public Oferta atualizar(
            Long id,
            OfertaRequestDTO dto
    ) {

        Oferta oferta = ofertaRepository
                .findById(id)
                .orElseThrow();

        oferta.setValidadeProduto(
                dto.getValidadeProduto()
        );

        oferta.setDataFimOferta(
                dto.getDataFimOferta()
        );

        oferta.setPrecoPromocional(
                dto.getPrecoPromocional()
        );

        oferta.setPercentualDesconto(
                dto.getPercentualDesconto()
        );

        return ofertaRepository.save(oferta);
    }

    public void remover(Long id) {
        ofertaRepository.deleteById(id);
    }
}
