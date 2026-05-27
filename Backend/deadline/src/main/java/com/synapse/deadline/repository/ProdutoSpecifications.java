package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Produto;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.List;

public class ProdutoSpecifications {

    public static Specification<Produto> filtrarPorEmpresaEParametros(
            Long empresaId, String buscaGeral, Long categoriaId, String codBarrasEan,
            String descricao, Boolean ativo, BigDecimal precoMin, BigDecimal precoMax) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. REGRA INQUEBRÁVEL: Produto deve pertencer à empresa logada
            if (empresaId != null) {
                predicates.add(cb.equal(root.get("empresa").get("id"), empresaId));
            }

            // 2. FILTRO GERAL (Nome, Descrição ou EAN)
            if (buscaGeral != null && !buscaGeral.trim().isEmpty()) {
                String termo = "%" + buscaGeral.toLowerCase() + "%";
                
                Predicate nomeMatch = cb.like(cb.lower(root.get("tituloProduto")), termo);
                Predicate descMatch = cb.like(cb.lower(root.get("descricao")), termo);
                Predicate eanMatch = cb.like(cb.lower(root.get("codBarrasEan")), termo);
                
                // Combina os três com OR (Se bater em qualquer um, serve)
                predicates.add(cb.or(nomeMatch, descMatch, eanMatch));
            }

            // 3. FILTRO POR CATEGORIA
            if (categoriaId != null) {
                predicates.add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }

            // 4. FILTRO DE STATUS (Ativo/Inativo)
            if (ativo != null) {
                predicates.add(cb.equal(root.get("ativo"), ativo));
                predicates.add(cb.equal(root.get("ativo"), ativo));
            }
             // 5. FILTRO POR EAN (Exato)
            if (codBarrasEan != null && !codBarrasEan.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("codBarrasEan"), codBarrasEan));
            }

            // Junta as regras principais com AND
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}