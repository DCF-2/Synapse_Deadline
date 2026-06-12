package com.synapse.deadline.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Carrega variáveis do arquivo .env para o ambiente antes do Spring iniciar.
 * Spring Boot não lê .env nativamente — apenas variáveis de sistema/shell.
 */
public final class DotenvLoader {

    private DotenvLoader() {}

    public static void carregar() {
        Path envPath = Path.of(".env");
        if (!Files.exists(envPath)) {
            return;
        }

        try {
            List<String> linhas = Files.readAllLines(envPath);
            for (String linha : linhas) {
                String trimmed = linha.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }

                int separador = trimmed.indexOf('=');
                if (separador <= 0) {
                    continue;
                }

                String chave = trimmed.substring(0, separador).trim();
                String valor = trimmed.substring(separador + 1).trim();

                if (valor.startsWith("\"") && valor.endsWith("\"") && valor.length() >= 2) {
                    valor = valor.substring(1, valor.length() - 1);
                }

                if (System.getenv(chave) == null && System.getProperty(chave) == null) {
                    System.setProperty(chave, valor);
                }
            }
        } catch (Exception e) {
            System.err.println("Aviso: não foi possível carregar .env — " + e.getMessage());
        }
    }
}
