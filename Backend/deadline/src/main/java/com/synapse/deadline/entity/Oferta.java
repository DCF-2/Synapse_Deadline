package com.synapse.deadline.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entidade que representa uma oferta promocional de um produto catalogado,
 * focada na negociação de itens próximos ao prazo de validade.
 */
@Entity
@Table(name = "oferta")
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relacionamento com o Produto base.
     * Requisito de Integridade: Toda oferta deve estar obrigatoriamente vinculada a um produto do catálogo.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    /**
     * Data de validade real do lote do produto sendo ofertado.
     * Requisito de Segurança: Obrigatório para garantir a transparência com o consumidor.
     */
    @Column(nullable = false)
    private LocalDate validadeProduto;

    /**
     * Data limite em que a oferta ficará disponível na plataforma.
     */
    private LocalDate dataFimOferta;

    /**
     * Valor com desconto que será cobrado do consumidor.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoPromocional;

    /**
     * Porcentagem de desconto calculada em relação ao preço original do produto.
     * Armazenada para facilitar a indexação e os filtros nas buscas.
     */
    @Column(nullable = false)
    private Double percentualDesconto;

    /**
     * Controlo de estado da oferta (ativa/inativa).
     */
    @Column(nullable = false)
    private Boolean ativo = true;

    /**
     * Número de cliques registrados no botão de contato da oferta.
     */
    @Column(name = "cliques_contato", nullable = false, columnDefinition = "integer default 0")
    private Integer cliquesContato = 0;

    // --- CONSTRUTORES ---
    public Oferta() {
    }

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }

    public LocalDate getValidadeProduto() { return validadeProduto; }
    public void setValidadeProduto(LocalDate validadeProduto) { this.validadeProduto = validadeProduto; }

    public LocalDate getDataFimOferta() { return dataFimOferta; }
    public void setDataFimOferta(LocalDate dataFimOferta) { this.dataFimOferta = dataFimOferta; }

    public BigDecimal getPrecoPromocional() { return precoPromocional; }
    public void setPrecoPromocional(BigDecimal precoPromocional) { this.precoPromocional = precoPromocional; }

    public Double getPercentualDesconto() { return percentualDesconto; }
    public void setPercentualDesconto(Double percentualDesconto) { this.percentualDesconto = percentualDesconto; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public Integer getCliquesContato() { return cliquesContato; }
    public void setCliquesContato(Integer cliquesContato) { this.cliquesContato = cliquesContato; }
}