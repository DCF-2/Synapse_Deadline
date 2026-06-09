package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Oferta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
/**
 * Repositório de dados para a entidade {@link Oferta}.
 * Responsável pelas operações de busca dos lotes promocionais em risco de vencimento.
 */
@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Long>, JpaSpecificationExecutor<Oferta> {

    @Query("SELECT o FROM Oferta o WHERE o.ativo = true")
    Page<Oferta> findOfertasAtivas(Pageable pageable);

    Page<Oferta> findByProdutoEmpresaId(Long empresaId, Pageable pageable);

    List<Oferta> findByProdutoId(Long idProduto);
    List<Oferta> findByProdutoIdAndAtivoTrue(Long produtoId);
    List<Oferta> findByProdutoIdAndDataFimOfertaAfter(Long produtoId, LocalDate dataAtual);

    // Conta quantas ofertas ativas a empresa tem
    long countByProdutoEmpresaIdAndAtivoTrue(Long empresaId);

    long countByProdutoEmpresaIdAndAtivoTrueAndDataFimOfertaBetween(Long empresaId, java.time.LocalDate inicio, java.time.LocalDate fim);

    // método para o Dashboard somar os cliques:
    @Query("SELECT COALESCE(SUM(o.cliquesContato), 0) FROM Oferta o WHERE o.produto.empresa.id = :empresaId")
    Long sumCliquesContatoByEmpresaId(Long empresaId);

    // Método para o Dashboard listar as 5 ofertas mais clicadas:
    List<Oferta> findTop5ByProdutoEmpresaIdOrderByCliquesContatoDesc(Long empresaId);
}