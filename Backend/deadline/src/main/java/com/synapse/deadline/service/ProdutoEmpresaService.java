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

    /**
     * Visualiza os detalhes de um produto específico, garantindo que pertence à empresa logada.
     */
    public ProdutoEmpresaDetalhesDTO visualizarProdutoDaEmpresa(Long idProduto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Produto produto = produtoRepository.findByIdAndEmpresaId(idProduto, empresaLogada.getId())
                .orElseThrow(() -> new SecurityException("Produto não encontrado ou acesso negado"));
        
        return converterParaDetalhesDTO(produto);
    }

    /**
     * Edita um produto existente, validando a propriedade (tenant isolation).
     */
    public ProdutoEmpresaDetalhesDTO editarProduto(Long idProduto, ProdutoRequestDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Produto produto = produtoRepository.findByIdAndEmpresaId(idProduto, empresaLogada.getId())
                .orElseThrow(() -> new SecurityException("Produto não encontrado ou acesso negado"));
        
        CategoriaProduto categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria inválida"));

        produto.setTituloProduto(dto.getTituloProduto());
        produto.setCodBarrasEan(dto.getCodBarrasEan());
        produto.setCategoria(categoria);
        produto.setDescricao(dto.getDescricao());
        produto.setPrecoOriginal(dto.getPrecoOriginal());
        produto.setFoto(dto.getFoto());

        Produto salvo = produtoRepository.save(produto);
        return converterParaDetalhesDTO(salvo);
    }

    public Page<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada(Pageable pageable) {
        
        // 1. Pega a Empresa que já foi autenticada e injetada pelo nosso SecurityFilter
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Busca os produtos diretamente pelo ID da empresa logada
        Page<Produto> produtos = produtoRepository.findByEmpresaId(empresaLogada.getId(), pageable);

        return produtos.map(this::converterParaResumoDTO);
    }

    public ProdutoEmpresaDetalhesDTO visualizarProdutoDaEmpresa(Long idProduto, Long idEmpresa) {
        
        // 1. Pega a Empresa logada do contexto
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // 2. Validação de Segurança Secundária (Garante que a rota está sendo acessada pelo dono correto, caso o idEmpresa venha da URL)
        if (!empresaLogada.getId().equals(idEmpresa)) {
             throw new SecurityException("Acesso negado. O ID da empresa na requisição não corresponde à empresa autenticada.");
        }

        // 3. Busca o produto garantindo que ele pertence a esta empresa específica (Previne falha de IDOR)
        Produto produto = produtoRepository.findByIdAndEmpresaId(idProduto, idEmpresa)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado ou não pertence a esta empresa."));

        return converterParaDetalhesDTO(produto);
    }

    public ProdutoEmpresaDetalhesDTO editarProduto(Long idProduto, ProdutoRequestDTO dto, Long idEmpresa) {
        
        // 1. Pega a Empresa logada do contexto
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (!empresaLogada.getId().equals(idEmpresa)) {
             throw new SecurityException("Acesso negado. O ID da empresa na requisição não corresponde à empresa autenticada.");
        }

        // 2. Busca o produto existente
        Produto produtoExistente = produtoRepository.findByIdAndEmpresaId(idProduto, idEmpresa)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado ou não pertence a esta empresa."));

        // 3. Valida se a categoria informada existe
        CategoriaProduto categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria inválida ou não encontrada"));

        // 4. Validação de EAN Duplicado (Ignora se for o mesmo EAN que o produto já tem)
        if (dto.getCodBarrasEan() != null && !dto.getCodBarrasEan().isBlank()) {
            if (!dto.getCodBarrasEan().equals(produtoExistente.getCodBarrasEan()) && 
                produtoRepository.existsByCodBarrasEan(dto.getCodBarrasEan())) {
                throw new IllegalArgumentException("Produto com este código de barras já cadastrado");
            }
        }

        // 5. Atualiza os dados (Você pode adicionar uma validação para não deixar inativar se tiver oferta ativa depois, como no seu teste)
        produtoExistente.setTituloProduto(dto.getTituloProduto());
        produtoExistente.setCodBarrasEan(dto.getCodBarrasEan());
        produtoExistente.setCategoria(categoria);
        produtoExistente.setDescricao(dto.getDescricao());
        produtoExistente.setPrecoOriginal(dto.getPrecoOriginal());
        produtoExistente.setFoto(dto.getFoto());
        // produtoExistente.setAtivo(dto.getAtivo()); // Caso adicione o campo "ativo" no RequestDTO futuramente

        Produto produtoAtualizado = produtoRepository.save(produtoExistente);

        return converterParaDetalhesDTO(produtoAtualizado);
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