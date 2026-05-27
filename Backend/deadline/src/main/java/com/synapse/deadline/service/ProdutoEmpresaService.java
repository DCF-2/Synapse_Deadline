package com.synapse.deadline.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO;
import com.synapse.deadline.dto.ProdutoEmpresaFiltroDTO;
import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO;
import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Endereco;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.ProdutoRepository;
import com.synapse.deadline.repository.ProdutoSpecifications;

/**
 * Serviço responsável por gerir o catálogo base de produtos das empresas (ProdutoEmpresaService no UML).
 */
@Service
public class ProdutoEmpresaService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CategoriaProdutoRepository categoriaRepository;

    @Autowired
    private OfertaRepository ofertaRepository;

    @Transactional
    public ProdutoEmpresaDetalhesDTO cadastrarProduto(ProdutoRequestDTO dto) {
        
        if (dto.getCodBarrasEan() != null && !dto.getCodBarrasEan().isBlank()) {
            if (produtoRepository.existsByCodBarrasEan(dto.getCodBarrasEan())) {
                throw new IllegalArgumentException("Produto com este código de barras já cadastrado");
            }
        }

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
        produto.setEmpresa(empresaLogada); 
        produto.setAtivo(true);

        Produto salvo = produtoRepository.save(produto);

        return converterParaDetalhesDTO(salvo);
    }

    @Transactional
    public void remover(Long id) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
                
        if (!produto.getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado. Não tem permissão para alterar este produto.");
        }

        produto.setAtivo(false);
        produtoRepository.save(produto);
    }

   /**
     * Visualizar detalhes: usa apenas o idProduto.
     * A empresa é identificada pelo SecurityContext.
     */
    @Transactional(readOnly = true)
    public ProdutoEmpresaDetalhesDTO visualizarProdutoDaEmpresa(Long idProduto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return produtoRepository.findByIdAndEmpresaId(idProduto, empresaLogada.getId())
                .map(this::converterParaDetalhesDTO)
                .orElseThrow(() -> new SecurityException("Produto não encontrado ou acesso negado"));
}

    /**
     * Editar: usa apenas idProduto e o DTO.
     * A empresa é identificada pelo SecurityContext.
     */
    @Transactional
    public ProdutoEmpresaDetalhesDTO editarProduto(Long idProduto, ProdutoRequestDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Produto produtoExistente = produtoRepository.findByIdAndEmpresaId(idProduto, empresaLogada.getId())
            .orElseThrow(() -> new SecurityException("Produto não encontrado ou acesso negado"));

        CategoriaProduto categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria inválida"));

        validarEanDuplicado(dto.getCodBarrasEan(), produtoExistente.getId());

        produtoExistente.setTituloProduto(dto.getTituloProduto());
        produtoExistente.setCodBarrasEan(dto.getCodBarrasEan());
        produtoExistente.setCategoria(categoria);
        produtoExistente.setDescricao(dto.getDescricao());
        produtoExistente.setPrecoOriginal(dto.getPrecoOriginal());
        produtoExistente.setFoto(dto.getFoto());
        
        if (dto.getAtivo() != null) {
            produtoExistente.setAtivo(dto.getAtivo());
        }

        Produto salvo = produtoRepository.save(produtoExistente);
        return converterParaDetalhesDTO(salvo);
    }

    @Transactional(readOnly = true)
    public Page<ProdutoEmpresaResumoDTO> listarProdutosPublicos(Pageable pageable) {
        return produtoRepository.findAllByAtivoTrue(pageable).map(this::converterParaResumoDTO);
    }

    @Transactional(readOnly = true)
    public ProdutoEmpresaDetalhesDTO visualizarProdutoPublico(Long idProduto) {
        Produto produto = produtoRepository.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (!Boolean.TRUE.equals(produto.getAtivo())) {
            throw new IllegalArgumentException("Produto não encontrado");
        }

        return converterParaDetalhesDTO(produto);
    }

    @Transactional(readOnly = true)
    public Page<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada(Pageable pageable) {
        return listarProdutosPorEmpresaLogada(pageable, new ProdutoEmpresaFiltroDTO());
    }

    @Transactional(readOnly = true)
    public Page<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada(Pageable pageable, String nome) {
        ProdutoEmpresaFiltroDTO filtro = new ProdutoEmpresaFiltroDTO();
        filtro.setNome(nome);
        return listarProdutosPorEmpresaLogada(pageable, filtro);
    }

    @Transactional(readOnly = true)
    public Page<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada(
            Pageable pageable,
            String nome,
            Long categoriaId,
            String codBarrasEan,
            String descricao,
            Boolean ativo,
            BigDecimal precoMin,
            BigDecimal precoMax
    ) {
        ProdutoEmpresaFiltroDTO filtro = new ProdutoEmpresaFiltroDTO();
        filtro.setNome(nome);
        filtro.setCategoriaId(categoriaId);
        filtro.setCodBarrasEan(codBarrasEan);
        filtro.setDescricao(descricao);
        filtro.setAtivo(ativo);
        filtro.setPrecoMin(precoMin);
        filtro.setPrecoMax(precoMax);
        return listarProdutosPorEmpresaLogada(pageable, filtro);
    }

    @Transactional(readOnly = true)
    public Page<ProdutoEmpresaResumoDTO> listarProdutosPorEmpresaLogada(Pageable pageable, ProdutoEmpresaFiltroDTO filtro) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return buscarProdutosComFiltros(empresaLogada.getId(), pageable, filtro).map(this::converterParaResumoDTO);
    }

    private Page<Produto> buscarProdutosComFiltros(
            Long empresaId,
            Pageable pageable,
            ProdutoEmpresaFiltroDTO filtro
    ) {
        String nome = filtro != null && filtro.getNome() != null ? filtro.getNome().trim() : null;
        BigDecimal precoMin = filtro != null ? filtro.getPrecoMin() : null;
        BigDecimal precoMax = filtro != null ? filtro.getPrecoMax() : null;

        return produtoRepository.findAll(
                ProdutoSpecifications.filtrarPorEmpresaEParametros(
                        empresaId,
                        nome,
                        filtro != null ? filtro.getCategoriaId() : null,
                        filtro != null ? filtro.getCodBarrasEan() : null,
                        filtro != null ? filtro.getDescricao() : null,
                        filtro != null ? filtro.getAtivo() : null,
                        precoMin,
                        precoMax
                ),
                pageable
        );
    }

    // --- MÉTODOS AUXILIARES DE CONVERSÃO ---

    private ProdutoEmpresaDetalhesDTO converterParaDetalhesDTO(Produto produto) {
        ProdutoEmpresaDetalhesDTO dto = new ProdutoEmpresaDetalhesDTO();
        Empresa empresa = produto.getEmpresa();
        Oferta ofertaAtiva = ofertaRepository.findByProdutoIdAndAtivoTrue(produto.getId())
                .stream()
                .findFirst()
                .orElse(null);

        dto.setId(produto.getId());
        dto.setIdEmpresa(empresa != null ? empresa.getId() : null);
        dto.setTituloProduto(produto.getTituloProduto());
        dto.setCodBarrasEan(produto.getCodBarrasEan());
        dto.setNomeCategoria(produto.getCategoria().getNome());
        
        // CORREÇÃO: Descrição adicionada ao DTO
        dto.setDescricao(produto.getDescricao());
        
        dto.setPrecoOriginal(produto.getPrecoOriginal());
        dto.setFoto(produto.getFoto());
        dto.setAtivo(produto.getAtivo());
        dto.setNomeEmpresa(empresa != null ? empresa.getNomeFantasia() : null);
        dto.setEnderecoEmpresa(formatarEndereco(empresa));
        dto.setInstrucoesRetirada(empresa != null ? empresa.getInstrucoesRetirada() : null);
        dto.setHorarioFuncionamento(empresa != null ? empresa.getHorarioFuncionamento() : null);

        if (ofertaAtiva != null) {
            dto.setPrecoPromocional(ofertaAtiva.getPrecoPromocional());
            dto.setPercentualDesconto(ofertaAtiva.getPercentualDesconto());
            dto.setValidadeProduto(ofertaAtiva.getValidadeProduto());
            dto.setDataFimOferta(ofertaAtiva.getDataFimOferta());
        }

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

    private String formatarEndereco(Empresa empresa) {
        if (empresa == null || empresa.getEndereco() == null) {
            return null;
        }

        Endereco endereco = empresa.getEndereco();
        StringBuilder builder = new StringBuilder();

        if (endereco.getLogradouro() != null) {
            builder.append(endereco.getLogradouro());
        }

        if (endereco.getNumero() != null && !endereco.getNumero().isBlank()) {
            builder.append(", ").append(endereco.getNumero());
        }

        if (endereco.getBairro() != null && !endereco.getBairro().isBlank()) {
            if (builder.length() > 0) {
                builder.append(" - ");
            }
            builder.append(endereco.getBairro());
        }

        if (endereco.getCidade() != null && !endereco.getCidade().isBlank()) {
            if (builder.length() > 0) {
                builder.append(" - ");
            }
            builder.append(endereco.getCidade());
        }

        if (endereco.getUf() != null && !endereco.getUf().isBlank()) {
            if (builder.length() > 0) {
                builder.append("/");
            }
            builder.append(endereco.getUf());
        }

        if (endereco.getCep() != null && !endereco.getCep().isBlank()) {
            if (builder.length() > 0) {
                builder.append(" - CEP ");
            }
            builder.append(endereco.getCep());
        }

        return builder.length() > 0 ? builder.toString() : null;
    }

    private void validarEanDuplicado(String codBarrasEan, Long idProdutoAtual) {
        if (codBarrasEan == null || codBarrasEan.isBlank()) {
            return;
        }

        String codAtual = produtoRepository.findById(idProdutoAtual)
                .map(Produto::getCodBarrasEan)
                .orElse(null);

        if (!codBarrasEan.equals(codAtual) && produtoRepository.existsByCodBarrasEan(codBarrasEan)) {
            throw new IllegalArgumentException("Produto com este código de barras já cadastrado");
        }
    }

       public List<CategoriaProduto> listarCategorias() {
            return categoriaRepository.findByAtivoTrue();
        }
}