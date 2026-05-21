package com.synapse.deadline.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProdutoResponseDTO {

    private Long id;
    private String nome;
    private String categoria;
    private LocalDate dataValidade;
    private BigDecimal precoOriginal;
    private BigDecimal precoPromocional;
    private Double percentualDesconto;
    private String status; // Campo dinâmico (ATIVO, VENCIDO, INATIVO)

    // Construtores
    public ProdutoResponseDTO() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public LocalDate getDataValidade() { return dataValidade; }
    public void setDataValidade(LocalDate dataValidade) { this.dataValidade = dataValidade; }

    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }

    public BigDecimal getPrecoPromocional() { return precoPromocional; }
    public void setPrecoPromocional(BigDecimal precoPromocional) { this.precoPromocional = precoPromocional; }

    public Double getPercentualDesconto() { return percentualDesconto; }
    public void setPercentualDesconto(Double percentualDesconto) { this.percentualDesconto = percentualDesconto; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}