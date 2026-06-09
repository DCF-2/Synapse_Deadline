package com.synapse.deadline.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class OfertaResponseDTO {

    private Long id;
    private Long produtoId;
    private String tituloProduto;
    private String nomeCategoria;
    private BigDecimal precoOriginal;
    private String foto;
    private BigDecimal precoPromocional;
    private Double percentualDesconto;
    private LocalDate validadeProduto;
    private LocalDate dataFimOferta;
    private Boolean ativo;
    private Integer cliquesContato;
 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }

    public String getTituloProduto() {
        return tituloProduto;
    }

    public void setTituloProduto(String tituloProduto) {
        this.tituloProduto = tituloProduto;
    }

    public String getNomeCategoria() {
        return nomeCategoria;
    }

    public void setNomeCategoria(String nomeCategoria) {
        this.nomeCategoria = nomeCategoria;
    }

    public BigDecimal getPrecoOriginal() {
        return precoOriginal;
    }

    public void setPrecoOriginal(BigDecimal precoOriginal) {
        this.precoOriginal = precoOriginal;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }

    public BigDecimal getPrecoPromocional() {
        return precoPromocional;
    }

    public void setPrecoPromocional(BigDecimal precoPromocional) {
        this.precoPromocional = precoPromocional;
    }

    public Double getPercentualDesconto() {
        return percentualDesconto;
    }

    public void setPercentualDesconto(Double percentualDesconto) {
        this.percentualDesconto = percentualDesconto;
    }

    public LocalDate getValidadeProduto() {
        return validadeProduto;
    }

    public void setValidadeProduto(LocalDate validadeProduto) {
        this.validadeProduto = validadeProduto;
    }

    public LocalDate getDataFimOferta() {
        return dataFimOferta;
    }

    public void setDataFimOferta(LocalDate dataFimOferta) {
        this.dataFimOferta = dataFimOferta;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Integer getCliquesContato() { return cliquesContato; }
    public void setCliquesContato(Integer cliquesContato) { this.cliquesContato = cliquesContato; }

}
