package com.synapse.deadline.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.deadline.util.GeoUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleMapsDistanceService {

    private static final Logger log = LoggerFactory.getLogger(GoogleMapsDistanceService.class);
    private static final int MAX_DESTINOS_POR_REQUISICAO = 25;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GoogleMapsDistanceService(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Value("${google.maps.distance.api.key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    public record Ponto(double latitude, double longitude) {}

    public Optional<Double> calcularDistanciaRodoviariaKm(
            double latOrigem, double lngOrigem, double latDestino, double lngDestino) {
        Map<String, Double> distancias = calcularDistanciasRodoviariasKm(
                latOrigem, lngOrigem, List.of(new Ponto(latDestino, lngDestino)));
        return Optional.ofNullable(distancias.get(chaveCoordenada(latDestino, lngDestino)));
    }

    public Map<String, Double> calcularDistanciasRodoviariasKm(
            double latOrigem, double lngOrigem, List<Ponto> destinos) {
        Map<String, Double> resultado = new LinkedHashMap<>();
        if (destinos == null || destinos.isEmpty()) {
            return resultado;
        }

        List<Ponto> destinosUnicos = destinos.stream()
                .filter(p -> p != null)
                .distinct()
                .toList();

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GOOGLE_MAPS_DISTANCE_API_KEY não configurada — usando distância em linha reta.");
            preencherComHaversine(latOrigem, lngOrigem, destinosUnicos, resultado);
            return resultado;
        }

        for (int i = 0; i < destinosUnicos.size(); i += MAX_DESTINOS_POR_REQUISICAO) {
            List<Ponto> lote = destinosUnicos.subList(
                    i, Math.min(i + MAX_DESTINOS_POR_REQUISICAO, destinosUnicos.size()));
            consultarDistanceMatrix(latOrigem, lngOrigem, lote, resultado);
        }

        for (Ponto destino : destinosUnicos) {
            String chave = chaveCoordenada(destino.latitude(), destino.longitude());
            resultado.computeIfAbsent(chave, k -> arredondarKm(GeoUtil.calcularDistanciaKm(
                    latOrigem, lngOrigem, destino.latitude(), destino.longitude())));
        }

        return resultado;
    }

    private void consultarDistanceMatrix(
            double latOrigem, double lngOrigem, List<Ponto> destinos, Map<String, Double> resultado) {
        try {
            String origem = formatarCoordenada(latOrigem, lngOrigem);
            String destinosParam = destinos.stream()
                    .map(p -> formatarCoordenada(p.latitude(), p.longitude()))
                    .reduce((a, b) -> a + "|" + b)
                    .orElse("");

            URI uri = UriComponentsBuilder
                    .fromUriString("https://maps.googleapis.com/maps/api/distancematrix/json")
                    .queryParam("origins", origem)
                    .queryParam("destinations", destinosParam)
                    .queryParam("mode", "driving")
                    .queryParam("language", "pt-BR")
                    .queryParam("key", apiKey)
                    .build()
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (!"OK".equals(root.path("status").asText())) {
                log.warn("Distance Matrix falhou: status={}", root.path("status").asText());
                preencherComHaversine(latOrigem, lngOrigem, destinos, resultado);
                return;
            }

            JsonNode elements = root.path("rows").get(0).path("elements");
            for (int i = 0; i < destinos.size(); i++) {
                Ponto destino = destinos.get(i);
                JsonNode element = elements.get(i);
                String chave = chaveCoordenada(destino.latitude(), destino.longitude());

                if ("OK".equals(element.path("status").asText())) {
                    double km = element.path("distance").path("value").asDouble() / 1000.0;
                    resultado.put(chave, arredondarKm(km));
                } else {
                    log.warn("Rota indisponível para destino {}: status={}",
                            chave, element.path("status").asText());
                    resultado.put(chave, arredondarKm(GeoUtil.calcularDistanciaKm(
                            latOrigem, lngOrigem, destino.latitude(), destino.longitude())));
                }
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Distance Matrix: {}", e.getMessage());
            preencherComHaversine(latOrigem, lngOrigem, destinos, resultado);
        }
    }

    private void preencherComHaversine(
            double latOrigem, double lngOrigem, List<Ponto> destinos, Map<String, Double> resultado) {
        for (Ponto destino : destinos) {
            String chave = chaveCoordenada(destino.latitude(), destino.longitude());
            resultado.put(chave, arredondarKm(GeoUtil.calcularDistanciaKm(
                    latOrigem, lngOrigem, destino.latitude(), destino.longitude())));
        }
    }

    static String chaveCoordenada(double lat, double lng) {
        return String.format(Locale.US, "%.6f,%.6f", lat, lng);
    }

    private static String formatarCoordenada(double lat, double lng) {
        return String.format(Locale.US, "%.6f,%.6f", lat, lng);
    }

    static double arredondarKm(double km) {
        return Math.round(km * 10.0) / 10.0;
    }
}
