package com.synapse.deadline.service;

import com.synapse.deadline.dto.OfertaFiltroDTO;
import com.synapse.deadline.dto.OfertaRequestDTO;
import com.synapse.deadline.dto.OfertaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.Oferta;
import com.synapse.deadline.entity.Produto;
import com.synapse.deadline.repository.OfertaRepository;
import com.synapse.deadline.repository.OfertaSpecifications;
import com.synapse.deadline.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;



@Service
public class OfertaService {

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private GoogleMapsDistanceService googleMapsDistanceService;

    @Transactional
    public OfertaResponseDTO criarOferta(OfertaRequestDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Produto produto = produtoRepository.findByIdAndEmpresaId(dto.getProdutoId(), empresaLogada.getId())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado ou acesso negado"));

        Oferta oferta = new Oferta();
        oferta.setProduto(produto);
        oferta.setValidadeProduto(dto.getValidadeProduto());
        oferta.setDataFimOferta(dto.getDataFimOferta());
        oferta.setPrecoPromocional(dto.getPrecoPromocional());
        oferta.setPercentualDesconto(dto.getPercentualDesconto());
        oferta.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        Oferta salvo = ofertaRepository.save(oferta);
        return converterParaResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasDaEmpresa(Pageable pageable) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ofertaRepository.findByProdutoEmpresaId(empresaLogada.getId(), pageable)
                .map(this::converterParaResponseDTO);
    }

    private OfertaResponseDTO converterParaResponseDTO(Oferta oferta) {
        OfertaResponseDTO dto = new OfertaResponseDTO();
        dto.setId(oferta.getId());
        dto.setProdutoId(oferta.getProduto().getId());
        dto.setTituloProduto(oferta.getProduto().getTituloProduto());

        if (oferta.getProduto().getCategoria() != null) {
            dto.setNomeCategoria(oferta.getProduto().getCategoria().getNome());
        } else {
            dto.setNomeCategoria("Sem Categoria");
        }

        Empresa empresa = oferta.getProduto().getEmpresa();
        dto.setNomeFantasiaEmpresa(empresa.getNomeFantasia());
        dto.setCnpjEmpresa(empresa.getCnpj());

        dto.setPrecoOriginal(oferta.getProduto().getPrecoOriginal());
        dto.setFoto(oferta.getProduto().getFoto());
        dto.setPrecoPromocional(oferta.getPrecoPromocional());
        dto.setPercentualDesconto(oferta.getPercentualDesconto());
        dto.setValidadeProduto(oferta.getValidadeProduto());
        dto.setDataFimOferta(oferta.getDataFimOferta());
        dto.setAtivo(oferta.getAtivo());

        return dto;
    }

    private void enrichirComDistanciasRodoviarias(
            List<Oferta> ofertas, List<OfertaResponseDTO> dtos, double latConsumidor, double lngConsumidor) {
        if (ofertas.isEmpty()) {
            return;
        }

        List<GoogleMapsDistanceService.Ponto> destinos = ofertas.stream()
                .map(o -> o.getProduto().getEmpresa())
                .filter(e -> e.getLatitude() != null && e.getLongitude() != null)
                .map(e -> new GoogleMapsDistanceService.Ponto(e.getLatitude(), e.getLongitude()))
                .distinct()
                .toList();

        Map<String, Double> distancias = googleMapsDistanceService.calcularDistanciasRodoviariasKm(
                latConsumidor, lngConsumidor, destinos);

        for (int i = 0; i < ofertas.size(); i++) {
            Empresa empresa = ofertas.get(i).getProduto().getEmpresa();
            if (empresa.getLatitude() != null && empresa.getLongitude() != null) {
                String chave = GoogleMapsDistanceService.chaveCoordenada(
                        empresa.getLatitude(), empresa.getLongitude());
                Double distancia = distancias.get(chave);
                if (distancia != null) {
                    dtos.get(i).setDistanciaKm(distancia);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasPublicas(Pageable pageable) {
        return ofertaRepository.findOfertasAtivas(pageable)
                .map(this::converterParaResponseDTO);
    }

    @Transactional
    public OfertaResponseDTO atualizarOferta(Long idOferta, OfertaRequestDTO dto) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado: Você não tem permissão para alterar esta oferta.");
        }

        oferta.setValidadeProduto(dto.getValidadeProduto());
        oferta.setDataFimOferta(dto.getDataFimOferta());
        oferta.setPrecoPromocional(dto.getPrecoPromocional());
        oferta.setPercentualDesconto(dto.getPercentualDesconto());

        if (dto.getAtivo() != null) {
            oferta.setAtivo(dto.getAtivo());
        }

        Oferta salvo = ofertaRepository.save(oferta);
        return converterParaResponseDTO(salvo);
    }

    @Transactional
    public void removerOferta(Long idOferta) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado: Você não pode remover esta oferta.");
        }

        ofertaRepository.delete(oferta);
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasDaEmpresa(OfertaFiltroDTO filtro, Pageable pageable) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return ofertaRepository.findAll(OfertaSpecifications.comFiltros(filtro, empresaLogada.getId()), pageable)
                .map(this::converterParaResponseDTO);
    }


