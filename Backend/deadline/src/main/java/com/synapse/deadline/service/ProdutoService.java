package com.synapse.deadline.service;

import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.dto.ProdutoResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.ProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

  public Produto cadastrarProduto(ProdutoRequestDTO dto, Long idEmpresa) {
        
        // Regra TC_058: Validação de EAN Duplicado
        if (produtoRepository.existsByCodigoBarrasEan(dto.getCodigoBarrasEan())) {
            throw new IllegalArgumentException("Produto com este código de barras já cadastrado");
        }

        // Regra TC_061: Validação de Preço Promocional vs Original
        if (dto.getPrecoPromocional() != null && 
            dto.getPrecoPromocional().compareTo(dto.getPrecoOriginal()) > 0) {
            throw new IllegalArgumentException("O preço promocional não pode ser maior que o original");
        }

        Empresa empresa = empresaRepository.findById(idEmpresa)
                .orElseThrow(() -> new IllegalArgumentException("Empresa não encontrada"));

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setCodigoBarrasEan(dto.getCodigoBarrasEan());
        produto.setCategoria(dto.getCategoria());
        produto.setDescricao(dto.getDescricao());
        produto.setDataValidade(dto.getDataValidade());
        produto.setPrecoOriginal(dto.getPrecoOriginal());
        produto.setPrecoPromocional(dto.getPrecoPromocional());
        produto.setPercentualDesconto(dto.getPercentualDesconto());
        produto.setEmpresa(empresa);
        produto.setAtivo(true);

        return produtoRepository.save(produto);
    }

    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    public void remover(Long id) {
        produtoRepository.deleteById(id);
    }

    /**
     * Lista todos os produtos pertencentes à empresa que está logada no sistema.
     * @return Lista de ProdutoResponseDTO com o status calculado.
     */
    public List<ProdutoResponseDTO> listarProdutosPorEmpresaLogada() {
        // 1. Extrai o e-mail da empresa logada do token JWT
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Busca a empresa no banco de dados
        Empresa empresa = empresaRepository.findByEmailLogin(emailLogado)
                .orElseThrow(() -> new RuntimeException("Empresa autenticada não encontrada"));

        // 3. Busca apenas os produtos dessa empresa específica
        List<Produto> produtos = produtoRepository.findByEmpresaId(empresa.getId());

        // 4. Converte a lista de Entidades para a lista de DTOs seguros
        return produtos.stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Método auxiliar para converter a entidade Produto em ProdutoResponseDTO e calcular o status.
     */
    private ProdutoResponseDTO converterParaResponseDTO(Produto produto) {
        ProdutoResponseDTO dto = new ProdutoResponseDTO();
        dto.setId(produto.getId());
        dto.setNome(produto.getNome());
        dto.setCategoria(produto.getCategoria());
        dto.setDataValidade(produto.getDataValidade());
        dto.setPrecoOriginal(produto.getPrecoOriginal());
        dto.setPrecoPromocional(produto.getPrecoPromocional());
        dto.setPercentualDesconto(produto.getPercentualDesconto());
        
        // Regra de Negócio: Definição do Status
        if (produto.getAtivo() != null && !produto.getAtivo()) {
            dto.setStatus("INATIVO");
        } else if (produto.getDataValidade() != null && produto.getDataValidade().isBefore(LocalDate.now())) {
            dto.setStatus("VENCIDO");
        } else {
            dto.setStatus("ATIVO");
        }
        
        return dto;
    }
}