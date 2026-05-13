package com.example.demo.repository;

import com.example.demo.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ProdutoRepository
        extends JpaRepository<Produto, Long> {

    List<Produto> findByEmpresaId(Long idEmpresa);

    List<Produto> findAllByDataValidade(LocalDate data);
}
