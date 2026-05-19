package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repositório de dados para a entidade {@link Produto}.
 * Controla as consultas relativas ao catálogo geral de produtos cadastrados.
 */
@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    /**
     * Localiza todos os produtos pertencentes a uma determinada empresa parceira.
     *
     * @param idEmpresa Identificador único da empresa proprietária.
     * @return Lista contendo os produtos da referida empresa.
     */
    Page<Produto> findByEmpresaId(Long idEmpresa, Pageable pageable);

    /**
     * Procura por todos os produtos do catálogo que possuem ofertas ativas e 
     * dentro do prazo de validade estipulado em relação à data corrente.
     *
     * @param dataAtual Data do dia para corte de segurança de vencidos.
     * @return Lista de produtos com ofertas vigentes.
     */
    @Query("SELECT DISTINCT p FROM Produto p " +
           "JOIN Oferta o ON o.produto = p " +
           "WHERE p.ativo = true " +
           "AND o.ativo = true " +
           "AND (o.dataFimOferta >= :dataAtual OR o.dataFimOferta IS NULL) " +
           "AND o.validadeProduto >= :dataAtual")
    List<Produto> findAllValidos(@Param("dataAtual") LocalDate dataAtual);

    /**
     * Verifica se já existe algum produto registado com o mesmo código de barras.
     * Utilizado para garantir que não haja duplicação de itens no catálogo.
     * * @param codBarrasEan O código de barras a ser validado.
     * @return true se o código já existir no banco de dados, false caso contrário.
     */
    boolean existsByCodBarrasEan(String codBarrasEan);
}