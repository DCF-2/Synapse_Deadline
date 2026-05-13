package com.example.demo.service;

import com.example.demo.dto.ProdutoRequestDTO;
import com.example.demo.entity.Empresa;
import com.example.demo.entity.Produto;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.ProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    public Produto cadastrarProduto(
            ProdutoRequestDTO dto,
            Long idEmpresa
    ) {

        Empresa empresa = empresaRepository
                .findById(idEmpresa)
                .orElseThrow();

        Produto produto = new Produto();

        produto.setNome(dto.getNome());
        produto.setCodigoBarrasEan(dto.getCodigoBarrasEan());
        produto.setCategoria(dto.getCategoria());
        produto.setDescricao(dto.getDescricao());

        produto.setDataValidade(dto.getDataValidade());

        produto.setPrecoOriginal(dto.getPrecoOriginal());
        produto.setPrecoPromocional(dto.getPrecoPromocional());

        produto.setPercentualDesconto(
                dto.getPercentualDesconto()
        );

        produto.setEmpresa(empresa);

        return produtoRepository.save(produto);
    }

    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    public void remover(Long id) {
        produtoRepository.deleteById(id);
    }
}
