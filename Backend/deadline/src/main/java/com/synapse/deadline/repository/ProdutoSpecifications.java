package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Produto;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class ProdutoSpecifications {

    private ProdutoSpecifications() {
    }

    public static Specification<Produto> filtrarPorEmpresaEParametros(
            Long empresaId,
            String nome,
            Long categoriaId,
            String codBarrasEan,
            String descricao,
            Boolean ativo,
            BigDecimal precoMin,
            BigDecimal precoMax
    ) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();
            predicates.getExpressions().add(cb.equal(root.get("empresa").get("id"), empresaId));

            if (nome != null && !nome.isBlank()) {
                predicates.getExpressions().add(
                        cb.like(cb.lower(root.get("tituloProduto")), "%" + nome.trim().toLowerCase() + "%")
                );
            }

            if (categoriaId != null) {
                predicates.getExpressions().add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }

            if (codBarrasEan != null && !codBarrasEan.isBlank()) {
                predicates.getExpressions().add(cb.equal(root.get("codBarrasEan"), codBarrasEan.trim()));
            }

            if (descricao != null && !descricao.isBlank()) {
                predicates.getExpressions().add(
                        cb.like(cb.lower(root.get("descricao")), "%" + descricao.trim().toLowerCase() + "%")
                );
            }

            if (ativo != null) {
                predicates.getExpressions().add(cb.equal(root.get("ativo"), ativo));
            }

            if (precoMin != null) {
                predicates.getExpressions().add(cb.greaterThanOrEqualTo(root.get("precoOriginal"), precoMin));
            }

            if (precoMax != null) {
                predicates.getExpressions().add(cb.lessThanOrEqualTo(root.get("precoOriginal"), precoMax));
            }

            if (precoMin != null && precoMax != null && precoMin.compareTo(precoMax) > 0) {
                throw new IllegalArgumentException("O preço mínimo não pode ser maior que o preço máximo.");
            }

            return predicates;
        };
    }
}
