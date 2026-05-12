package com.synapse.deadline.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull; 
import org.hibernate.validator.constraints.br.CNPJ;
import java.time.LocalTime;

public class EmpresaCadastroDTO {

    @NotBlank(message = "O nome fantasia é obrigatório")
    private String nomeFantasia;

    @NotBlank(message = "A razão social é obrigatória")
    private String razaoSocial;

    @NotBlank(message = "O CNPJ é obrigatório")
    @CNPJ(message = "CNPJ inválido") 
    private String cnpj;

    @NotBlank(message = "O endereço é obrigatório")
    private String endereco;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    private String emailLogin;

    @NotBlank(message = "A senha é obrigatória")
    private String senha;

    @NotBlank(message = "As instruções de retirada são obrigatórias")
    private String instrucoesRetirada;

    @NotBlank(message = "Os dias de funcionamento são obrigatórios")
    private String diasFuncionamento;

    @NotNull(message = "O horário de abertura é obrigatório") // <-- FIX: @NotNull
    private LocalTime horarioAbertura;
    
    @NotNull(message = "O horário de fechamento é obrigatório") // <-- FIX: @NotNull
    private LocalTime horarioFechamento;

    private String contatoWhatsapp;
    private String contato1;
    private String contato2;

    // --- GETTERS E SETTERS ---
    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getEmailLogin() { return emailLogin; }
    public void setEmailLogin(String emailLogin) { this.emailLogin = emailLogin; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getContatoWhatsapp() { return contatoWhatsapp; }
    public void setContatoWhatsapp(String contatoWhatsapp) { this.contatoWhatsapp = contatoWhatsapp; }
    public String getContato1() { return contato1; }
    public void setContato1(String contato1) { this.contato1 = contato1; }
    public String getContato2() { return contato2; }
    public void setContato2(String contato2) { this.contato2 = contato2; }
    public String getInstrucoesRetirada() { return instrucoesRetirada; }
    public void setInstrucoesRetirada(String instrucoesRetirada) { this.instrucoesRetirada = instrucoesRetirada; }
    public String getDiasFuncionamento() { return diasFuncionamento; }
    public void setDiasFuncionamento(String diasFuncionamento) { this.diasFuncionamento = diasFuncionamento; }
    public LocalTime getHorarioAbertura() { return horarioAbertura; }
    public void setHorarioAbertura(LocalTime horarioAbertura) { this.horarioAbertura = horarioAbertura; }
    public LocalTime getHorarioFechamento() { return horarioFechamento; }
    public void setHorarioFechamento(LocalTime horarioFechamento) { this.horarioFechamento = horarioFechamento; }
}