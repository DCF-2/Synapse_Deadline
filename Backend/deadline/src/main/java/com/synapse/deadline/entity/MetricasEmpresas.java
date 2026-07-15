package com.synapse.deadline.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "metricas_empresas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"empresa_id", "dia"}, name = "uk_metricas_empresas_dia")
}, indexes = {
    @Index(name = "idx_metricas_empresas_dia", columnList = "empresa_id, dia")
})
public class MetricasEmpresas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false)
    private LocalDate dia;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesPerfil = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesWhatsAppEmpresa = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesEmailEmpresa = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int cliquesComoChegarEmpresa = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int somaAvaliacoesEmpresa = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int quantidadeAvaliacoesEmpresa = 0;

    public MetricasEmpresas() {}

    public MetricasEmpresas(Empresa empresa, LocalDate dia) {
        this.empresa = empresa;
        this.dia = dia;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public LocalDate getDia() { return dia; }
    public void setDia(LocalDate dia) { this.dia = dia; }

    public int getCliquesPerfil() { return cliquesPerfil; }
    public void setCliquesPerfil(int cliquesPerfil) { this.cliquesPerfil = cliquesPerfil; }

    public int getCliquesWhatsAppEmpresa() { return cliquesWhatsAppEmpresa; }
    public void setCliquesWhatsAppEmpresa(int cliquesWhatsAppEmpresa) { this.cliquesWhatsAppEmpresa = cliquesWhatsAppEmpresa; }

    public int getCliquesEmailEmpresa() { return cliquesEmailEmpresa; }
    public void setCliquesEmailEmpresa(int cliquesEmailEmpresa) { this.cliquesEmailEmpresa = cliquesEmailEmpresa; }

    public int getCliquesComoChegarEmpresa() { return cliquesComoChegarEmpresa; }
    public void setCliquesComoChegarEmpresa(int cliquesComoChegarEmpresa) { this.cliquesComoChegarEmpresa = cliquesComoChegarEmpresa; }

    public int getSomaAvaliacoesEmpresa() { return somaAvaliacoesEmpresa; }
    public void setSomaAvaliacoesEmpresa(int somaAvaliacoesEmpresa) { this.somaAvaliacoesEmpresa = somaAvaliacoesEmpresa; }

    public int getQuantidadeAvaliacoesEmpresa() { return quantidadeAvaliacoesEmpresa; }
    public void setQuantidadeAvaliacoesEmpresa(int quantidadeAvaliacoesEmpresa) { this.quantidadeAvaliacoesEmpresa = quantidadeAvaliacoesEmpresa; }
}
