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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.nio.LongBuffer;
import java.security.cert.LDAPCertStoreParameters;
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

    
    public ProdutoEmpresaDetalhesDTO cadastrarProduto(ProdutoRequestDTO dto) {
        
        if (dto.getCodBarrasEan() != null && !dto.getCodBarrasEan().isBlank()) {
            if (produtoRepository.existsByCodBarrasEan(dto.getCodBarrasEan())) {
                throw new IllegalArgumentException("Produto com este código de barras já cadastrado");
            }
        }

        // 1. Extração segura da identidade via contexto de segurança do Spring (Token JWT)
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        Empresa empresa = empresaRepository.findByEmailLogin(emailLogado)
                .orElseThrow(() -> new IllegalArgumentException("Empresa autenticada não encontrada"));

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

    public List<Produto> listarProdutos(Long empresaId) {
        return produtoRepository.findByCategoriaIdAndAtivoTrue(empresaId);
    }

    public void remover(Long id) {
        // 1. Descobrir quem está a tentar apagar
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Buscar o produto
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
                
        // 3. Validação de Propriedade (Prevenção de IDOR)
        if (!produto.getEmpresa().getEmailLogin().equals(emailLogado)) {
            throw new SecurityException("Acesso negado. Não tem permissão para alterar este produto.");
        }

        // 4. Soft Delete: Apenas inativa o produto no catálogo, preservando o histórico
        produto.setAtivo(false);
        produtoRepository.save(produto);
    }

    /**
     * Devolve uma Página de DTOs em vez de uma Lista, todos os produtos pertencentes à empresa que está logada no sistema.
     * Retorna a versão de Resumo (sem detalhes excessivos) conforme UML.
     */
     public Page<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada(Pageable pageable) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Empresa empresa = empresaRepository.findByEmailLogin(emailLogado)
                .orElseThrow(() -> new RuntimeException("Empresa autenticada não encontrada"));

        // O repositório agora devolve paginação diretamente do banco (com limit e offset)
        Page<Produto> produtos = produtoRepository.findByEmpresaId(empresa.getId(), pageable);

        // O método .map() do Page do Spring aplica a conversão em cada item da página automaticamente
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