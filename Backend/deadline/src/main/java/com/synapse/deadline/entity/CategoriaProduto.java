package com.synapse.deadline.entity;

import jakarta.persistence.*;

/**
 * Entidade que representa as categorias padronizadas dos produtos no marketplace.
 * Exemplo: Laticínios, Bebidas, Padaria.
 */
@Entity
@Table(name = "categoria_produto")
public class CategoriaProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nome de exibição da categoria.
     * Requisito: Não pode ser nulo.
     */
    @Column(nullable = false)
    private String nome;

    /**
     * Identificador amigável para URLs (ex: "laticinios", "bebidas-geladas").
     * Requisito de Segurança/Integridade: Deve ser único no banco de dados para evitar conflitos de rota.
     */
    @Column(unique = true, nullable = false)
    private String slug;

    /**
     * Indica se a categoria está ativa no sistema.
     * Requisito: Não pode ser nulo.
     */
    @Column(nullable = false)
    private Boolean ativo = true;

    // --- CONSTRUTORES ---
    public CategoriaProduto() {
    }

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}