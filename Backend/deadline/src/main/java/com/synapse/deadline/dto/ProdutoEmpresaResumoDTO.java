package com.synapse.deadline.dto;

import java.math.BigDecimal;

/**
 * DTO para listagem enxuta de produtos no painel da Empresa (sem descrições longas ou chaves estrangeiras complexas).
 */
public class ProdutoEmpresaResumoDTO {

    private Long id; // Necessário para interações na interface
    private String tituloProduto;
    private String codBarrasEan;
    private String nomeCategoria;
    private BigDecimal precoOriginal;
    private String foto;
    private Boolean ativo;

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTituloProduto() { return tituloProduto; }
    public void setTituloProduto(String tituloProduto) { this.tituloProduto = tituloProduto; }
    public String getCodBarrasEan() { return codBarrasEan; }
    public void setCodBarrasEan(String codBarrasEan) { this.codBarrasEan = codBarrasEan; }
    public String getNomeCategoria() { return nomeCategoria; }
    public void setNomeCategoria(String nomeCategoria) { this.nomeCategoria = nomeCategoria; }
    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}