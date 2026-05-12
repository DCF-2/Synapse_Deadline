package com.synapse.deadline.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeFantasia;

    @Column(nullable = false)
    private String razaoSocial;

    @Column(nullable = false, unique = true) // <-- FIX: Proteção no banco
    private String cnpj;

    private String logo;

    @Column(nullable = false)
    private String endereco; 

    private String coordenadasLocalizacao;

    private String contatoWhatsapp;
    private String contato1;
    private String contato2;

    @Column(nullable = false, unique = true) // <-- FIX: Proteção no banco
    private String emailLogin;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String instrucoesRetirada;

    @Column(nullable = false)
    private String diasFuncionamento;

    @Column(nullable = false)
    private LocalTime horarioAbertura;
    
    @Column(nullable = false)
    private LocalTime horarioFechamento;

    // --- GETTERS E SETTERS ---
    // (Mantenha exatamente os mesmos que você já tinha feito)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getCoordenadasLocalizacao() { return coordenadasLocalizacao; }
    public void setCoordenadasLocalizacao(String coordenadasLocalizacao) { this.coordenadasLocalizacao = coordenadasLocalizacao; }
    public String getContatoWhatsapp() { return contatoWhatsapp; }
    public void setContatoWhatsapp(String contatoWhatsapp) { this.contatoWhatsapp = contatoWhatsapp; }
    public String getContato1() { return contato1; }
    public void setContato1(String contato1) { this.contato1 = contato1; }
    public String getContato2() { return contato2; }
    public void setContato2(String contato2) { this.contato2 = contato2; }
    public String getEmailLogin() { return emailLogin; }
    public void setEmailLogin(String emailLogin) { this.emailLogin = emailLogin; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getInstrucoesRetirada() { return instrucoesRetirada; }
    public void setInstrucoesRetirada(String instrucoesRetirada) { this.instrucoesRetirada = instrucoesRetirada; }
    public String getDiasFuncionamento() { return diasFuncionamento; }
    public void setDiasFuncionamento(String diasFuncionamento) { this.diasFuncionamento = diasFuncionamento; }
    public LocalTime getHorarioAbertura() { return horarioAbertura; }
    public void setHorarioAbertura(LocalTime horarioAbertura) { this.horarioAbertura = horarioAbertura; }
    public LocalTime getHorarioFechamento() { return horarioFechamento; }
    public void setHorarioFechamento(LocalTime horarioFechamento) { this.horarioFechamento = horarioFechamento; }
}