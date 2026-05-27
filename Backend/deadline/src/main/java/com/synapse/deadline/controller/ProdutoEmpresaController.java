package com.synapse.deadline.controller;

import com.synapse.deadline.dto.ProdutoEmpresaDetalhesDTO;
import com.synapse.deadline.dto.ProdutoEmpresaFiltroDTO;
import com.synapse.deadline.dto.ProdutoEmpresaResumoDTO;
import com.synapse.deadline.dto.ProdutoRequestDTO;
import com.synapse.deadline.entity.CategoriaProduto;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.service.ProdutoEmpresaService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/produto")
public class ProdutoEmpresaController {

    @Autowired
    private ProdutoEmpresaService service;

   @PostMapping
    public ResponseEntity<ProdutoEmpresaDetalhesDTO> cadastrar(
            @Valid @RequestBody ProdutoRequestDTO dto
    ) {
        return ResponseEntity.ok(service.cadastrarProduto(dto));
    }

    @GetMapping("/publico")
    public ResponseEntity<org.springframework.data.domain.Page<ProdutoEmpresaResumoDTO>> listarPublico(
            @org.springframework.data.web.PageableDefault(size = 12, sort = "tituloProduto") org.springframework.data.domain.Pageable pageable
    ) {
        return ResponseEntity.ok(service.listarProdutosPublicos(pageable));
    }

    @GetMapping("/publico/{id}")
    public ResponseEntity<ProdutoEmpresaDetalhesDTO> visualizarProdutoPublico(@PathVariable Long id) {
        return ResponseEntity.ok(service.visualizarProdutoPublico(id));
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaProduto>> listarCategorias() {
        return ResponseEntity.ok(service.listarCategorias());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoEmpresaDetalhesDTO> visualizarProduto(@PathVariable Long id) {
        // Agora o controller passa apenas o ID, o Service se vira com o SecurityContext
        return ResponseEntity.ok(service.visualizarProdutoDaEmpresa(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoEmpresaDetalhesDTO> editarProduto(
            @PathVariable Long id, 
            @Valid @RequestBody ProdutoRequestDTO dto) {
        return ResponseEntity.ok(service.editarProduto(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id); // O serviço agora fará a validação de propriedade e o Soft Delete
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint GET /produto/empresa
     * Retorna a lista de produtos da empresa autenticada de forma resumida.
     */
   @GetMapping("/empresa")
    public ResponseEntity<Page<ProdutoEmpresaResumoDTO>> listarPorEmpresa(
            @PageableDefault(size = 12, sort = "tituloProduto") Pageable pageable,
            @ModelAttribute ProdutoEmpresaFiltroDTO filtro
    ) {
        return ResponseEntity.ok(service.listarProdutosPorEmpresaLogada(pageable, filtro));
    }
    
    
}