package com.synapse.deadline.config;

import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.service.GoogleMapsGeocodingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GeoMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(GeoMigrationRunner.class);
    private final EmpresaRepository empresaRepository;
    private final GoogleMapsGeocodingService geoService;

    public GeoMigrationRunner(EmpresaRepository empresaRepository, GoogleMapsGeocodingService geoService) {
        this.empresaRepository = empresaRepository;
        this.geoService = geoService;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Busca TODAS as empresas antigas que estão sem GPS
        List<Empresa> empresasSemGps = empresaRepository.findAll().stream()
                .filter(e -> e.getLatitude() == null || e.getLongitude() == null)
                .toList();

        if (empresasSemGps.isEmpty()) {
            log.info("Verificação de GPS: Todas as lojas já possuem coordenadas calculadas.");
            return;
        }

        log.info("Iniciando rotina automática de GPS para {} lojas antigas...", empresasSemGps.size());

        int atualizadas = 0;
        for (Empresa empresa : empresasSemGps) {
            try {
                if (empresa.getEndereco() != null && empresa.getEndereco().getLogradouro() != null) {
                    geoService.geocodificar(empresa.getEndereco()).ifPresent(coords -> {
                        empresa.setLatitude(coords.latitude());
                        empresa.setLongitude(coords.longitude());
                        empresaRepository.save(empresa);
                        log.info("✅ Coordenadas atualizadas para: {}", empresa.getNomeFantasia());
                    });
                    atualizadas++;
                    // Pausa de 200ms para evitar bloqueio (Rate Limit) da API do Google Maps
                    Thread.sleep(200);
                }
            } catch (Exception ex) {
                log.error("❌ Falha ao atualizar GPS da empresa {}: {}", empresa.getId(), ex.getMessage());
            }
        }

        log.info("Rotina de GPS finalizada. {} empresas recuperadas.", atualizadas);
    }
}