package com.synapse.deadline.dto;

/**
 * DTO de resposta após uma autenticação bem-sucedida, fornecendo o token JWT e dados básicos do contexto.
 */
public class AuthResponseDTO {

    private String token;
    private Long idEmpresa;
    private String nomeEmpresa;

    public AuthResponseDTO(String token, Long idEmpresa, String nomeEmpresa) {
        this.token = token;
        this.idEmpresa = idEmpresa;
        this.nomeEmpresa = nomeEmpresa;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Long idEmpresa) { this.idEmpresa = idEmpresa; }
    public String getNomeEmpresa() { return nomeEmpresa; }
    public void setNomeEmpresa(String nomeEmpresa) { this.nomeEmpresa = nomeEmpresa; }
}