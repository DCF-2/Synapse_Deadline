package com.synapse.deadline.service;

import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.MetricasEmpresas;
import com.synapse.deadline.entity.MetricasOfertas;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.MetricasEmpresasRepository;
import com.synapse.deadline.repository.MetricasOfertasRepository;
import com.synapse.deadline.repository.OfertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class MetricasService {

    @Autowired
    private MetricasOfertasRepository metricasOfertasRepository;

    @Autowired
    private MetricasEmpresasRepository metricasEmpresasRepository;

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    public enum TipoEngajamentoOferta {
        DETALHE, WHATSAPP, EMAIL, COMO_CHEGAR, FAVORITAR
    }

    public enum TipoEngajamentoEmpresa {
        PERFIL, WHATSAPP, EMAIL, COMO_CHEGAR
    }

    /**
     * Incrementa o engajamento de uma Oferta.
     * Utiliza concorrência segura: tenta buscar, se não achar, tenta criar.
     * Se falhar ao criar (outra thread já criou), busca novamente.
     */
    @Transactional
    public void registrarEngajamentoOferta(Long ofertaId, TipoEngajamentoOferta tipo) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada"));

        LocalDate hoje = LocalDate.now();
        MetricasOfertas metricas = obterOuCriarMetricasOferta(oferta, hoje);

        switch (tipo) {
            case DETALHE -> metricas.setCliquesDetalhe(metricas.getCliquesDetalhe() + 1);
            case WHATSAPP -> {
                metricas.setCliquesWhatsAppOferta(metricas.getCliquesWhatsAppOferta() + 1);
                oferta.setCliquesContato((oferta.getCliquesContato() != null ? oferta.getCliquesContato() : 0) + 1);
            }
            case EMAIL -> {
                metricas.setCliquesEmailOferta(metricas.getCliquesEmailOferta() + 1);
                oferta.setCliquesContato((oferta.getCliquesContato() != null ? oferta.getCliquesContato() : 0) + 1);
            }
            case COMO_CHEGAR -> {
                metricas.setCliquesComoChegarOferta(metricas.getCliquesComoChegarOferta() + 1);
                oferta.setCliquesContato((oferta.getCliquesContato() != null ? oferta.getCliquesContato() : 0) + 1);
            }
            case FAVORITAR -> metricas.setCliquesFavoritarOferta(metricas.getCliquesFavoritarOferta() + 1);
        }

        metricasOfertasRepository.save(metricas);
        ofertaRepository.save(oferta);
    }

    /**
     * Incrementa o engajamento de uma Empresa.
     */
    @Transactional
    public void registrarEngajamentoEmpresa(Long empresaId, TipoEngajamentoEmpresa tipo) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa não encontrada"));

        LocalDate hoje = LocalDate.now();
        MetricasEmpresas metricas = obterOuCriarMetricasEmpresa(empresa, hoje);

        switch (tipo) {
            case PERFIL -> metricas.setCliquesPerfil(metricas.getCliquesPerfil() + 1);
            case WHATSAPP -> metricas.setCliquesWhatsAppEmpresa(metricas.getCliquesWhatsAppEmpresa() + 1);
            case EMAIL -> metricas.setCliquesEmailEmpresa(metricas.getCliquesEmailEmpresa() + 1);
            case COMO_CHEGAR -> metricas.setCliquesComoChegarEmpresa(metricas.getCliquesComoChegarEmpresa() + 1);
        }

        metricasEmpresasRepository.save(metricas);
    }

    /**
     * Método isolado em uma nova transação para não "sujar" a transação principal
     * caso ocorra a DataIntegrityViolationException (concorrência na criação).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public MetricasOfertas obterOuCriarMetricasOferta(Oferta oferta, LocalDate dia) {
        Optional<MetricasOfertas> metricasOpt = metricasOfertasRepository.findByOfertaAndDia(oferta, dia);
        if (metricasOpt.isPresent()) {
            return metricasOpt.get();
        }

        MetricasOfertas nova = new MetricasOfertas(oferta, dia);
        try {
            return metricasOfertasRepository.saveAndFlush(nova);
        } catch (DataIntegrityViolationException e) {
            // Em caso de concorrência, outra thread já criou a métrica do dia. Buscamos novamente.
            return metricasOfertasRepository.findByOfertaAndDia(oferta, dia)
                    .orElseThrow(() -> new IllegalStateException("Falha ao recuperar métricas após concorrência"));
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public MetricasEmpresas obterOuCriarMetricasEmpresa(Empresa empresa, LocalDate dia) {
        Optional<MetricasEmpresas> metricasOpt = metricasEmpresasRepository.findByEmpresaAndDia(empresa, dia);
        if (metricasOpt.isPresent()) {
            return metricasOpt.get();
        }

        MetricasEmpresas nova = new MetricasEmpresas(empresa, dia);
        try {
            return metricasEmpresasRepository.saveAndFlush(nova);
        } catch (DataIntegrityViolationException e) {
            return metricasEmpresasRepository.findByEmpresaAndDia(empresa, dia)
                    .orElseThrow(() -> new IllegalStateException("Falha ao recuperar métricas após concorrência"));
        }
    }
}
