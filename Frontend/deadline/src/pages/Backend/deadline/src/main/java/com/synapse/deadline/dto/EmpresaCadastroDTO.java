package com.synapse.deadline.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CNPJ;

/**
 * DTO para o registo inicial de uma nova Empresa parceira no marketplace.
 */
public class EmpresaCadastroDTO {

    @NotBlank(message = "O nome fantasia é obrigatório.")
    private String nomeFantasia;

    @NotBlank(message = "A razão social é obrigatória.")
    private String razaoSocial;

    @NotBlank(message = "O CNPJ é obrigatório.")
    @CNPJ(message = "O CNPJ fornecido é inválido.")
    private String cnpj;

    private String logotipo;

    @NotNull(message = "O ID do ramo de atuação é obrigatório.")
    private Long idRamo;

    @Valid
    @NotNull(message = "Os dados de endereço são obrigatórios.")
    private EnderecoDTO endereco;

    private String contatoWhatsapp;
    private String contato1;
    private String contato2;
    private String emailContato;

    @NotBlank(message = "As instruções de retirada são obrigatórias para orientar o consumidor.")
    private String instrucoesRetirada;

    @NotBlank(message = "O e-mail de login é obrigatório.")
    @Email(message = "E-mail de login inválido.")
    private String emailLogin;

    @NotBlank(message = "A palavra-passe é obrigatória.")
    private String senha;

    @NotBlank(message = "O horário de funcionamento é obrigatório.")
    private String horarioFuncionamento;

    // --- GETTERS E SETTERS ---
    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getLogotipo() { return logotipo; }
    public void setLogotipo(String logotipo) { this.logotipo = logotipo; }
    public Long getIdRamo() { return idRamo; }
    public void setIdRamo(Long idRamo) { this.idRamo = idRamo; }
    public EnderecoDTO getEndereco() { return endereco; }
    public void setEndereco(EnderecoDTO endereco) { this.endereco = endereco; }
    public String getContatoWhatsapp() { return contatoWhatsapp; }
    public void setContatoWhatsapp(String contatoWhatsapp) { this.contatoWhatsapp = contatoWhatsapp; }
    public String getContato1() { return contato1; }
    public void setContato1(String contato1) { this.contato1 = contato1; }
    public String getContato2() { return contato2; }
    public void setContato2(String contato2) { this.contato2 = contato2; }
    public String getEmailContato() { return emailContato; }
    public void setEmailContato(String emailContato) { this.emailContato = emailContato; }
    public String getInstrucoesRetirada() { return instrucoesRetirada; }
    public void setInstrucoesRetirada(String instrucoesRetirada) { this.instrucoesRetirada = instrucoesRetirada; }
    public String getEmailLogin() { return emailLogin; }
    public void setEmailLogin(String emailLogin) { this.emailLogin = emailLogin; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getHorarioFuncionamento() { return horarioFuncionamento; }
    public void setHorarioFuncionamento(String horarioFuncionamento) { this.horarioFuncionamento = horarioFuncionamento; }
}