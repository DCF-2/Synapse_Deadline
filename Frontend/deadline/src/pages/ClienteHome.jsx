import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';
import { obterLocalizacaoConsumidor, formatarDistancia, mensagemErroGeolocalizacao, statusDeErroGeolocalizacao } from '../utils/geolocalizacao';
import { contarFavoritos } from '../utils/favoritos';
import { obterHistoricoBuscas, salvarNovaBusca, removerBuscaDoHistorico, limparHistoricoBuscas } from '../utils/historicoBusca';
import BotaoFavorito from '../components/BotaoFavorito';
import OfertaCard from '../components/OfertaCard';
import OfertaDetalhesModal from '../components/OfertaDetalhesModal';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ClienteHome() {
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [limiteExibicao, setLimiteExibicao] = useState(20);
  
  // Estados para Filtros
  const [termoBusca, setTermoBusca] = useState(() => localStorage.getItem('kai_filtro_termoBusca') || ''); 
  const [nomeProduto, setNomeProduto] = useState(() => localStorage.getItem('kai_filtro_nomeProduto') || '');
  const [historicoBuscas, setHistoricoBuscas] = useState(() => obterHistoricoBuscas());
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [categoriaId, setCategoriaId] = useState(() => localStorage.getItem('kai_filtro_categoriaId') || '');
  const [precoMin, setPrecoMin] = useState(() => localStorage.getItem('kai_filtro_precoMin') || '');
  const [precoMax, setPrecoMax] = useState(() => localStorage.getItem('kai_filtro_precoMax') || '');
  const [diasMaxValidade, setDiasMaxValidade] = useState(() => localStorage.getItem('kai_filtro_diasMaxValidade') || '');
  const [distanciaMaxKm, setDistanciaMaxKm] = useState(() => localStorage.getItem('kai_filtro_distanciaMaxKm') || '100');
  const [lojasEncontradas, setLojasEncontradas] = useState([]);

  // Geolocalização do consumidor
  const [localizacao, setLocalizacao] = useState(null);
  const [statusLocalizacao, setStatusLocalizacao] = useState('pendente'); // pendente | ok | negado | indisponivel | timeout | inseguro
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState('');
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  // Estado de Ordenação
  const [ordenacao, setOrdenacao] = useState(() => localStorage.getItem('kai_filtro_ordenacao') || 'distanciaKm,asc');
  
  // Trigger para buscar com filtros limpos
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Estado do Modal de Detalhes
  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const debounceTimer = useRef(null);
  const [totalFavoritos, setTotalFavoritos] = useState(() => contarFavoritos());

  useEffect(() => {
    const atualizarFavoritos = () => setTotalFavoritos(contarFavoritos());
    const atualizarHistorico = () => setHistoricoBuscas(obterHistoricoBuscas());
    window.addEventListener('favoritos-atualizados', atualizarFavoritos);
    window.addEventListener('historico-busca-atualizado', atualizarHistorico);
    return () => {
      window.removeEventListener('favoritos-atualizados', atualizarFavoritos);
      window.removeEventListener('historico-busca-atualizado', atualizarHistorico);
    };
  }, []);

  // Persistir filtros
  useEffect(() => {
    localStorage.setItem('kai_filtro_termoBusca', termoBusca);
    localStorage.setItem('kai_filtro_nomeProduto', nomeProduto);
    localStorage.setItem('kai_filtro_categoriaId', categoriaId);
    localStorage.setItem('kai_filtro_precoMin', precoMin);
    localStorage.setItem('kai_filtro_precoMax', precoMax);
    localStorage.setItem('kai_filtro_diasMaxValidade', diasMaxValidade);
    localStorage.setItem('kai_filtro_distanciaMaxKm', distanciaMaxKm);
    localStorage.setItem('kai_filtro_ordenacao', ordenacao);
  }, [termoBusca, nomeProduto, categoriaId, precoMin, precoMax, diasMaxValidade, distanciaMaxKm, ordenacao]);

  // Carrega as categorias na inicialização
  useEffect(() => {
    fetch(`${API_URL}/categoria`)
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(console.error);
  }, []);

  const solicitarLocalizacao = useCallback(async () => {
    setBuscandoLocalizacao(true);
    setStatusLocalizacao('pendente');
    setMensagemLocalizacao('');
    try {
      const coords = await obterLocalizacaoConsumidor();
      setLocalizacao(coords);
      setStatusLocalizacao('ok');
    } catch (err) {
      console.warn('Geolocalização:', err);
      setLocalizacao(null);
      setStatusLocalizacao(statusDeErroGeolocalizacao(err));
      setMensagemLocalizacao(mensagemErroGeolocalizacao(err));
    } finally {
      setBuscandoLocalizacao(false);
    }
  }, []);

  // Solicita geolocalização do consumidor ao abrir a vitrine
  useEffect(() => {
    solicitarLocalizacao();
  }, [solicitarLocalizacao]);

  const executarBusca = (termoOpcional) => {
    const termo = (typeof termoOpcional === 'string' ? termoOpcional : termoBusca).trim();
    setTermoBusca(termo);
    setNomeProduto(termo);
    if (termo.length >= 3) {
      salvarNovaBusca(termo);
    }
    setMostrarHistorico(false);
  };

  const aplicarBusca = (e) => {
    e.preventDefault();
    executarBusca();
  };

  const removerItemHistorico = (e, termo) => {
    e.stopPropagation();
    e.preventDefault();
    removerBuscaDoHistorico(termo);
  };

  // Carrega os dados filtrados e ordenados
  const carregarVitrine = async () => {
    setCarregando(true);
    try {
      const url = new URL(`${API_URL}/oferta/publico`);
      
      if (nomeProduto) url.searchParams.append('nomeProduto', nomeProduto);
      if (categoriaId) url.searchParams.append('categoriaId', categoriaId);
      if (precoMin) url.searchParams.append('precoMin', precoMin);
      if (precoMax) url.searchParams.append('precoMax', precoMax);
      if (diasMaxValidade) url.searchParams.append('diasMaxValidade', diasMaxValidade);
      if (distanciaMaxKm && localizacao) url.searchParams.append('distanciaMaxKm', distanciaMaxKm);
      if (localizacao) {
        url.searchParams.append('latitude', localizacao.latitude);
        url.searchParams.append('longitude', localizacao.longitude);
      }

      url.searchParams.append('sort', ordenacao);
      url.searchParams.append('size', '1000'); 

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setOfertas(data.content || []);
      }

      // Busca Lojas pelo Nome (Se tiver 3+ caracteres)
      if (nomeProduto && nomeProduto.length >= 3) {
        const resLojas = await fetch(`${API_URL}/empresa/publico/buscar?nome=${nomeProduto}`);
        if (resLojas.ok) setLojasEncontradas(await resLojas.json());
      } else {
        setLojasEncontradas([]);
      }

    } catch (error) {
      console.error("Erro ao carregar vitrine:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Recarrega sempre que os filtros principais, a busca ativa ou a ordenação mudarem
  useEffect(() => {
    carregarVitrine();
  }, [nomeProduto, categoriaId, diasMaxValidade, distanciaMaxKm, ordenacao, localizacao, triggerFetch, precoMin, precoMax]);

  // Form submission para os filtros de preço/etc
  const aplicarFiltrosAvancados = (e) => {
    e.preventDefault();
    carregarVitrine();
  };

  const limparFiltros = () => {
    setTermoBusca('');
    setNomeProduto('');
    setCategoriaId('');
    setPrecoMin('');
    setPrecoMax('');
    setDiasMaxValidade('');
    setDistanciaMaxKm('100');
    setTriggerFetch(prev => prev + 1);
  };

  // Buscar detalhes ricos do produto ao clicar
  const abrirDetalhes = async (id) => {
    setCarregandoDetalhes(true);
    try {
      const url = new URL(`${API_URL}/oferta/publico/${id}`);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const ofertaListagem = ofertas.find(o => o.id === id);
        if (ofertaListagem && ofertaListagem.distanciaKm != null) {
          data.distanciaKm = ofertaListagem.distanciaKm;
        }
        setDetalhesOferta(data);
      }
    } catch (error) {
      console.error("Erro detalhes:", error);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--dl-background)', minHeight: '100vh' }}>
      
      {/* HEADER PÚBLICO */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-success m-0" to="/">
            <img src="/logo-KaiOfertas-removebg-preview.png" alt="Kai Ofertas Logo" style={{ height: '65px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          </Link>
          <div className="d-flex gap-2 align-items-center">
            <Link to="/favoritos" className="btn btn-warning fw-bold rounded-pill px-3 d-flex align-items-center gap-2" title="Ver favoritos">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.05-.372.602-.372.652 0l1.847 3.65 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
              </svg>
              Favoritos
              {totalFavoritos > 0 && <span className="badge bg-dark rounded-pill">{totalFavoritos}</span>}
            </Link>
            <Link to="/auth" className="btn btn-outline-success fw-bold rounded-pill px-4">Entrar / Sou Empresa</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-success text-white py-5 text-center" style={{ background: 'linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-secondary) 100%)' }}>
        <div className="container py-4">
          <h1 className="fw-bold display-5 mb-3">Salve produtos, economize muito!</h1>
          <p className="lead opacity-90 mb-0">Encontre ofertas imperdíveis de produtos próximos da validade em farmácias perto de você.</p>
        </div>
      </div>

      <div className="container py-5">
        {statusLocalizacao === 'negado' && (
          <div className="alert alert-warning rounded-4 mb-4 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <span><img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {mensagemLocalizacao || 'Ative a localização do navegador para ver distâncias e filtrar ofertas por proximidade.'}</span>
            <button type="button" className="btn btn-sm btn-outline-dark rounded-pill" onClick={solicitarLocalizacao} disabled={buscandoLocalizacao}>
              {buscandoLocalizacao ? 'Aguardando...' : 'Tentar novamente'}
            </button>
          </div>
        )}
        {(statusLocalizacao === 'indisponivel' || statusLocalizacao === 'timeout' || statusLocalizacao === 'inseguro') && (
          <div className="alert alert-secondary rounded-4 mb-4 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <span><img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {mensagemLocalizacao || 'Não foi possível obter sua localização. As distâncias não serão exibidas.'}</span>
            <button type="button" className="btn btn-sm btn-success rounded-pill" onClick={solicitarLocalizacao} disabled={buscandoLocalizacao}>
              {buscandoLocalizacao ? 'Buscando...' : 'Tentar novamente'}
            </button>
          </div>
        )}
        {statusLocalizacao === 'pendente' && buscandoLocalizacao && (
          <div className="alert alert-light border rounded-4 mb-4 d-flex align-items-center gap-2">
            <span><img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
            <span>Obtendo sua localização...</span>
          </div>
        )}

        <div className="row g-4">
          
          {/* SIDEBAR DE FILTROS */}
          <div className="col-lg-3">
            <div className="bg-white p-3 rounded-4 shadow-sm position-sticky" style={{ top: '100px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h6 className="fw-bold text-dark m-0"><img src="/icons/filtro.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Filtros Avançados</h6>
                <button 
                  className="btn btn-sm btn-outline-secondary d-lg-none" 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('filtrosCollapse');
                    if (el.classList.contains('d-none')) {
                      el.classList.remove('d-none');
                    } else {
                      el.classList.add('d-none');
                    }
                  }}
                >
                  🔽
                </button>
              </div>
              
              <div className="d-none d-lg-block" id="filtrosCollapse">
                <form onSubmit={aplicarFiltrosAvancados}>
                  <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">Categoria</label>
                  <select className="form-select form-select-sm bg-light border-0" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                    <option value="">Todas</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">Vence em até:</label>
                  <select className="form-select form-select-sm bg-light border-0" value={diasMaxValidade} onChange={(e) => setDiasMaxValidade(e.target.value)}>
                    <option value="">Qualquer data</option>
                    <option value="7">Próximos 7 dias</option>
                    <option value="15">Próximos 15 dias</option>
                    <option value="30">Próximos 30 dias</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">Distância máxima</label>
                  <select
                    className="form-select form-select-sm bg-light border-0"
                    value={distanciaMaxKm}
                    onChange={(e) => setDistanciaMaxKm(e.target.value)}
                    disabled={!localizacao || buscandoLocalizacao}
                  >
                    <option value="">Qualquer distância</option>
                    <option value="5">Até 5 km</option>
                    <option value="10">Até 10 km</option>
                    <option value="25">Até 25 km</option>
                    <option value="50">Até 50 km</option>
                    <option value="100">Até 100 km</option>
                  </select>
                  {!localizacao && (
                    <small className="text-muted d-block mt-1">
                      {buscandoLocalizacao ? 'Obtendo...' : 'Aguardando...'}
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">Faixa de Preço (R$)</label>
                  <div className="d-flex gap-2">
                    <input type="number" placeholder="Min" className="form-control form-control-sm bg-light border-0 text-center" 
                           value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />
                    <span className="mt-1 text-muted">-</span>
                    <input type="number" placeholder="Max" className="form-control form-control-sm bg-light border-0 text-center" 
                           value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 mt-3">
                  <button type="submit" className="btn btn-sm text-white w-100 fw-bold rounded-3" style={{backgroundColor: 'var(--dl-primary)'}}>
                    Aplicar Filtros
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary w-100 fw-bold rounded-3" onClick={limparFiltros}>
                    Limpar Filtros
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>

          {/* ÁREA DE PRODUTOS */}
          <div className="col-lg-9">

            {/* BARRA DE PESQUISA SUPERIOR */}
            <form onSubmit={aplicarBusca} className="mb-4 d-flex gap-2">
              <div className="position-relative flex-grow-1">
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  placeholder="Buscar produtos, lojas ou categorias..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  onFocus={() => setMostrarHistorico(true)}
                  onBlur={() => setTimeout(() => setMostrarHistorico(false), 200)}
                />

                {mostrarHistorico && historicoBuscas.length > 0 && (
                  <div
                    className="position-absolute bg-white rounded-bottom shadow border w-100"
                    style={{ top: '100%', left: 0, zIndex: 10, maxHeight: '280px', overflowY: 'auto' }}
                  >
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
                      <small className="text-muted fw-bold">Buscas recentes</small>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-muted p-0"
                        onMouseDown={(e) => { e.preventDefault(); limparHistoricoBuscas(); }}
                      >
                        Limpar
                      </button>
                    </div>
                    {historicoBuscas.map((busca) => (
                      <div
                        key={busca}
                        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                        style={{ cursor: 'pointer' }}
                        onMouseDown={(e) => { e.preventDefault(); executarBusca(busca); }}
                      >
                        <div className="d-flex align-items-center gap-2 text-truncate">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="text-muted flex-shrink-0" viewBox="0 0 16 16">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                          </svg>
                          <span className="text-dark text-truncate">{busca}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-muted p-0 ms-2 flex-shrink-0"
                          title="Remover do histórico"
                          onMouseDown={(e) => removerItemHistorico(e, busca)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="btn text-white px-4 shadow-sm fw-bold d-flex align-items-center gap-2" style={{backgroundColor: 'var(--dl-primary)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
                <span className="d-none d-md-inline">Pesquisar</span>
              </button>
            </form>

            {/* CARDS DE LOJAS ENCONTRADAS (Estilo Mercado Livre) */}
            {lojasEncontradas.length > 0 && (
              <div className="mb-4">
                {lojasEncontradas.map(loja => (
                  <div key={loja.id} className="bg-white rounded-4 shadow-sm p-4 mb-3 border border-light d-flex flex-column flex-md-row align-items-center justify-content-between gap-3" style={{ borderLeft: '4px solid #0d6efd !important' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden border" style={{ width: '70px', height: '70px' }}>
                        {loja.logotipo ? (
                          <img src={loja.logotipo} alt={loja.nomeFantasia} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : ( <span className="fw-bold text-success fs-3"><img src="/icons/companhia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> )}
                      </div>
                      <div>
                        <span className="text-muted fw-medium d-block mb-1" style={{fontSize: '0.9rem'}}>Você quer ir para a loja da {loja.nomeFantasia}?</span>
                        <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-1">
                          {loja.nomeFantasia} 
                          <span className="text-primary d-flex align-items-center justify-content-center" style={{fontSize: '0.8rem', width: '16px', height: '16px', backgroundColor: '#e7f1ff', borderRadius: '50%'}}><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                        </h5>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3 w-100 w-md-auto mt-3 mt-md-0">
                       <div className="d-none d-md-block text-end me-3 border-end pe-4">
                          <small className="text-muted d-block fw-bold">Loja Oficial Parceira</small>
                          <span className="fw-bold text-success small">Ofertas Ativas na Plataforma</span>
                       </div>
                       <Link to={`/loja/${loja.id}`} className="btn text-white fw-bold px-4 py-2 rounded-3 w-100 w-md-auto shadow-sm" style={{ backgroundColor: '#0d6efd' }}>
                         Ir para a loja
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* BARRA DE ORDENAÇÃO */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
              <span className="text-muted fw-bold mb-2 mb-md-0">{ofertas.length} ofertas encontradas</span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap">Ordenar por:</span>
                <select className="form-select form-select-sm bg-light border-0 fw-bold" style={{ width: '220px' }}
                        value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                  {localizacao && <option value="distanciaKm,asc">Mais Próximo</option>}
                  <option value="validadeProduto,asc">Vence Mais Cedo</option>
                  <option value="precoPromocional,asc">Menor Preço</option>
                  <option value="percentualDesconto,desc">Maior Desconto (%)</option>
                  <option value="id,desc">Mais Recentes</option>
                </select>
              </div>
            </div>

            {/* GRID DE PRODUTOS */}
            {carregando ? (
               <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : ofertas.length === 0 ? (
               <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                 <span style={{fontSize: '4rem'}}></span>
                 <h5 className="fw-bold mt-3 text-dark">Nenhuma oferta encontrada.</h5>
                 <p className="text-muted">Tente ajustar os seus filtros de busca.</p>
               </div>
            ) : (
              <div>
                <div className="row g-4">
                  {ofertas.slice(0, limiteExibicao).map((oferta) => (
                    <div className="col-12 col-md-6 col-xl-4" key={oferta.id}>
                      <OfertaCard 
                        oferta={oferta} 
                        onClickCard={abrirDetalhes} 
                        esconderLoja={false} 
                      />
                    </div>
                  ))}
                </div>
                {ofertas.length > limiteExibicao && (
                  <div className="text-center mt-5 mb-3">
                    <button 
                      className="btn fw-bold rounded-pill px-5 py-2 shadow-sm text-white"
                      style={{ backgroundColor: 'var(--dl-primary, #0f9b58)' }}
                      onClick={() => setLimiteExibicao(prev => prev + 20)}
                    >
                      Ver Mais
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHES DA OFERTA */}
      <OfertaDetalhesModal 
        detalhesOferta={detalhesOferta} 
        onClose={() => setDetalhesOferta(null)} 
      />

      <Footer />
    </div>
  );
}