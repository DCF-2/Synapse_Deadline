package com.synapse.deadline.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page; // O seu DTO de entrada (ajustado)
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

    @Transactional
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
    @Transactional(readOnly = true)
    public ProdutoEmpresaDetalhesDTO visualizarProdutoDaEmpresa(Long idProduto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Produto produto = produtoRepository.findByIdAndEmpresaId(idProduto, empresaLogada.getId())
                .orElseThrow(() -> new SecurityException("Produto não encontrado ou acesso negado"));
        
        return converterParaDetalhesDTO(produto);
    }

    /**
     * Edita um produto existente, validando a propriedade (tenant isolation).
     */
    @Transactional
    public ProdutoEmpresaDetalhesDTO editarProduto(Long idProduto, ProdutoRequestDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Produto produto = produtoRepository.findByIdAndEmpresaId(idProduto, empresaLogada.getId())
                .orElseThrow(() -> new SecurityException("Produto não encontrado ou acesso negado"));
        
        CategoriaProduto categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria inválida"));

        validarEanDuplicado(dto.getCodBarrasEan(), produto.getId());

        produto.setTituloProduto(dto.getTituloProduto());
        produto.setCodBarrasEan(dto.getCodBarrasEan());
        produto.setCategoria(categoria);
        produto.setDescricao(dto.getDescricao());
        produto.setPrecoOriginal(dto.getPrecoOriginal());
        produto.setFoto(dto.getFoto());

        Produto salvo = produtoRepository.save(produto);
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

    @Transactional(readOnly = true)
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

    @Transactional
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
        validarEanDuplicado(dto.getCodBarrasEan(), produtoExistente.getId());

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
}