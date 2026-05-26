package com.synapse.deadline.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.repository.CategoriaProdutoRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository;

class DataInitializerTest {

    @Test
    @DisplayName("deve garantir as categorias padrão ao inicializar os dados")
    void deveGarantirCategoriasPadraoAoInicializar() throws Exception {
        RamoEmpresaRepository ramoRepository = mock(RamoEmpresaRepository.class);
        CategoriaProdutoRepository categoriaRepository = mock(CategoriaProdutoRepository.class);

        when(ramoRepository.count()).thenReturn(1L);
        when(categoriaRepository.findAll()).thenReturn(Collections.emptyList());

        DataInitializer initializer = new DataInitializer();

        assertDoesNotThrow(() -> initializer.initData(ramoRepository, categoriaRepository).run());

        verify(categoriaRepository, times(4)).save(any(CategoriaProduto.class));
    }
}
