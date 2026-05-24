package com.synapse.deadline.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class OfertaRequestDTO {

    @NotNull
    private Long idProduto;

    @NotNull
    private LocalDate validadeProduto;

    @NotNull
    private LocalDate dataFimOferta;

    @NotNull
    private BigDecimal precoPromocional;

    @NotNull
    private Double percentualDesconto;

    public Long getIdProduto() {
        return idProduto;
    }

    public void setIdProduto(Long idProduto) {
        this.idProduto = idProduto;
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
}
