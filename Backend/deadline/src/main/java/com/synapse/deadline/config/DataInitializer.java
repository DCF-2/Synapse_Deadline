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
            garantirCategoria(categoriaRepository, "Medicamentos com Receita", "medicamentos-com-receita");
            garantirCategoria(categoriaRepository, "Medicamentos Isentos de Prescrição", "medicamentos-isentos");
            garantirCategoria(categoriaRepository, "Genéricos e Similares", "genericos-e-similares");
            garantirCategoria(categoriaRepository, "Saúde e Prevenção", "saude-e-prevencao");
            garantirCategoria(categoriaRepository, "Primeiros Socorros", "primeiros-socorros");
            garantirCategoria(categoriaRepository, "Aparelhos e Ortopedia", "aparelhos-e-ortopedia");
            garantirCategoria(categoriaRepository, "Saúde Sexual", "saude-sexual");
            garantirCategoria(categoriaRepository, "Mamães e Bebês", "mamaes-e-bebes");

            // Cosméticos
            garantirCategoria(categoriaRepository, "Cuidados com a Pele", "cuidados-com-a-pele");
            garantirCategoria(categoriaRepository, "Cuidados com o Cabelo", "cuidados-com-o-cabelo");
            garantirCategoria(categoriaRepository, "Maquiagem", "maquiagem");
            garantirCategoria(categoriaRepository, "Cabelos (Capilar)", "cabelos");
            garantirCategoria(categoriaRepository, "Rosto (Skincare)", "rosto-skincare");
            garantirCategoria(categoriaRepository, "Corpo e Banho", "corpo-e-banho");
            garantirCategoria(categoriaRepository, "Perfumaria", "perfumaria");
            garantirCategoria(categoriaRepository, "Unhas", "unhas");
            garantirCategoria(categoriaRepository, "Acessórios de Beleza", "acessorios-beleza");

            // Suplementos
            garantirCategoria(categoriaRepository, "Pré-Treinos", "pre-treinos");
            garantirCategoria(categoriaRepository, "Proteínas", "proteinas");
            garantirCategoria(categoriaRepository, "Aminoácidos", "aminoacidos");
            garantirCategoria(categoriaRepository, "Energia e Performance", "energia-performance");
            garantirCategoria(categoriaRepository, "Emagrecimento e Definição", "emagrecimento");
            garantirCategoria(categoriaRepository, "Vitaminas e Minerais", "vitaminas-e-minerais");
            garantirCategoria(categoriaRepository, "Alimentação Saudável", "alimentacao-saudavel");
            garantirCategoria(categoriaRepository, "Acessórios Esportivos", "acessorios-esportivos");
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