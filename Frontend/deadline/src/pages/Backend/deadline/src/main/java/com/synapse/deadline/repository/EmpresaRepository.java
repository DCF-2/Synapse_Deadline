package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
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
}