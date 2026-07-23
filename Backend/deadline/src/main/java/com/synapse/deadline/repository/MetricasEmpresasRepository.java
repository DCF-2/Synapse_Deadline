package com.synapse.deadline.repository;

import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.MetricasEmpresas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface MetricasEmpresasRepository extends JpaRepository<MetricasEmpresas, Long> {

    Optional<MetricasEmpresas> findByEmpresaAndDia(Empresa empresa, LocalDate dia);

    @Query("SELECT COALESCE(SUM(m.cliquesPerfil) + SUM(m.cliquesWhatsAppEmpresa) + SUM(m.cliquesEmailEmpresa) + SUM(m.cliquesComoChegarEmpresa), 0) " +
           "FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId")
    Long sumEngajamentosByEmpresaId(@Param("empresaId") Long empresaId);

    @Query("SELECT COALESCE(SUM(m.cliquesPerfil) + SUM(m.cliquesWhatsAppEmpresa) + SUM(m.cliquesEmailEmpresa) + SUM(m.cliquesComoChegarEmpresa), 0) " +
           "FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumEngajamentosByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT m.dia, COALESCE(SUM(m.cliquesPerfil) + SUM(m.cliquesWhatsAppEmpresa) + SUM(m.cliquesEmailEmpresa) + SUM(m.cliquesComoChegarEmpresa), 0) " +
           "FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim " +
           "GROUP BY m.dia ORDER BY m.dia ASC")
    java.util.List<Object[]> findEvolucaoDiariaByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesPerfil), 0) FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumPerfilByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesWhatsAppEmpresa), 0) FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumWhatsAppByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesEmailEmpresa), 0) FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumEmailByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(m.cliquesComoChegarEmpresa), 0) FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId AND m.dia BETWEEN :inicio AND :fim")
    Long sumComoChegarByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Modifying
    @Query("DELETE FROM MetricasEmpresas m WHERE m.empresa.id = :empresaId")
    void deleteByEmpresaId(@Param("empresaId") Long empresaId);
}
