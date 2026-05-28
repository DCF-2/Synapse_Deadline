package com.synapse.deadline.dto;

import java.util.List;

public class DashboardResponseDTO {
    private long totalProdutosAtivos;
    private long totalOfertasAtivas;
    private long ofertasExpirandoBrevemente;
    private List<OfertaResponseDTO> ofertasRecentes;

    // Getters e Setters
    public long getTotalProdutosAtivos() { return totalProdutosAtivos; }
    public void setTotalProdutosAtivos(long totalProdutosAtivos) { this.totalProdutosAtivos = totalProdutosAtivos; }
    
    public long getTotalOfertasAtivas() { return totalOfertasAtivas; }
    public void setTotalOfertasAtivas(long totalOfertasAtivas) { this.totalOfertasAtivas = totalOfertasAtivas; }
    
    public long getOfertasExpirandoBrevemente() { return ofertasExpirandoBrevemente; }
    public void setOfertasExpirandoBrevemente(long ofertasExpirandoBrevemente) { this.ofertasExpirandoBrevemente = ofertasExpirandoBrevemente; }
    
    public List<OfertaResponseDTO> getOfertasRecentes() { return ofertasRecentes; }
    public void setOfertasRecentes(List<OfertaResponseDTO> ofertasRecentes) { this.ofertasRecentes = ofertasRecentes; }
}