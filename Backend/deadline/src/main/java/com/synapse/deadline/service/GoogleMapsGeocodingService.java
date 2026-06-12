package com.synapse.deadline.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.deadline.entity.Endereco;
import com.synapse.deadline.util.GeoUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@Service
public class GoogleMapsGeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GoogleMapsGeocodingService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GoogleMapsGeocodingService(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Value("${google.maps.api.key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    public record Coordenadas(double latitude, double longitude) {}

    public Optional<Coordenadas> geocodificar(Endereco endereco) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GOOGLE_MAPS_API_KEY não configurada — geocodificação ignorada.");
            return Optional.empty();
        }

        String enderecoFormatado = GeoUtil.formatarEndereco(endereco);
        if (enderecoFormatado.isBlank()) {
            return Optional.empty();
        }

        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                    .queryParam("address", enderecoFormatado)
                    .queryParam("key", apiKey)
                    .queryParam("region", "br")
                    .build()
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (!"OK".equals(root.path("status").asText())) {
                log.warn("Geocodificação falhou para '{}': status={}", enderecoFormatado, root.path("status").asText());
                return Optional.empty();
            }

            JsonNode location = root.path("results").get(0).path("geometry").path("location");
            return Optional.of(new Coordenadas(
                    location.path("lat").asDouble(),
                    location.path("lng").asDouble()
            ));
        } catch (Exception e) {
            log.error("Erro ao geocodificar endereço '{}': {}", enderecoFormatado, e.getMessage());
            return Optional.empty();
        }
    }
}
