package com.synapse.deadline.dto;

import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.br.CNPJ;
import java.time.LocalTime;

public class EmpresaCadastroDTO {

    @NotBlank(message = "O Nome Fantasia é obrigatório")
    @Size(max = 255, message = "O Nome Fantasia excedeu o limite de caracteres")
    private String nomeFantasia;

    @NotBlank(message = "A Razão Social é obrigatória")
    private String razaoSocial;

    @NotBlank(message = "O CNPJ é obrigatório")
    @CNPJ(message = "CNPJ com formato inválido ou dígito verificador incorreto")
    private String cnpj;

    @NotBlank(message = "O E-mail de login é obrigatório")
    @Email(message = "Formato de e-mail de login inválido")
    private String emailLogin;

    @NotBlank(message = "A Senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    @Pattern(regexp = ".*[!@#$%^&*()_+=\\[\\]{};':\"\\\\|,.<>\\/?].*", message = "A senha deve conter pelo menos um caractere especial")
    private String senha;

    // --- Endereço e Coordenadas (Quebrado conforme QA) ---
    @NotBlank(message = "O Logradouro é obrigatório")
    @Size(max = 255, message = "Logradouro muito longo")
    private String logradouro;

    @NotBlank(message = "O Número é obrigatório")
    private String numero; 

    @NotBlank(message = "O Bairro é obrigatório")
    private String bairro;

    @NotBlank(message = "O CEP é obrigatório")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "Formato de CEP inválido")
    private String cep;

    @NotBlank(message = "A Cidade é obrigatória")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "A cidade não pode conter números")
    private String cidade;

    @NotBlank(message = "A UF é obrigatória")
    @Size(min = 2, max = 2, message = "A UF deve conter exatamente 2 caracteres")
    private String uf;

    @Pattern(regexp = "^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?),\\s*[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)$", 
             message = "Coordenadas inválidas ou fora do intervalo")
    private String coordenadasLocalizacao;

    // --- Contatos e Funcionamento ---
    @Pattern(regexp = "^\\d{10,11}$", message = "WhatsApp inválido, deve conter DDD e número")
    private String contatoWhatsapp;
    
    private String contato1;
    private String contato2;
    private String instrucoesRetirada;

    @NotBlank(message = "Os dias de funcionamento são obrigatórios")
    private String diasFuncionamento;

    @NotNull(message = "O horário de abertura é obrigatório")
    private LocalTime horarioAbertura;
    
    @NotNull(message = "O horário de fechamento é obrigatório")
    private LocalTime horarioFechamento;

    // GETTERS E SETTERS (Pode gerá-los automaticamente na sua IDE para todos os campos acima)
    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getEmailLogin() { return emailLogin; }
    public void setEmailLogin(String emailLogin) { this.emailLogin = emailLogin; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }
    public String getCoordenadasLocalizacao() { return coordenadasLocalizacao; }
    public void setCoordenadasLocalizacao(String coordenadasLocalizacao) { this.coordenadasLocalizacao = coordenadasLocalizacao; }
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