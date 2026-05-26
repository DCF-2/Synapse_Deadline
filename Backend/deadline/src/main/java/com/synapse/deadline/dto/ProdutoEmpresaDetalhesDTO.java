package com.synapse.deadline.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para exibir todos os detalhes de um produto no painel da Empresa.
 */
public class ProdutoEmpresaDetalhesDTO {

    private Long id;
    private Long idEmpresa;
    private String tituloProduto;
    private String codBarrasEan;
    private String nomeCategoria;
    private String descricao;
    private BigDecimal precoOriginal;
    private String foto;
    private Boolean ativo;
    private String nomeEmpresa;
    private String enderecoEmpresa;
    private String instrucoesRetirada;
    private String horarioFuncionamento;
    private BigDecimal precoPromocional;
    private Double percentualDesconto;
    private LocalDate validadeProduto;
    private LocalDate dataFimOferta;

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Long idEmpresa) { this.idEmpresa = idEmpresa; }
    public String getTituloProduto() { return tituloProduto; }
    public void setTituloProduto(String tituloProduto) { this.tituloProduto = tituloProduto; }
    public String getCodBarrasEan() { return codBarrasEan; }
    public void setCodBarrasEan(String codBarrasEan) { this.codBarrasEan = codBarrasEan; }
    public String getNomeCategoria() { return nomeCategoria; }
    public void setNomeCategoria(String nomeCategoria) { this.nomeCategoria = nomeCategoria; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public String getNomeEmpresa() { return nomeEmpresa; }
    public void setNomeEmpresa(String nomeEmpresa) { this.nomeEmpresa = nomeEmpresa; }
    public String getEnderecoEmpresa() { return enderecoEmpresa; }
    public void setEnderecoEmpresa(String enderecoEmpresa) { this.enderecoEmpresa = enderecoEmpresa; }
    public String getInstrucoesRetirada() { return instrucoesRetirada; }
    public void setInstrucoesRetirada(String instrucoesRetirada) { this.instrucoesRetirada = instrucoesRetirada; }
    public String getHorarioFuncionamento() { return horarioFuncionamento; }
    public void setHorarioFuncionamento(String horarioFuncionamento) { this.horarioFuncionamento = horarioFuncionamento; }
    public BigDecimal getPrecoPromocional() { return precoPromocional; }
    public void setPrecoPromocional(BigDecimal precoPromocional) { this.precoPromocional = precoPromocional; }
    public Double getPercentualDesconto() { return percentualDesconto; }
    public void setPercentualDesconto(Double percentualDesconto) { this.percentualDesconto = percentualDesconto; }
    public LocalDate getValidadeProduto() { return validadeProduto; }
    public void setValidadeProduto(LocalDate validadeProduto) { this.validadeProduto = validadeProduto; }
    public LocalDate getDataFimOferta() { return dataFimOferta; }
    public void setDataFimOferta(LocalDate dataFimOferta) { this.dataFimOferta = dataFimOferta; }
}