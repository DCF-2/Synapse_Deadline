package com.synapse.deadline.service;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO; 
import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO; 
import com.synapse.deadline.dto.ProdutoRequestDTO; // O seu DTO de entrada (ajustado)
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.ProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável por gerir o catálogo base de produtos das empresas (ProdutoEmpresaService no UML).
 */
@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private CategoriaProdutoRepository categoriaRepository;

    public ProdutoEmpresaDetalhesDTO cadastrarProduto(ProdutoRequestDTO dto, Long idEmpresa) {
        
        // Validação de EAN Duplicado (Impede catálogo duplicado)
        if (dto.getCodBarrasEan() != null && !dto.getCodBarrasEan().isBlank()) {
            if (produtoRepository.existsByCodBarrasEan(dto.getCodBarrasEan())) {
                throw new IllegalArgumentException("Produto com este código de barras já cadastrado");
            }
        }

        Empresa empresa = empresaRepository.findById(idEmpresa)
                .orElseThrow(() -> new IllegalArgumentException("Empresa não encontrada"));

        CategoriaProduto categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria inválida ou não encontrada"));

        Produto produto = new Produto();
        produto.setTituloProduto(dto.getTituloProduto()); // Antigo setNome
        produto.setCodBarrasEan(dto.getCodBarrasEan());
        produto.setCategoria(categoria); // Relacionamento com a nova Entidade
        produto.setDescricao(dto.getDescricao());
        produto.setPrecoOriginal(dto.getPrecoOriginal());
        produto.setFoto(dto.getFoto());
        produto.setEmpresa(empresa);
        produto.setAtivo(true); // O produto no catálogo nasce ativo

        Produto salvo = produtoRepository.save(produto);

        return converterParaDetalhesDTO(salvo);
    }

    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    public void remover(Long id) {
        produtoRepository.deleteById(id);
    }

    /**
     * Lista todos os produtos pertencentes à empresa que está logada no sistema.
     * Retorna a versão de Resumo (sem detalhes excessivos) conforme UML.
     */
    public List<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Empresa empresa = empresaRepository.findByEmailLogin(emailLogado)
                .orElseThrow(() -> new RuntimeException("Empresa autenticada não encontrada"));

        List<Produto> produtos = produtoRepository.findByEmpresaId(empresa.getId());

        return produtos.stream()
                .map(this::converterParaResumoDTO)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS AUXILIARES DE CONVERSÃO ---

    private ProdutoEmpresaDetalhesDTO converterParaDetalhesDTO(Produto produto) {
        ProdutoEmpresaDetalhesDTO dto = new ProdutoEmpresaDetalhesDTO();
        dto.setId(produto.getId());
        dto.setIdEmpresa(produto.getEmpresa().getId());
        dto.setTituloProduto(produto.getTituloProduto());
        dto.setCodBarrasEan(produto.getCodBarrasEan());
        dto.setNomeCategoria(produto.getCategoria().getNome());
        dto.setDescricao(produto.getDescricao());
        dto.setPrecoOriginal(produto.getPrecoOriginal());
        dto.setFoto(produto.getFoto());
        dto.setAtivo(produto.getAtivo());
        return dto;
    }

    private ProdutoEmpresaResumoDTO converterParaResumoDTO(Produto produto) {
        ProdutoEmpresaResumoDTO dto = new ProdutoEmpresaResumoDTO();
        dto.setId(produto.getId());
        dto.setTituloProduto(produto.getTituloProduto());
        dto.setCodBarrasEan(produto.getCodBarrasEan());
        dto.setNomeCategoria(produto.getCategoria().getNome());
        dto.setPrecoOriginal(produto.getPrecoOriginal());
        dto.setFoto(produto.getFoto());
        dto.setAtivo(produto.getAtivo());
        return dto;
    }
}