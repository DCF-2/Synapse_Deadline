package com.synapse.deadline.controller;

import com.synapse.deadline.dto.DashboardResponseDTO;
import com.synapse.deadline.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponseDTO> obterResumo() {
        return ResponseEntity.ok(dashboardService.obterEstatisticas());
    }
}