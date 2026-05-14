package com.synapse.deadline.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO responsável por receber e validar os dados de criação de um Produto.
 * Regras baseadas no TestCaseCadastroProduto.
 */
public class ProdutoRequestDTO {

    @NotBlank(message = "Campo nome é obrigatório") // TC_056
    private String nome;

    @NotBlank(message = "Campo código de barras é obrigatório")
    @Pattern(regexp = "^\\d{13}$", message = "EAN inválido, formato incorreto") // TC_057 (Exige 13 dígitos numéricos)
    private String codigoBarrasEan;

    @NotBlank(message = "Categoria é obrigatória") // TC_059
    private String categoria;

    private String descricao;

    @NotNull(message = "A data de validade é obrigatória")
    @FutureOrPresent(message = "A data de validade não pode ser retroativa") // TC_062
    private LocalDate dataValidade;

    @NotNull(message = "O preço original é obrigatório")
    @DecimalMin(value = "0.01", message = "O preço original deve ser maior que zero") // TC_060
    private BigDecimal precoOriginal;

    private BigDecimal precoPromocional;

    @DecimalMax(value = "100.0", message = "O desconto não pode ultrapassar 100%") // TC_064
    @PositiveOrZero(message = "O desconto não pode ser negativo")
    private Double percentualDesconto;

    // Getters e Setters (Mantêm-se os mesmos)
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCodigoBarrasEan() { return codigoBarrasEan; }
    public void setCodigoBarrasEan(String codigoBarrasEan) { this.codigoBarrasEan = codigoBarrasEan; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDate getDataValidade() { return dataValidade; }
    public void setDataValidade(LocalDate dataValidade) { this.dataValidade = dataValidade; }
    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }
    public BigDecimal getPrecoPromocional() { return precoPromocional; }
    public void setPrecoPromocional(BigDecimal precoPromocional) { this.precoPromocional = precoPromocional; }
    public Double getPercentualDesconto() { return percentualDesconto; }
    public void setPercentualDesconto(Double percentualDesconto) { this.percentualDesconto = percentualDesconto; }
}