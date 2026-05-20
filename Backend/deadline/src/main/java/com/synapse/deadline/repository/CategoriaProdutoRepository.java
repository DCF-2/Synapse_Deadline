package com.synapse.deadline.repository;

import com.synapse.deadline.entity.CategoriaProduto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para a entidade CategoriaProduto.
 */
@Repository
public interface CategoriaProdutoRepository extends JpaRepository<CategoriaProduto, Long> {
    
    /**
     * Localiza todas as categorias de produto ativas.
     *
     * @return Lista contendo as categorias de produto ativas.
     */
    List<CategoriaProduto> findByAtivoTrue();
}