package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Produto;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProdutoSpecifications {

    public static Specification<Produto> filtrarPorEmpresaEParametros(
            Long empresaId, String nome, Long categoriaId, String codBarrasEan,
            String descricao, Boolean ativo, BigDecimal precoMin, BigDecimal precoMax) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. REGRA INQUEBRÁVEL: Produto deve pertencer à empresa logada
            if (empresaId != null) {
                predicates.add(cb.equal(root.get("empresa").get("id"), empresaId));
            }

            // 2. FILTRO POR NOME (Busca parcial: %texto%)
            if (nome != null && !nome.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("tituloProduto")), "%" + nome.toLowerCase() + "%"));
            }

            // 3. FILTRO POR CATEGORIA (Exato: id = id)
            if (categoriaId != null) {
                predicates.add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }

            // 4. FILTRO DE STATUS (Ativo/Inativo)
            if (ativo != null) {
                predicates.add(cb.equal(root.get("ativo"), ativo));
            }

            // 5. FILTRO POR EAN (Exato)
            if (codBarrasEan != null && !codBarrasEan.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("codBarrasEan"), codBarrasEan));
            }

            // JUNTA TODAS AS CONDIÇÕES COM "AND" (E). 
            // Se falhar em uma, não traz o registro.
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}