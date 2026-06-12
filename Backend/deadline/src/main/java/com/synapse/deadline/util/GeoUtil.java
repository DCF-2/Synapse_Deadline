package com.synapse.deadline.util;

import com.synapse.deadline.entity.Endereco;

public final class GeoUtil {

    private static final double RAIO_TERRA_KM = 6371.0;

    private GeoUtil() {}

    public static double calcularDistanciaKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RAIO_TERRA_KM * c;
    }

    public static String formatarEndereco(Endereco endereco) {
        if (endereco == null) return "";
        StringBuilder sb = new StringBuilder();
        if (endereco.getLogradouro() != null) sb.append(endereco.getLogradouro());
        if (endereco.getNumero() != null && !endereco.getNumero().isBlank()) {
            sb.append(", ").append(endereco.getNumero());
        }
        if (endereco.getBairro() != null) sb.append(", ").append(endereco.getBairro());
        if (endereco.getCidade() != null) sb.append(", ").append(endereco.getCidade());
        if (endereco.getUf() != null) sb.append(" - ").append(endereco.getUf());
        if (endereco.getCep() != null) sb.append(", ").append(endereco.getCep());
        sb.append(", Brasil");
        return sb.toString();
    }
}
