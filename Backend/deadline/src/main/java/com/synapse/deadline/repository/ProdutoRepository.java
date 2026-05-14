package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ProdutoRepository
        extends JpaRepository<Produto, Long> {

    List<Produto> findByEmpresaId(Long idEmpresa);

    List<Produto> findAllByDataValidade(LocalDate data);

    // Verifica se já existe um produto com o mesmo EAN (Para o TC_058)
    boolean existsByCodigoBarrasEan(String codigoBarrasEan);
}