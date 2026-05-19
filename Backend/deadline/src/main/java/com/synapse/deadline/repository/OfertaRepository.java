package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Oferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
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
}