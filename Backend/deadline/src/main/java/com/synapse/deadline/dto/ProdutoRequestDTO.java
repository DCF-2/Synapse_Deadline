package com.synapse.deadline.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * DTO para receber os dados de criação ou edição do catálogo base de um Produto.
 */
public class ProdutoRequestDTO {

    @NotBlank(message = "O título do produto é obrigatório.")
    private String tituloProduto;

    @Size(max = 13, message = "O código de barras EAN deve ter no máximo 13 caracteres.")
    private String codBarrasEan;

    @NotNull(message = "O ID da categoria é obrigatório.")
    private Long idCategoria;

    private String descricao;

    @NotNull(message = "O preço original é obrigatório.")
    @DecimalMin(value = "0.01", message = "O preço original deve ser maior que zero.")
    private BigDecimal precoOriginal;

    private String foto;

    // --- GETTERS E SETTERS ---
    public String getTituloProduto() { return tituloProduto; }
    public void setTituloProduto(String tituloProduto) { this.tituloProduto = tituloProduto; }
    
    public String getCodBarrasEan() { return codBarrasEan; }
    public void setCodBarrasEan(String codBarrasEan) { this.codBarrasEan = codBarrasEan; }
    
    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }
    
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
}