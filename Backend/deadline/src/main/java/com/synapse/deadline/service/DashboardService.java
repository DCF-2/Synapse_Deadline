package com.synapse.deadline.service;

import com.synapse.deadline.dto.DashboardResponseDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private OfertaService ofertaService; // Para reutilizar o método de conversão DTO

    @Transactional(readOnly = true)
    public DashboardResponseDTO obterEstatisticas() {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long idEmpresa = empresaLogada.getId();
        LocalDate hoje = LocalDate.now();

        DashboardResponseDTO dashboard = new DashboardResponseDTO();

        // 1. Contagens
        dashboard.setTotalProdutosAtivos(produtoRepository.countByEmpresaIdAndAtivoTrue(idEmpresa));
        dashboard.setTotalOfertasAtivas(ofertaRepository.countByProdutoEmpresaIdAndAtivoTrue(idEmpresa));
        
        // Ofertas que acabam nos próximos 7 dias
        dashboard.setOfertasExpirandoBrevemente(
                ofertaRepository.countByProdutoEmpresaIdAndAtivoTrueAndDataFimOfertaBetween(idEmpresa, hoje, hoje.plusDays(7))
        );

        // 2. Últimas 5 ofertas criadas
        List<OfertaResponseDTO> recentes = ofertaRepository.findByProdutoEmpresaId(
                idEmpresa, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"))
        ).map(oferta -> {
            OfertaResponseDTO dto = new OfertaResponseDTO();
            dto.setId(oferta.getId());
            dto.setTituloProduto(oferta.getProduto().getTituloProduto());
            dto.setPrecoOriginal(oferta.getProduto().getPrecoOriginal());
            dto.setPrecoPromocional(oferta.getPrecoPromocional());
            dto.setPercentualDesconto(oferta.getPercentualDesconto());
            dto.setDataFimOferta(oferta.getDataFimOferta());
            dto.setAtivo(oferta.getAtivo());
            return dto;
        }).getContent();

        dashboard.setOfertasRecentes(recentes);

        return dashboard;
    }
}