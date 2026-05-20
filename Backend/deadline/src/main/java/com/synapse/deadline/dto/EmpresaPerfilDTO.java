package com.synapse.deadline.dto;

/**
 * DTO para a visualização e edição do perfil da Empresa. 
 * Omite dados sensíveis como a senha de acesso.
 */
public class EmpresaPerfilDTO {

    private String nomeFantasia;
    private String razaoSocial;
    private String cnpj;
    private String logotipo;
    private Long idRamo;
    private EnderecoDTO endereco;
    private String contatoWhatsapp;
    private String contato1;
    private String contato2;
    private String emailContato;
    private String instrucoesRetirada;
    private String emailLogin;
    private String horarioFuncionamento;

    // --- GETTERS E SETTERS ---
    // (Omitidos aqui no texto para não ficar demasiado longo, mas deves gerar os getters/setters normais para todas as propriedades acima).
    
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
    public String getHorarioFuncionamento() { return horarioFuncionamento; }
    public void setHorarioFuncionamento(String horarioFuncionamento) { this.horarioFuncionamento = horarioFuncionamento; }
}