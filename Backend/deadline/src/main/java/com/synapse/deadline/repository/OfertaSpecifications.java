package com.synapse.deadline.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.synapse.deadline.dto.OfertaFiltroDTO;
import com.synapse.deadline.entity.Oferta;

import jakarta.persistence.criteria.Predicate;

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
                
                // Filtro por código de barras (EAN)
                if (filtro.getCodBarrasEan() != null && !filtro.getCodBarrasEan().trim().isEmpty()) {
                    predicates.add(cb.equal(root.get("produto").get("codBarrasEan"), filtro.getCodBarrasEan().trim()));
                }

                // Filtro por categoria
                if (filtro.getCategoriaId() != null) {
                    predicates.add(cb.equal(root.get("produto").get("categoria").get("id"), filtro.getCategoriaId()));
                }
                // Filtro por status (Ativo/Inativo)
                if (filtro.getAtivo() != null) {
                    predicates.add(cb.equal(root.get("ativo"), filtro.getAtivo()));
                }
                // Filtro por nome da empresa (caso queira filtrar por ofertas de uma empresa específica, além da empresa logada)
                if (filtro.getEmpresaId() != null) {
                    predicates.add(cb.equal(root.get("produto").get("empresa").get("id"), filtro.getEmpresaId()));
                }
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

   public static Specification<Oferta> filtroVitrinePublica(com.synapse.deadline.dto.FiltroOfertasConsumidorDTO filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();
            
            // Usando JOIN por segurança para evitar erros 500 no Hibernate
            jakarta.persistence.criteria.Join<Object, Object> produtoJoin = root.join("produto");
            jakarta.persistence.criteria.Join<Object, Object> empresaJoin = produtoJoin.join("empresa");

            // 1. REGRAS OBRIGATÓRIAS
            predicates.add(cb.isTrue(root.get("ativo")));
            predicates.add(cb.isTrue(produtoJoin.get("ativo"))); 
            predicates.add(cb.greaterThanOrEqualTo(root.get("dataFimOferta"), java.time.LocalDate.now()));

            // 2. FILTROS DINÂMICOS
            if (filtro != null) {
                if (filtro.getNomeProduto() != null && !filtro.getNomeProduto().isBlank()) {
                    predicates.add(cb.like(cb.lower(produtoJoin.get("tituloProduto")), "%" + filtro.getNomeProduto().toLowerCase() + "%"));
                }

                if (filtro.getCodBarrasEan() != null && !filtro.getCodBarrasEan().isBlank()) {
                    predicates.add(cb.equal(produtoJoin.get("codBarrasEan"), filtro.getCodBarrasEan().trim()));
                }

                if (filtro.getCategoriaId() != null) {
                    predicates.add(cb.equal(produtoJoin.get("categoria").get("id"), filtro.getCategoriaId()));
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
                if (filtro.getEmpresaId() != null) {
                    predicates.add(cb.equal(empresaJoin.get("id"), filtro.getEmpresaId()));
                }

                boolean geoAtivo = filtro.getLatitude() != null && filtro.getLongitude() != null;
                if (geoAtivo) {
                    predicates.add(cb.isNotNull(empresaJoin.get("latitude")));
                    predicates.add(cb.isNotNull(empresaJoin.get("longitude")));
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}