    @Transactional
    public void alternarStatus(Long idOferta, Boolean novoStatus) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado.");
        }
        oferta.setAtivo(novoStatus);
        ofertaRepository.save(oferta);
    }

    @Transactional(readOnly = true)
    public OfertaResponseDTO buscarPorId(Long idOferta) {
        Empresa empresaLogada = (Empresa) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new IllegalArgumentException("Oferta não encontrada."));

        if (!oferta.getProduto().getEmpresa().getId().equals(empresaLogada.getId())) {
            throw new SecurityException("Acesso negado: Você não tem permissão para visualizar esta oferta.");
        }

        return converterParaResponseDTO(oferta);
    }

    @Transactional(readOnly = true)
    public Page<OfertaResponseDTO> listarOfertasPublicas(com.synapse.deadline.dto.FiltroOfertasConsumidorDTO filtro, Pageable pageable) {
        Double lat = filtro != null ? filtro.getLatitude() : null;
        Double lng = filtro != null ? filtro.getLongitude() : null;
        boolean geoAtivo = lat != null && lng != null;
        boolean filtrarDistancia = geoAtivo && filtro.getDistanciaMaxKm() != null;
        boolean ordenarPorDistancia = geoAtivo && pageable.getSort().stream()
                .anyMatch(o -> "distanciaKm".equals(o.getProperty()));

        if (geoAtivo && (filtrarDistancia || ordenarPorDistancia)) {
            List<Oferta> ofertas = ofertaRepository
                    .findAll(OfertaSpecifications.filtroVitrinePublica(filtro));
            List<OfertaResponseDTO> dtos = ofertas.stream()
                    .map(this::converterParaResponseDTO)
                    .collect(Collectors.toCollection(ArrayList::new));
            enrichirComDistanciasRodoviarias(ofertas, dtos, lat, lng);

            List<OfertaResponseDTO> filtrados = dtos.stream()
                    .filter(d -> !filtrarDistancia || (d.getDistanciaKm() != null && d.getDistanciaKm() <= filtro.getDistanciaMaxKm()))
                    .sorted(criarComparator(pageable.getSort()))
                    .collect(Collectors.toList());

            return paginarLista(filtrados, pageable);
        }

        Page<Oferta> paginaOfertas = ofertaRepository
                .findAll(OfertaSpecifications.filtroVitrinePublica(filtro), pageable);
        List<Oferta> ofertas = paginaOfertas.getContent();
        List<OfertaResponseDTO> dtos = ofertas.stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toCollection(ArrayList::new));

        if (geoAtivo) {
            enrichirComDistanciasRodoviarias(ofertas, dtos, lat, lng);
        }

        return new PageImpl<>(dtos, pageable, paginaOfertas.getTotalElements());
    }

    private Comparator<OfertaResponseDTO> criarComparator(Sort sort) {
        Comparator<OfertaResponseDTO> comparator = null;

        for (Sort.Order order : sort) {
            Comparator<OfertaResponseDTO> atual = switch (order.getProperty()) {
                case "distanciaKm" -> Comparator.comparing(
                        OfertaResponseDTO::getDistanciaKm,
                        Comparator.nullsLast(Double::compareTo));
                case "precoPromocional" -> Comparator.comparing(OfertaResponseDTO::getPrecoPromocional);
                case "percentualDesconto" -> Comparator.comparing(OfertaResponseDTO::getPercentualDesconto);
                case "validadeProduto" -> Comparator.comparing(OfertaResponseDTO::getValidadeProduto);
                default -> Comparator.comparing(OfertaResponseDTO::getId);
            };

            if (order.isDescending()) {
                atual = atual.reversed();
            }

            comparator = comparator == null ? atual : comparator.thenComparing(atual);
        }

        return comparator != null ? comparator : Comparator.comparing(OfertaResponseDTO::getId);
    }

    private Page<OfertaResponseDTO> paginarLista(List<OfertaResponseDTO> lista, Pageable pageable) {
        int inicio = (int) pageable.getOffset();
        int fim = Math.min(inicio + pageable.getPageSize(), lista.size());

        if (inicio > lista.size()) {
            return new PageImpl<>(List.of(), pageable, lista.size());
        }

        return new PageImpl<>(lista.subList(inicio, fim), pageable, lista.size());
    }

    @Transactional
    public void registrarCliqueContato(Long idOferta) {
        Oferta oferta = ofertaRepository.findById(idOferta).orElseThrow();
        oferta.setCliquesContato(oferta.getCliquesContato() + 1);
        ofertaRepository.save(oferta);
    }

    @Transactional(readOnly = true)
    public com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO buscarDetalhesPublicos(Long id) {
        return buscarDetalhesPublicos(id, null, null);
    }

    @Transactional(readOnly = true)
    public com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO buscarDetalhesPublicos(Long id, Double latitude, Double longitude) {
        Oferta oferta = ofertaRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Oferta não encontrada."));

        if (!oferta.getAtivo() || !oferta.getProduto().getAtivo() || oferta.getDataFimOferta().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Esta oferta já não está disponível.");
        }

        com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO dto = new com.synapse.deadline.dto.OfertaConsumidorDetalhesDTO();
        dto.setId(oferta.getId());
        dto.setTituloProduto(oferta.getProduto().getTituloProduto());
        dto.setDescricao(oferta.getProduto().getDescricao());
        dto.setFoto(oferta.getProduto().getFoto());
        dto.setPrecoOriginal(oferta.getProduto().getPrecoOriginal());
        dto.setPrecoPromocional(oferta.getPrecoPromocional());
        dto.setPercentualDesconto(oferta.getPercentualDesconto());
        dto.setValidadeProduto(oferta.getValidadeProduto());
        dto.setDataFimOferta(oferta.getDataFimOferta());

        Empresa empresa = oferta.getProduto().getEmpresa();
        dto.setNomeFantasiaEmpresa(empresa.getNomeFantasia());
        dto.setLogotipoEmpresa(empresa.getLogotipo());
        dto.setInstrucoesRetirada(empresa.getInstrucoesRetirada());
        dto.setHorarioFuncionamento(empresa.getHorarioFuncionamento());
        dto.setEmpresaId(empresa.getId());
        dto.setContatoWhatsapp(empresa.getContatoWhatsapp());
        dto.setEmailContato(empresa.getEmailContato());

        if (latitude != null && longitude != null
                && empresa.getLatitude() != null && empresa.getLongitude() != null) {
            googleMapsDistanceService
                    .calcularDistanciaRodoviariaKm(
                            latitude, longitude, empresa.getLatitude(), empresa.getLongitude())
                    .ifPresent(dto::setDistanciaKm);
        }

        if (empresa.getEndereco() != null) {
            com.synapse.deadline.dto.EnderecoDTO endDto = new com.synapse.deadline.dto.EnderecoDTO();
            endDto.setLogradouro(empresa.getEndereco().getLogradouro());
            endDto.setNumero(empresa.getEndereco().getNumero());
            endDto.setComplemento(empresa.getEndereco().getComplemento());
            endDto.setBairro(empresa.getEndereco().getBairro());
            endDto.setCidade(empresa.getEndereco().getCidade());
            endDto.setUf(empresa.getEndereco().getUf());
            endDto.setCep(empresa.getEndereco().getCep());
            dto.setEnderecoEmpresa(endDto);
        }

        return dto;
    }
}
