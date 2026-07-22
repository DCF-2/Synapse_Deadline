package com.synapse.deadline.dto;

import java.util.List;

public class DashboardResponseDTO {
    private long totalProdutosAtivos;
    private long totalOfertasAtivas;
    private long ofertasExpirandoBrevemente;
    private List<OfertaResponseDTO> ofertasRecentes;
    private long engajamentosTotais;
    
    // Novas métricas para o Funil
    private long totalCliquesDetalhe;
    private long totalCliquesContato;
    
    // Evolução temporal para o Gráfico de Área
    private List<EngajamentoDiarioDTO> engajamentoEvolucao;
    
    // Detalhamento de métricas
    private long totalWhatsApp;
    private long totalEmail;
    private long totalComoChegar;
    private long totalFavoritos;
    private long totalPerfil;

    // Getters e Setters
    public long getTotalProdutosAtivos() { return totalProdutosAtivos; }
    public void setTotalProdutosAtivos(long totalProdutosAtivos) { this.totalProdutosAtivos = totalProdutosAtivos; }
    
    public long getTotalOfertasAtivas() { return totalOfertasAtivas; }
    public void setTotalOfertasAtivas(long totalOfertasAtivas) { this.totalOfertasAtivas = totalOfertasAtivas; }
    
    public long getOfertasExpirandoBrevemente() { return ofertasExpirandoBrevemente; }
    public void setOfertasExpirandoBrevemente(long ofertasExpirandoBrevemente) { this.ofertasExpirandoBrevemente = ofertasExpirandoBrevemente; }
    
    public List<OfertaResponseDTO> getOfertasRecentes() { return ofertasRecentes; }
    public void setOfertasRecentes(List<OfertaResponseDTO> ofertasRecentes) { this.ofertasRecentes = ofertasRecentes; }

    public long getEngajamentosTotais() { return engajamentosTotais; }
    public void setEngajamentosTotais(long engajamentosTotais) { this.engajamentosTotais = engajamentosTotais; }

    public long getTotalCliquesDetalhe() { return totalCliquesDetalhe; }
    public void setTotalCliquesDetalhe(long totalCliquesDetalhe) { this.totalCliquesDetalhe = totalCliquesDetalhe; }

    public long getTotalCliquesContato() { return totalCliquesContato; }
    public void setTotalCliquesContato(long totalCliquesContato) { this.totalCliquesContato = totalCliquesContato; }

    public List<EngajamentoDiarioDTO> getEngajamentoEvolucao() { return engajamentoEvolucao; }
    public void setEngajamentoEvolucao(List<EngajamentoDiarioDTO> engajamentoEvolucao) { this.engajamentoEvolucao = engajamentoEvolucao; }

    public long getTotalWhatsApp() { return totalWhatsApp; }
    public void setTotalWhatsApp(long totalWhatsApp) { this.totalWhatsApp = totalWhatsApp; }

    public long getTotalEmail() { return totalEmail; }
    public void setTotalEmail(long totalEmail) { this.totalEmail = totalEmail; }

    public long getTotalComoChegar() { return totalComoChegar; }
    public void setTotalComoChegar(long totalComoChegar) { this.totalComoChegar = totalComoChegar; }

    public long getTotalFavoritos() { return totalFavoritos; }
    public void setTotalFavoritos(long totalFavoritos) { this.totalFavoritos = totalFavoritos; }

    public long getTotalPerfil() { return totalPerfil; }
    public void setTotalPerfil(long totalPerfil) { this.totalPerfil = totalPerfil; }

    private List<OfertaResponseDTO> topOfertasEngajamento;
    public List<OfertaResponseDTO> getTopOfertasEngajamento() { return topOfertasEngajamento; }
    public void setTopOfertasEngajamento(List<OfertaResponseDTO> topOfertasEngajamento) { this.topOfertasEngajamento = topOfertasEngajamento; }
}