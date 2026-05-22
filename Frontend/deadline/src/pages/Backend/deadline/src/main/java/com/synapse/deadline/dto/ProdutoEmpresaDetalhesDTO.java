package com.synapse.deadline.dto;

import java.math.BigDecimal;

/**
 * DTO para exibir todos os detalhes de um produto no painel da Empresa.
 */
public class ProdutoEmpresaDetalhesDTO {

    private Long id;
    private Long idEmpresa;
    private String tituloProduto;
    private String codBarrasEan;
    private String nomeCategoria;
    private String descricao;
    private BigDecimal precoOriginal;
    private String foto;
    private Boolean ativo;

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Long idEmpresa) { this.idEmpresa = idEmpresa; }
    public String getTituloProduto() { return tituloProduto; }
    public void setTituloProduto(String tituloProduto) { this.tituloProduto = tituloProduto; }
    public String getCodBarrasEan() { return codBarrasEan; }
    public void setCodBarrasEan(String codBarrasEan) { this.codBarrasEan = codBarrasEan; }
    public String getNomeCategoria() { return nomeCategoria; }
    public void setNomeCategoria(String nomeCategoria) { this.nomeCategoria = nomeCategoria; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}