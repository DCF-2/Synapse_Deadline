package com.synapse.deadline.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "metricas_ofertas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"oferta_id", "dia"}, name = "uk_metricas_ofertas_dia")
}, indexes = {
    @Index(name = "idx_metricas_ofertas_dia", columnList = "oferta_id, dia")
})
public class MetricasOfertas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "oferta_id", nullable = false)
    private Oferta oferta;

    @Column(nullable = false)
    private LocalDate dia;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesDetalhe = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesWhatsAppOferta = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesEmailOferta = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesComoChegarOferta = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesFavoritarOferta = 0;

    public MetricasOfertas() {}

    public MetricasOfertas(Oferta oferta, LocalDate dia) {
        this.oferta = oferta;
        this.dia = dia;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Oferta getOferta() { return oferta; }
    public void setOferta(Oferta oferta) { this.oferta = oferta; }

    public LocalDate getDia() { return dia; }
    public void setDia(LocalDate dia) { this.dia = dia; }

    public int getCliquesDetalhe() { return cliquesDetalhe; }
    public void setCliquesDetalhe(int cliquesDetalhe) { this.cliquesDetalhe = cliquesDetalhe; }

    public int getCliquesWhatsAppOferta() { return cliquesWhatsAppOferta; }
    public void setCliquesWhatsAppOferta(int cliquesWhatsAppOferta) { this.cliquesWhatsAppOferta = cliquesWhatsAppOferta; }

    public int getCliquesEmailOferta() { return cliquesEmailOferta; }
    public void setCliquesEmailOferta(int cliquesEmailOferta) { this.cliquesEmailOferta = cliquesEmailOferta; }

    public int getCliquesComoChegarOferta() { return cliquesComoChegarOferta; }
    public void setCliquesComoChegarOferta(int cliquesComoChegarOferta) { this.cliquesComoChegarOferta = cliquesComoChegarOferta; }

    public int getCliquesFavoritarOferta() { return cliquesFavoritarOferta; }
    public void setCliquesFavoritarOferta(int cliquesFavoritarOferta) { this.cliquesFavoritarOferta = cliquesFavoritarOferta; }
}
