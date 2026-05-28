package com.synapse.deadline.repository;

import com.synapse.deadline.dto.OfertaFiltroDTO;
import com.synapse.deadline.entity.Oferta;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class OfertaSpecifications {

    public static Specification<Oferta> comFiltros(OfertaFiltroDTO filtro, Long empresaId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Obriga sempre a que a oferta seja da empresa logada
            predicates.add(cb.equal(root.get("produto").get("empresa").get("id"), empresaId));

            if (filtro != null) {
                // Filtro por nome do produto
                if (filtro.getNome() != null && !filtro.getNome().trim().isEmpty()) {
                    predicates.add(cb.like(cb.lower(root.get("produto").get("tituloProduto")), 
                            "%" + filtro.getNome().toLowerCase() + "%"));
                }
                // Filtro por categoria
                if (filtro.getCategoriaId() != null) {
                    predicates.add(cb.equal(root.get("produto").get("categoria").get("id"), filtro.getCategoriaId()));
                }
                // Filtro por status (Ativo/Inativo)
                if (filtro.getAtivo() != null) {
                    predicates.add(cb.equal(root.get("ativo"), filtro.getAtivo()));
                }
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}