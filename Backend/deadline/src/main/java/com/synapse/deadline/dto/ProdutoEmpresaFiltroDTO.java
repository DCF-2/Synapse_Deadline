package com.synapse.deadline.dto;

import java.math.BigDecimal;

public class ProdutoEmpresaFiltroDTO {

    private String nome;
    private Long categoriaId;
    private String codBarrasEan;
    private String descricao;
    private Boolean ativo;
    private BigDecimal precoMin;
    private BigDecimal precoMax;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getCodBarrasEan() {
        return codBarrasEan;
    }

    public void setCodBarrasEan(String codBarrasEan) {
        this.codBarrasEan = codBarrasEan;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public BigDecimal getPrecoMin() {
        return precoMin;
    }

    public void setPrecoMin(BigDecimal precoMin) {
        this.precoMin = precoMin;
    }

    public BigDecimal getPrecoMax() {
        return precoMax;
    }

    public void setPrecoMax(BigDecimal precoMax) {
        this.precoMax = precoMax;
    }
}
