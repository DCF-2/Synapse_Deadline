package com.synapse.deadline.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;

@MockBean
class GeoUtilTest {

    @Test
    @DisplayName("Deve calcular distância entre dois pontos conhecidos")
    void deveCalcularDistanciaKm() {
        // Centro de São Paulo → Centro do Rio (~357 km)
        double distancia = GeoUtil.calcularDistanciaKm(-23.5505, -46.6333, -22.9068, -43.1729);
        assertTrue(distancia > 350 && distancia < 370);
    }

    @Test
    @DisplayName("Distância entre o mesmo ponto deve ser zero")
    void distanciaMesmoPontoDeveSerZero() {
        double distancia = GeoUtil.calcularDistanciaKm(-23.5505, -46.6333, -23.5505, -46.6333);
        assertEquals(0.0, distancia, 0.001);
    }
}
