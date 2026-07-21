package com.synapse.deadline.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
@DisplayName("GoogleMapsDistanceService")
class GoogleMapsDistanceServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private GoogleMapsDistanceService service;

    @BeforeEach
    void setUp() {
        service = new GoogleMapsDistanceService(restTemplate, new ObjectMapper(), "chave-teste");
    }

    @Test
    @DisplayName("Deve converter distância rodoviária retornada pela Distance Matrix API")
    void deveCalcularDistanciaRodoviaria() {
        String resposta = """
                {
                  "status": "OK",
                  "rows": [{
                    "elements": [{
                      "status": "OK",
                      "distance": { "value": 5432, "text": "5,4 km" }
                    }]
                  }]
                }
                """;

        when(restTemplate.getForObject(any(), eq(String.class))).thenReturn(resposta);

        var distancia = service.calcularDistanciaRodoviariaKm(-8.0476, -34.8770, -8.0500, -34.8800);

        assertTrue(distancia.isPresent());
        assertEquals(5.4, distancia.get());
    }

    @Test
    @DisplayName("Deve usar Haversine quando a API key não estiver configurada")
    void deveUsarHaversineSemApiKey() {
        GoogleMapsDistanceService semChave = new GoogleMapsDistanceService(
                restTemplate, new ObjectMapper(), "");

        var distancia = semChave.calcularDistanciaRodoviariaKm(-8.0476, -34.8770, -8.0500, -34.8800);

        assertTrue(distancia.isPresent());
        assertTrue(distancia.get() > 0 && distancia.get() < 5);
    }

    @Test
    @DisplayName("Deve calcular distâncias em lote para múltiplos destinos")
    void deveCalcularDistanciasEmLote() {
        String resposta = """
                {
                  "status": "OK",
                  "rows": [{
                    "elements": [
                      { "status": "OK", "distance": { "value": 1000, "text": "1 km" } },
                      { "status": "OK", "distance": { "value": 2000, "text": "2 km" } }
                    ]
                  }]
                }
                """;

        when(restTemplate.getForObject(any(), eq(String.class))).thenReturn(resposta);

        List<GoogleMapsDistanceService.Ponto> destinos = List.of(
                new GoogleMapsDistanceService.Ponto(-8.0500, -34.8800),
                new GoogleMapsDistanceService.Ponto(-8.0600, -34.8900));

        Map<String, Double> distancias = service.calcularDistanciasRodoviariasKm(
                -8.0476, -34.8770, destinos);

        assertEquals(2, distancias.size());
        assertEquals(1.0, distancias.get(GoogleMapsDistanceService.chaveCoordenada(-8.0500, -34.8800)));
        assertEquals(2.0, distancias.get(GoogleMapsDistanceService.chaveCoordenada(-8.0600, -34.8900)));
    }
}
