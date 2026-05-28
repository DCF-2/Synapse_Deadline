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

    public static Specification<Oferta> filtroVitrinePublica(com.synapse.deadline.dto.FiltroOfertasConsumidorDTO filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();

            // 1. REGRAS DE SEGURANÇA E VALIDADE (Obrigatórias para o consumidor)
            predicates.add(cb.isTrue(root.get("ativo"))); // Oferta ativa
            predicates.add(cb.isTrue(root.get("produto").get("ativo"))); // Produto ativo
            predicates.add(cb.greaterThanOrEqualTo(root.get("dataFimOferta"), java.time.LocalDate.now())); // Não expirada

            // 2. Filtros dinâmicos do consumidor
            if (filtro != null) {
                if (filtro.getNomeProduto() != null && !filtro.getNomeProduto().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("produto").get("tituloProduto")), "%" + filtro.getNomeProduto().toLowerCase() + "%"));
                }
                if (filtro.getCategoriaId() != null) {
                    predicates.add(cb.equal(root.get("produto").get("categoria").get("id"), filtro.getCategoriaId()));
                }
                if (filtro.getPrecoMin() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("precoPromocional"), filtro.getPrecoMin()));
                }
                if (filtro.getPrecoMax() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("precoPromocional"), filtro.getPrecoMax()));
                }
                if (filtro.getDiasMaxValidade() != null) {
                    java.time.LocalDate dataMax = java.time.LocalDate.now().plusDays(filtro.getDiasMaxValidade());
                    predicates.add(cb.lessThanOrEqualTo(root.get("validadeProduto"), dataMax));
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}