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

            garantirCategoria(categoriaRepository, "Alimentos e Bebidas", "alimentos-e-bebidas");
            garantirCategoria(categoriaRepository, "Higiene e Beleza", "higiene-e-beleza");
            garantirCategoria(categoriaRepository, "Medicamentos", "medicamentos");
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