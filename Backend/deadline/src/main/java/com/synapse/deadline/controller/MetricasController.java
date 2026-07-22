package com.synapse.deadline.controller;

import com.synapse.deadline.service.MetricasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/publico/metricas")
public class MetricasController {

    @Autowired
    private MetricasService metricasService;

    @PostMapping("/ofertas/{id}/engajamento/{tipo}")
    public ResponseEntity<Void> registrarEngajamentoOferta(
            @PathVariable Long id,
            @PathVariable String tipo) {
        
        try {
            MetricasService.TipoEngajamentoOferta enumTipo = MetricasService.TipoEngajamentoOferta.valueOf(tipo.toUpperCase());
            metricasService.registrarEngajamentoOferta(id, enumTipo);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/empresas/{id}/engajamento/{tipo}")
    public ResponseEntity<Void> registrarEngajamentoEmpresa(
            @PathVariable Long id,
            @PathVariable String tipo) {
        
        try {
            MetricasService.TipoEngajamentoEmpresa enumTipo = MetricasService.TipoEngajamentoEmpresa.valueOf(tipo.toUpperCase());
            metricasService.registrarEngajamentoEmpresa(id, enumTipo);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
