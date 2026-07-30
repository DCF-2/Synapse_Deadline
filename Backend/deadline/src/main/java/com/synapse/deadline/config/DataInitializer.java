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
            garantirCategoria(categoriaRepository, "Saúde e Bem-Estar", "saude-e-bem-estar");
            garantirCategoria(categoriaRepository, "Higiene e Cuidados Pessoais", "higiene-pessoal");
            garantirCategoria(categoriaRepository, "Mamães e Bebês", "mamaes-e-bebes");
            garantirCategoria(categoriaRepository, "Saúde Sexual", "saude-sexual");

            // Cosméticos
            garantirCategoria(categoriaRepository, "Cabelos", "cabelos");
            garantirCategoria(categoriaRepository, "Pele e Rosto", "pele-rosto");
            garantirCategoria(categoriaRepository, "Maquiagem", "maquiagem");
            garantirCategoria(categoriaRepository, "Perfumaria", "perfumaria");
            garantirCategoria(categoriaRepository, "Corpo e Banho", "corpo-e-banho");

            // Suplementos
            garantirCategoria(categoriaRepository, "Proteínas e Aminoácidos", "proteinas-aminoacidos");
            garantirCategoria(categoriaRepository, "Energia e Pré-Treino", "energia-pre-treino");
            garantirCategoria(categoriaRepository, "Emagrecimento", "emagrecimento");
            garantirCategoria(categoriaRepository, "Vitaminas e Saúde", "vitaminas-e-saude");
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