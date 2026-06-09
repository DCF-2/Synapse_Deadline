package com.synapse.deadline.dto;

public class OfertaFiltroDTO {
    private Long empresaId;
    private String nome;
    private Long categoriaId;
    private Boolean ativo;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
        public Long getEmpresaId() {return empresaId;}
    public void setEmpresaId(Long empresaId) {this.empresaId = empresaId;}
}