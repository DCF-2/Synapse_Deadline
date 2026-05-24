package com.synapse.deadline.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class OfertaRequestDTO {

    @NotNull
    private Long produtoId;

    @NotNull
    private LocalDate validadeProduto;

    @NotNull
    private LocalDate dataFimOferta;

    @NotNull
    private BigDecimal precoPromocional;

    @NotNull
    private Double percentualDesconto;

    private Boolean ativo = true;

    public Long getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
