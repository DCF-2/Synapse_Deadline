package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de dados para a entidade {@link Empresa}.
 * Centraliza operações seguras de persistência e consultas customizadas de empresas.
 */
@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    /**
     * Procura uma empresa a partir do seu e-mail de acesso.
     * Essencial para o fluxo seguro de autenticação (login).
     *
     * @param emailLogin O e-mail credenciado da empresa.
     * @return Um {@link Optional} contendo a Empresa encontrada ou vazio.
     */
    Optional<Empresa> findByEmailLogin(String emailLogin);

    /**
     * Procura uma empresa pelo seu Cadastro Nacional da Pessoa Jurídica (CNPJ).
     * Utilizado como trava de segurança para evitar duplicidade de cadastros.
     *
     * @param cnpj O CNPJ que se deseja validar.
     * @return Um {@link Optional} contendo a Empresa encontrada ou vazio.
     */
    Optional<Empresa> findByCnpj(String cnpj);

    /**
     * Busca as três primeiras empresas cujo nome fantasia contenha a string fornecida, ignorando maiúsculas e minúsculas.
     * Útil para sugestões rápidas de empresas durante pesquisas.
     *
     * @param nomeFantasia A string a ser buscada dentro do nome fantasia das empresas.
     * @return Uma lista contendo até três empresas que correspondam ao critério de busca.
     */
    List<Empresa> findTop3ByNomeFantasiaContainingIgnoreCase(String nomeFantasia);
}