package com.synapse.deadline.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.synapse.deadline.entity.Produto;

/**
 * Repositório de dados para a entidade {@link Produto}.
 * Controla as consultas relativas ao catálogo geral de produtos cadastrados.
 */
@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    /**
     * Localiza todos os produtos pertencentes a uma determinada empresa parceira.
     *
     * @param idEmpresa Identificador único da empresa proprietária.
     * @return Lista contendo os produtos da referida empresa.
     */
    Page<Produto> findByEmpresaId(Long idEmpresa, Pageable pageable);

    /**
     * Localiza todos os produtos ativos no sistema (para a vitrine pública).
     *
     * @return Lista contendo todos os produtos ativos.
     */
    List<Produto> findAllByAtivoTrue();

    /**
     * Verifica se já existe algum produto registado com o mesmo código de barras.
     * Utilizado para garantir que não haja duplicação de itens no catálogo.
     * * @param codBarrasEan O código de barras a ser validado.
     * @return true se o código já existir no banco de dados, false caso contrário.
     */
    boolean existsByCodBarrasEan(String codBarrasEan);

    /**
     * Localiza todos os produtos ativos pertencentes a uma determinada empresa parceira.
     *
     * @param empresaId Identificador único da empresa proprietária.
     * @param pageable Objeto para paginação dos resultados.
     * @return Página contendo os produtos da referida empresa.
     */
    Page<Produto> findByEmpresaIdAndAtivoTrue(Long empresaId, Pageable pageable);

    /**
     * Localiza todos os produtos ativos pertencentes a uma determinada categoria.
     *
     * @param categoriaId Identificador único da categoria.
     * @return Lista contendo os produtos da referida categoria.
     */
    List<Produto> findByCategoriaIdAndAtivoTrue(Long categoriaId);

    /**
     * Localiza um produto específico garantindo que ele pertence a uma determinada empresa.
     * Usado para garantir a segurança (Tenant Isolation) nas edições e exclusões.
     */
    Optional<Produto> findByIdAndEmpresaId(Long idProduto, Long idEmpresa);
}