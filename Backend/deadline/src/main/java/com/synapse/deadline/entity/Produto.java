package com.synapse.deadline.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Entidade que representa o catálogo base de produtos de uma empresa.
 * Não contém dados efêmeros de promoção, os quais ficam sob responsabilidade da entidade Oferta.
 */
@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Empresa dona do produto.
     * Requisito de Integridade: Um produto não pode existir de forma órfã no banco.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    /**
     * Título ou nome principal do produto.
     */
    @Column(nullable = false, length = 150)
    private String tituloProduto;

    /**
     * Código de Barras Padrão (EAN).
     * Não é obrigatório pois alguns produtos de fabricação própria podem não possuir.
     */
    @Column(name = "cod_barras_ean", length = 13)
    private String codBarrasEan;

    /**
     * Relacionamento com a Categoria padronizada.
     * Requisito de Integridade: Produto deve sempre pertencer a uma categoria catalogada.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaProduto categoria;

    /**
     * Descrição detalhada do produto.
     */
    @Column(columnDefinition = "TEXT")
    private String descricao;

    /**
     * Preço original/base do produto, sem aplicação de descontos de validade próxima.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoOriginal;

    /**
     * Caminho ou URL da foto do produto no bucket de armazenamento.
     */
    private String foto;

    /**
     * Flag lógica para soft-delete ou inativação do catálogo.
     */
    @Column(nullable = false)
    private Boolean ativo = true;

    // --- CONSTRUTORES ---
    public Produto() {
    }

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public String getTituloProduto() { return tituloProduto; }
    public void setTituloProduto(String tituloProduto) { this.tituloProduto = tituloProduto; }

    public String getCodBarrasEan() { return codBarrasEan; }
    public void setCodBarrasEan(String codBarrasEan) { this.codBarrasEan = codBarrasEan; }

    public CategoriaProduto getCategoria() { return categoria; }
    public void setCategoria(CategoriaProduto categoria) { this.categoria = categoria; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}