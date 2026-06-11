package com.synapse.deadline.dto;

import java.math.BigDecimal;

public class FiltroOfertasConsumidorDTO {
    private Long empresaId;
    private String nomeProduto;
    private String codBarrasEan;
    private Long categoriaId;
    private BigDecimal precoMin;
    private BigDecimal precoMax;
    private Integer diasMaxValidade; // Para filtrar "Vence em até X dias"

    // Getters e Setters
    public String getNomeProduto() { return nomeProduto; }
    public void setNomeProduto(String nomeProduto) { this.nomeProduto = nomeProduto; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public BigDecimal getPrecoMin() { return precoMin; }
    public void setPrecoMin(BigDecimal precoMin) { this.precoMin = precoMin; }
    public BigDecimal getPrecoMax() { return precoMax; }
    public void setPrecoMax(BigDecimal precoMax) { this.precoMax = precoMax; }
    public Integer getDiasMaxValidade() { return diasMaxValidade; }
    public void setDiasMaxValidade(Integer diasMaxValidade) { this.diasMaxValidade = diasMaxValidade; }
    public Long getEmpresaId() {return empresaId;}
    public void setEmpresaId(Long empresaId) {this.empresaId = empresaId;}
    public String getCodBarrasEan() {return codBarrasEan;}
    public void setCodBarrasEan(String codBarrasEan) {this.codBarrasEan = codBarrasEan;}
}