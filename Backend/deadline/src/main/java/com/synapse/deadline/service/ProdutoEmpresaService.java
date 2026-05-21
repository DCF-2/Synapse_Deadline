package com.synapse.deadline.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page; // O seu DTO de entrada (ajustado)
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO;
import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO;
import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.ProdutoRepository;

/**
 * Serviço responsável por gerir o catálogo base de produtos das empresas (ProdutoEmpresaService no UML).
 */
@Service
public class ProdutoEmpresaService {

    @Autowired
    private ProdutoRepository produtoRepository;

    // Você pode até remover essa injeção se não usar em outros métodos não mostrados aqui
    @Autowired
    private EmpresaRepository empresaRepository; 

    @Autowired
    private CategoriaProdutoRepository categoriaRepository;

    public ProdutoEmpresaDetalhesDTO cadastrarProduto(ProdutoRequestDTO dto) {
        
        if (dto.getCodBarrasEan() != null && !dto.getCodBarrasEan().isBlank()) {
            if (produtoRepository.existsByCodBarrasEan(dto.getCodBarrasEan())) {
                throw new IllegalArgumentException("Produto com este código de barras já cadastrado");
            }
        }

        // 1. Extração segura (pegamos o objeto Empresa diretamente do contexto do Spring)
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        CategoriaProduto categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria inválida ou não encontrada"));

        Produto produto = new Produto();
        produto.setTituloProduto(dto.getTituloProduto());
        produto.setCodBarrasEan(dto.getCodBarrasEan());
        produto.setCategoria(categoria);
        produto.setDescricao(dto.getDescricao());
        produto.setPrecoOriginal(dto.getPrecoOriginal());
        produto.setFoto(dto.getFoto());
        produto.setEmpresa(empresaLogada); // Usamos a empresa recuperada diretamente
        produto.setAtivo(true);

        Produto salvo = produtoRepository.save(produto);

        return converterParaDetalhesDTO(salvo);
    }

    public List<Produto> listarProdutos() {
        return produtoRepository.findAllByAtivoTrue();
    }

    public void remover(Long id) {
        // 1. Descobrir quem está a tentar apagar pegando a empresa do contexto
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // 2. Buscar o produto
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
                
        // 3. Validação de Propriedade (Comparando o ID da empresa do produto com o ID da empresa logada)
        if (!produto.getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado. Não tem permissão para alterar este produto.");
        }

        // 4. Soft Delete
        produto.setAtivo(false);
        produtoRepository.save(produto);
    }

    public Page<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada(Pageable pageable) {
        
        // 1. Pega a Empresa que já foi autenticada e injetada pelo nosso SecurityFilter
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Busca os produtos diretamente pelo ID da empresa logada
        Page<Produto> produtos = produtoRepository.findByEmpresaId(empresaLogada.getId(), pageable);

        return produtos.map(this::converterParaResumoDTO);
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