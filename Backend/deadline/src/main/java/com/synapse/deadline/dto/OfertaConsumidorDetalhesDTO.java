package com.synapse.deadline.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class OfertaConsumidorDetalhesDTO {
    private Long id;
    private String tituloProduto;
    private String descricao;
    private String foto;
    private BigDecimal precoOriginal;
    private BigDecimal precoPromocional;
    private Double percentualDesconto;
    private LocalDate validadeProduto;
    private LocalDate dataFimOferta;
    
    // Dados da Empresa para o Cliente saber onde buscar
    private String nomeFantasiaEmpresa;
    private String logotipoEmpresa;
    private String instrucoesRetirada;
    private EnderecoDTO enderecoEmpresa;
    private String horarioFuncionamento;

    // Gere os Getters e Setters para todos os campos acima...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTituloProduto() { return tituloProduto; }
    public void setTituloProduto(String tituloProduto) { this.tituloProduto = tituloProduto; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
    public BigDecimal getPrecoOriginal() { return precoOriginal; }
    public void setPrecoOriginal(BigDecimal precoOriginal) { this.precoOriginal = precoOriginal; }
    public BigDecimal getPrecoPromocional() { return precoPromocional; }
    public void setPrecoPromocional(BigDecimal precoPromocional) { this.precoPromocional = precoPromocional; }
    public Double getPercentualDesconto() { return percentualDesconto; }
    public void setPercentualDesconto(Double percentualDesconto) { this.percentualDesconto = percentualDesconto; }
    public LocalDate getValidadeProduto() { return validadeProduto; }
    public void setValidadeProduto(LocalDate validadeProduto) { this.validadeProduto = validadeProduto; }
    public LocalDate getDataFimOferta() { return dataFimOferta; }
    public void setDataFimOferta(LocalDate dataFimOferta) { this.dataFimOferta = dataFimOferta; }
    public String getNomeFantasiaEmpresa() { return nomeFantasiaEmpresa; }
    public void setNomeFantasiaEmpresa(String nomeFantasiaEmpresa) { this.nomeFantasiaEmpresa = nomeFantasiaEmpresa; }
    public String getLogotipoEmpresa() { return logotipoEmpresa; }
    public void setLogotipoEmpresa(String logotipoEmpresa) { this.logotipoEmpresa = logotipoEmpresa; }
    public String getInstrucoesRetirada() { return instrucoesRetirada; }
    public void setInstrucoesRetirada(String instrucoesRetirada) { this.instrucoesRetirada = instrucoesRetirada; }
    public EnderecoDTO getEnderecoEmpresa() { return enderecoEmpresa; }
    public void setEnderecoEmpresa(EnderecoDTO enderecoEmpresa) { this.enderecoEmpresa = enderecoEmpresa; }
    public String getHorarioFuncionamento() { return horarioFuncionamento; }
    public void setHorarioFuncionamento(String horarioFuncionamento) { this.horarioFuncionamento = horarioFuncionamento; }
}