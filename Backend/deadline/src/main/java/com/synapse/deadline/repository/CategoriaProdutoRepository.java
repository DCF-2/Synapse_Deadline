package com.synapse.deadline.repository;

import com.synapse.deadline.entity.CategoriaProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para a entidade CategoriaProduto.
 */
@Repository
public interface CategoriaProdutoRepository extends JpaRepository<CategoriaProduto, Long> {
}