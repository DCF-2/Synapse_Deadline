package com.synapse.deadline.config;

import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            RamoEmpresaRepository ramoRepository,
            CategoriaProdutoRepository categoriaRepository
    ) {
        return args -> {
            if (ramoRepository.count() == 0) {
                salvarRamo(ramoRepository, "Farmácia", "Medicamentos e Saúde");
                salvarRamo(ramoRepository, "Cosméticos", "Beleza e Perfumaria");
                salvarRamo(ramoRepository, "Suplementos", "Nutrição Esportiva");
                System.out.println(">>> Ramos de empresa populados com sucesso!");
            }

            // Farmácia
            garantirCategoria(categoriaRepository, "Medicamentos", "medicamentos");
            garantirCategoria(categoriaRepository, "Saúde e Higiene", "saude-higiene");
            garantirCategoria(categoriaRepository, "Infantil e Bebês", "infantil-bebes");

            // Cosméticos
            garantirCategoria(categoriaRepository, "Cabelos e Corpo", "cabelos-corpo");
            garantirCategoria(categoriaRepository, "Pele e Maquiagem", "pele-maquiagem");
            garantirCategoria(categoriaRepository, "Perfumaria", "perfumaria");

            // Suplementos
            garantirCategoria(categoriaRepository, "Nutrição Esportiva", "nutricao-esportiva");
            garantirCategoria(categoriaRepository, "Vitaminas e Naturais", "vitaminas-naturais");
            garantirCategoria(categoriaRepository, "Acessórios Esportivos", "acessorios-esportivos");

            // Geral
            garantirCategoria(categoriaRepository, "Outro", "outro");
            System.out.println(">>> Categorias de produto garantidas com sucesso!");
        };
    }

    private void salvarRamo(RamoEmpresaRepository repository, String nome, String descricao) {
        RamoEmpresa ramo = new RamoEmpresa();
        ramo.setNome(nome);
        ramo.setDescricao(descricao);
        ramo.setAtivo(true);
        repository.save(ramo);
    }

    private void garantirCategoria(CategoriaProdutoRepository repository, String nome, String slug) {
        boolean existe = repository.findAll().stream()
                .anyMatch(categoria -> nome.equals(categoria.getNome()));

        if (existe) {
            return;
        }

        CategoriaProduto categoria = new CategoriaProduto();
        categoria.setNome(nome);
        categoria.setSlug(slug);
        categoria.setAtivo(true);
        repository.save(categoria);
    }
}