package com.synapse.deadline.repository;

import com.synapse.deadline.entity.RamoEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para a entidade RamoEmpresa.
 */
@Repository
public interface RamoEmpresaRepository extends JpaRepository<RamoEmpresa, Long> {
}