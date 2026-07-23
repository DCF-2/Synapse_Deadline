package com.synapse.deadline.repository;

import com.synapse.deadline.entity.MetricasOfertas;
import com.synapse.deadline.entity.Oferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricasOfertasRepository extends JpaRepository<MetricasOfertas, Long> {
    
    Optional<MetricasOfertas> findByOfertaAndDia(Oferta oferta, LocalDate dia);

    @Query("SELECT COALESCE(SUM(m.cliquesDetalhe) + SUM(m.cliquesWhatsAppOferta) + SUM(m.cliquesEmailOferta) + SUM(m.cliquesComoChegarOferta) + SUM(m.cliquesFavoritarOferta), 0) " +
           "FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId")
    Long sumEngajamentosByEmpresaId(@Param("empresaId") Long empresaId);

    @Query("SELECT COALESCE(SUM(m.cliquesDetalhe) + SUM(m.cliquesWhatsAppOferta) + SUM(m.cliquesEmailOferta) + SUM(m.cliquesComoChegarOferta) + SUM(m.cliquesFavoritarOferta), 0) " +
           "FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumEngajamentosByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesDetalhe), 0) FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumCliquesDetalheByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
    
    @Query("SELECT COALESCE(SUM(m.cliquesWhatsAppOferta), 0) FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumWhatsAppByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesEmailOferta), 0) FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumEmailByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesComoChegarOferta), 0) FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumComoChegarByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesFavoritarOferta), 0) FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumFavoritosByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesWhatsAppOferta) + SUM(m.cliquesEmailOferta) + SUM(m.cliquesComoChegarOferta), 0) FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumCliquesContatoByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT m.dia, COALESCE(SUM(m.cliquesDetalhe) + SUM(m.cliquesWhatsAppOferta) + SUM(m.cliquesEmailOferta) + SUM(m.cliquesComoChegarOferta) + SUM(m.cliquesFavoritarOferta), 0) " +
           "FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim " +
           "GROUP BY m.dia ORDER BY m.dia ASC")
    java.util.List<Object[]> findEvolucaoDiariaByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Modifying
    @Query("DELETE FROM MetricasOfertas m WHERE m.oferta.produto.empresa.id = :empresaId")
    void apagarPorEmpresaId(@Param("empresaId") Long empresaId);
}
