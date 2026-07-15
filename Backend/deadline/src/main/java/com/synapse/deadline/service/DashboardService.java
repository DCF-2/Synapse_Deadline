package com.synapse.deadline.service;

import com.synapse.deadline.dto.DashboardResponseDTO;
import com.synapse.deadline.dto.EngajamentoDiarioDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.MetricasEmpresasRepository;
import com.synapse.deadline.repository.MetricasOfertasRepository;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private MetricasOfertasRepository metricasOfertasRepository;

    @Autowired
    private MetricasEmpresasRepository metricasEmpresasRepository;

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
        
        Long engajamentosOfertas = metricasOfertasRepository.sumEngajamentosByEmpresaId(idEmpresa);
        Long engajamentosEmpresa = metricasEmpresasRepository.sumEngajamentosByEmpresaId(idEmpresa);
        long totalEngajamentos = (engajamentosOfertas != null ? engajamentosOfertas : 0L) + 
                                 (engajamentosEmpresa != null ? engajamentosEmpresa : 0L);
        dashboard.setEngajamentosTotais(totalEngajamentos);
        
        // Dados para o Funil e Detalhamento
        Long cliquesDetalhe = metricasOfertasRepository.sumCliquesDetalheByEmpresaId(idEmpresa);
        dashboard.setTotalCliquesDetalhe(cliquesDetalhe != null ? cliquesDetalhe : 0L);
        
        Long cliquesContato = metricasOfertasRepository.sumCliquesContatoByEmpresaId(idEmpresa);
        dashboard.setTotalCliquesContato(cliquesContato != null ? cliquesContato : 0L);

        // Detalhamento Específico
        Long wOferta = metricasOfertasRepository.sumWhatsAppByEmpresaId(idEmpresa);
        Long wEmpresa = metricasEmpresasRepository.sumWhatsAppByEmpresaId(idEmpresa);
        dashboard.setTotalWhatsApp((wOferta != null ? wOferta : 0L) + (wEmpresa != null ? wEmpresa : 0L));

        Long eOferta = metricasOfertasRepository.sumEmailByEmpresaId(idEmpresa);
        Long eEmpresa = metricasEmpresasRepository.sumEmailByEmpresaId(idEmpresa);
        dashboard.setTotalEmail((eOferta != null ? eOferta : 0L) + (eEmpresa != null ? eEmpresa : 0L));

        Long cOferta = metricasOfertasRepository.sumComoChegarByEmpresaId(idEmpresa);
        Long cEmpresa = metricasEmpresasRepository.sumComoChegarByEmpresaId(idEmpresa);
        dashboard.setTotalComoChegar((cOferta != null ? cOferta : 0L) + (cEmpresa != null ? cEmpresa : 0L));

        Long favoritos = metricasOfertasRepository.sumFavoritosByEmpresaId(idEmpresa);
        dashboard.setTotalFavoritos(favoritos != null ? favoritos : 0L);

        Long perfil = metricasEmpresasRepository.sumPerfilByEmpresaId(idEmpresa);
        dashboard.setTotalPerfil(perfil != null ? perfil : 0L);
        
        // Dados para o Gráfico de Evolução (Últimos 7 dias)
        LocalDate inicioSemana = hoje.minusDays(6); // 7 dias incluindo hoje
        List<Object[]> evolucaoOfertas = metricasOfertasRepository.findEvolucaoDiariaByEmpresaId(idEmpresa, inicioSemana);
        List<Object[]> evolucaoEmpresa = metricasEmpresasRepository.findEvolucaoDiariaByEmpresaId(idEmpresa, inicioSemana);
        
        Map<LocalDate, Long> mapaEvolucao = new HashMap<>();
        // Inicializa 7 dias com 0
        for (int i = 0; i < 7; i++) {
            mapaEvolucao.put(inicioSemana.plusDays(i), 0L);
        }
        
        for (Object[] row : evolucaoOfertas) {
            LocalDate d = (LocalDate) row[0];
            Long val = ((Number) row[1]).longValue();
            if (mapaEvolucao.containsKey(d)) mapaEvolucao.put(d, mapaEvolucao.get(d) + val);
        }
        for (Object[] row : evolucaoEmpresa) {
            LocalDate d = (LocalDate) row[0];
            Long val = ((Number) row[1]).longValue();
            if (mapaEvolucao.containsKey(d)) mapaEvolucao.put(d, mapaEvolucao.get(d) + val);
        }
        
        List<EngajamentoDiarioDTO> listaEvolucao = new ArrayList<>();
        // Para manter a ordem crescente de data
        for (int i = 0; i < 7; i++) {
            LocalDate dataCorrente = inicioSemana.plusDays(i);
            listaEvolucao.add(new EngajamentoDiarioDTO(dataCorrente, mapaEvolucao.get(dataCorrente)));
        }
        dashboard.setEngajamentoEvolucao(listaEvolucao);
        
        // Ofertas que acabam nos próximos 7 dias
        dashboard.setOfertasExpirandoBrevemente(
                ofertaRepository.countByProdutoEmpresaIdAndAtivoTrueAndDataFimOfertaBetween(idEmpresa, hoje, hoje.plusDays(7))
        );

        // Gráfico de Barras: Top 5 Ofertas com mais cliques no WhatsApp/Email
        List<OfertaResponseDTO> topEngajadas = ofertaRepository.findTop5ByProdutoEmpresaIdOrderByCliquesContatoDesc(idEmpresa)
                .stream().map(oferta -> {
                    OfertaResponseDTO dto = new OfertaResponseDTO();
                    dto.setTituloProduto(oferta.getProduto().getTituloProduto());
                    dto.setCliquesContato(oferta.getCliquesContato() != null ? oferta.getCliquesContato() : 0);
                    return dto;
                }).toList();
        dashboard.setTopOfertasEngajamento(topEngajadas);

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