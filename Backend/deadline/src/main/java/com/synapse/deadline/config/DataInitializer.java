package com.synapse.deadline.config;

import com.synapse.deadline.repository.RamoEmpresaRepository;
import com.synapse.deadline.entity.RamoEmpresa;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(RamoEmpresaRepository repository) {
        return args -> {
            // Verifica se a tabela já tem dados para não tentar inserir de novo
            if (repository.count() == 0) {
                salvarRamo(repository, "Farmácia", "Medicamentos e Saúde");
                salvarRamo(repository, "Cosméticos", "Beleza e Perfumaria");
                salvarRamo(repository, "Suplementos", "Nutrição Esportiva");
                System.out.println(">>> Ramos de empresa populados com sucesso!");
            }
        };
    }

    private void salvarRamo(RamoEmpresaRepository repository, String nome, String descricao) {
        RamoEmpresa r = new RamoEmpresa();
        r.setNome(nome);
        r.setDescricao(descricao);
        r.setAtivo(true);
        repository.save(r); // Deixe o JPA gerar o ID automaticamente
    }
}