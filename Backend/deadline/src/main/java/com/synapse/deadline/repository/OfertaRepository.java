package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Oferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositório de dados para a entidade {@link Oferta}.
 * Responsável pelas operações de busca dos lotes promocionais em risco de vencimento.
 */
@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Long> {

    /**
     * Consulta todas as ofertas que estão atualmente marcadas como ativas no sistema.
     *
     * @return Lista de ofertas em vigor na plataforma.
     */
    @Query("SELECT o FROM Oferta o WHERE o.ativo = true")
    List<Oferta> findOfertasAtivas();

    /**
     * Filtra todas as ofertas associadas a um determinado produto do catálogo.
     *
     * @param idProduto O identificador único do produto base.
     * @return Lista de ofertas geradas para este produto.
     */
    List<Oferta> findByProdutoId(Long idProduto);

    /**
     * Filtra todas as ofertas associadas a um determinado produto do catálogo e que estejam ativas.
     *
     * @param produtoId O identificador único do produto base.
     * @return Lista de ofertas ativas geradas para este produto.
     */
    List<Oferta> findByProdutoIdAndAtivoTrue(Long produtoId);

    /**
     * Filtra todas as ofertas associadas a produtos de uma empresa específica.
     *
     * @param empresaId O identificador único da empresa.
     * @return Lista de ofertas vinculadas à empresa.
     */
    List<Oferta> findByProdutoEmpresaId(Long empresaId);

    /**
     * Filtra todas as ofertas associadas a um determinado produto do catálogo e que tenham data de término após uma determinada data.
     *
     * @param produtoId O identificador único do produto base.
     * @param dataAtual A data de referência para filtragem.
     * @return Lista de ofertas geradas para este produto e que ainda estão válidas.
     */
    List<Oferta> findByProdutoIdAndDataFimOfertaAfter(Long produtoId, LocalDate dataAtual);
}