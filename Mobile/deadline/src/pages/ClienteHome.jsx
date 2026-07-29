import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Componentes Oficiais do Ionic para o projeto mobile
import { IonPage, IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonRefresher, IonRefresherContent } from '@ionic/react';
import OfertaCard from '../components/OfertaCard';
import OfertaDetalhesModal from '../components/OfertaDetalhesModal';
import '../styles/theme.css';

// Plugin Nativo do Capacitor para permissões e coordenadas de GPS no Celular
import { Geolocation } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
import { 
  obterFavoritos, 
  alternarFavorito, 
  isFavorito, 
  obterHistoricoBuscas, 
  salvarNovaBusca, 
  limparHistoricoBuscas, 
  removerBuscaDoHistorico,
  obterLocalizacaoConsumidor
} from '../utils/storage_mobile';

const API_URL = import.meta.env.VITE_API_URL;


const formatarDistancia = (dist) => {
  if (dist == null) return '';
  return dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`;
};
/* ========================================================================== */

export default function ClienteHome() {
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [limiteExibicao, setLimiteExibicao] = useState(20);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados para a Barra de Busca (Externa)
  const [termoBusca, setTermoBusca] = useState(() => localStorage.getItem('kai_filtro_termoBusca_mobile') || '');
  const [nomeProduto, setNomeProduto] = useState(() => localStorage.getItem('kai_filtro_nomeProduto_mobile') || '');
  const [historicoBuscas, setHistoricoBuscas] = useState(obterHistoricoBuscas());
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [favoritosIds, setFavoritosIds] = useState(obterFavoritos());

  // Estados para os Filtros (Internos ao Modal)
  const [categoriaId, setCategoriaId] = useState(() => localStorage.getItem('kai_filtro_categoriaId_mobile') || '');
  const [precoMin, setPrecoMin] = useState(() => localStorage.getItem('kai_filtro_precoMin_mobile') || '');
  const [precoMax, setPrecoMax] = useState(() => localStorage.getItem('kai_filtro_precoMax_mobile') || '');
  const [diasMaxValidade, setDiasMaxValidade] = useState(() => localStorage.getItem('kai_filtro_diasMaxValidade_mobile') || '');
  const [distanciaMaxKm, setDistanciaMaxKm] = useState(() => localStorage.getItem('kai_filtro_distanciaMaxKm_mobile') || '100');
  const [lojasEncontradas, setLojasEncontradas] = useState([]);

  const [localizacao, setLocalizacao] = useState(null);
  const [statusLocalizacao, setStatusLocalizacao] = useState('pendente');

  const [ordenacao, setOrdenacao] = useState(() => localStorage.getItem('kai_filtro_ordenacao_mobile') || 'distanciaKm,asc');

  // Persistir filtros
  useEffect(() => {
    localStorage.setItem('kai_filtro_termoBusca_mobile', termoBusca);
    localStorage.setItem('kai_filtro_nomeProduto_mobile', nomeProduto);
    localStorage.setItem('kai_filtro_categoriaId_mobile', categoriaId);
    localStorage.setItem('kai_filtro_precoMin_mobile', precoMin);
    localStorage.setItem('kai_filtro_precoMax_mobile', precoMax);
    localStorage.setItem('kai_filtro_diasMaxValidade_mobile', diasMaxValidade);
    localStorage.setItem('kai_filtro_distanciaMaxKm_mobile', distanciaMaxKm);
    localStorage.setItem('kai_filtro_ordenacao_mobile', ordenacao);
  }, [termoBusca, nomeProduto, categoriaId, precoMin, precoMax, diasMaxValidade, distanciaMaxKm, ordenacao]);

  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const debounceTimer = useRef(null);



  useEffect(() => {
    fetch(`${API_URL}/categoria`)
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error("Erro ao carregar categorias:", err));
      
    // Carregar histórico de buscas e favoritos
    setHistoricoBuscas(obterHistoricoBuscas());
    setFavoritosIds(obterFavoritos());
  }, []);

  useEffect(() => {
    obterLocalizacaoConsumidor()
      .then((coords) => {
        if (coords) {
          setLocalizacao(coords);
          setStatusLocalizacao('ok');
        } else {
          setStatusLocalizacao('indisponivel');
        }
      })
      .catch((err) => {
        console.error(err);
        setStatusLocalizacao('indisponivel');
      });
  }, []);

  const handleBuscar = (termoOpcional) => {
    const termo = (typeof termoOpcional === 'string' ? termoOpcional : termoBusca).trim();
    setTermoBusca(termo);
    setNomeProduto(termo);
    if (termo.length >= 3) {
      salvarNovaBusca(termo);
      setHistoricoBuscas(obterHistoricoBuscas());
    }
    setMostrarHistorico(false);
  };

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
      url.searchParams.append('size', '50');

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setOfertas(data.content || []);
      }

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

  useEffect(() => {
    carregarVitrine();
  }, [nomeProduto, categoriaId, diasMaxValidade, distanciaMaxKm, ordenacao, localizacao, precoMin, precoMax]);

  const handleRefresh = async (event) => {
    await carregarVitrine();
    event.detail.complete();
  };

  // Função para Limpar todos os filtros do Modal
  const limparFiltros = () => {
    setCategoriaId('');
    setDiasMaxValidade('');
    setDistanciaMaxKm('100');
    setPrecoMin('');
    setPrecoMax('');
  };

  // Função para tratar o botão de "Aplicar" do Modal
  const fecharModalFiltros = (e) => {
    e.preventDefault();
    setMostrarFiltros(false);
  };

  const abrirDetalhes = async (id) => {
    const ofertaPrevia = ofertas.find(o => o.id === id);
    if (ofertaPrevia) setDetalhesOferta(ofertaPrevia);
    
    setCarregandoDetalhes(true);
    try {
      const url = new URL(`${API_URL}/oferta/publico/${id}`);
      if (localizacao) {
        url.searchParams.append('latitude', localizacao.latitude);
        url.searchParams.append('longitude', localizacao.longitude);
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setDetalhesOferta(data);
      }
    } catch (error) {
      console.error("Erro detalhes:", error);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const handleToggleFavorito = (ofertaId, e) => {
    e.stopPropagation();
    alternarFavorito(ofertaId);
    setFavoritosIds(obterFavoritos());
  };

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon="lines" refreshingSpinner="circles" />
        </IonRefresher>

        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '80px' }}>

          <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container px-3 d-flex justify-content-center align-items-center">
              <Link className="navbar-brand d-flex align-items-center gap-2 m-0 fw-bold fs-4 text-success" to="/">
                <img src="/logo_deadline.png" alt="Kai Ofertas Logo" style={{ height: '45px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                Kai Ofertas
              </Link>
            </div>
          </nav>

          <div className="text-white py-4 text-center" style={{ background: 'linear-gradient(135deg, var(--dl-primary, #0f9b58) 0%, var(--dl-secondary, #00a88c) 100%)' }}>
            <div className="container px-3 py-1">
              <h2 className="fw-bold mb-1 fs-4 text-white">Salve produtos, economize muito!</h2>
              <p className="small opacity-90 mb-0 text-white">Ofertas imperdíveis perto do vencimento em farmácias próximas.</p>
            </div>
          </div>



          <div className="bg-white border-bottom shadow-xs py-2 mb-2">
            <div className="container px-3 d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center gap-2 overflow-auto flex-grow-1"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  paddingRight: '1rem'
                }}
              >
                {[
                  ...(localizacao ? [{ value: 'distanciaKm,asc', label: 'Mais Próximo', icon: '/icons/proximo.png' }] : []),
                  { value: 'validadeProduto,asc', label: 'Vence Cedo', icon: '/icons/data-limite.png' },
                  { value: 'precoPromocional,asc', label: 'Menor Preço', icon: '/icons/menor-preco.png' },
                  { value: 'percentualDesconto,desc', label: 'Maior Desct.', icon: '/icons/maior-desct.png' },
                  { value: 'id,desc', label: 'Mais Recentes', icon: '/icons/recente.png' }
                ].map((opcao) => {
                  const statusAtivo = ordenacao === opcao.value;
                  return (
                    <button
                      key={opcao.value}
                      onClick={() => setOrdenacao(opcao.value)}
                      className={`btn btn-sm rounded-pill px-4 py-2 fw-bold text-nowrap transition-all ${statusAtivo ? 'btn-success text-white shadow-sm' : 'btn-light text-muted border-0'
                        }`}
                      style={{
                        fontSize: '0.8rem',
                        ...(statusAtivo ? { backgroundColor: 'var(--dl-primary, #9bf4c9)', borderColor: 'var(--dl-primary, #9bf4c9)' } : {})
                      }}
                    >
                      <img src={opcao.icon} alt="icon" style={{ width: "14px", height: "14px", objectFit: "contain", marginRight: "4px" }} />
                      {opcao.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 2px' }}></div>
              <button
                className="btn btn-sm rounded-pill px-3 py-2 fw-bold text-nowrap transition-all btn-light text-muted border-0 shadow-sm flex-shrink-0"
                style={{ fontSize: '0.8rem', backgroundColor: '#f8fafc', borderColor: '#d0dae6' }}
                onClick={() => setMostrarFiltros(true)}
              >
                <span className="me-1" style={{ display: 'inline-flex', alignItems: 'center' }}><img src="/icons/filtro.png" alt="icon" style={{ width: "14px", height: "14px", objectFit: "contain", opacity: 0.6 }} /></span> Filtros
              </button>
            </div>
          </div>

          <div className="container py-1">
            {statusLocalizacao === 'indisponivel' && (
              <div className="alert alert-warning rounded-4 mb-3 d-flex align-items-center gap-2 small py-2 mx-2">
                <span>📍</span> Ative o GPS para ver a distância até a farmácia.
              </div>
            )}

            <div className="row g-3 px-2">
              <div className="col-12">

                {lojasEncontradas.length > 0 && (
                  <div className="mb-3">
                    {lojasEncontradas.map(loja => (
                      <div key={loja.id} className="bg-white rounded-4 shadow-sm p-3 mb-2 border border-light d-flex align-items-center justify-content-between gap-2" style={{ borderLeft: '4px solid #0d6efd' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden border" style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                            {loja.logotipo ? (
                              <img src={loja.logotipo} alt={loja.nomeFantasia} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = '/icons/companhia.png'; }} />
                            ) : (<span className="fs-5">🏢</span>)}
                          </div>
                          <div>
                            <h6 className="fw-bold text-dark m-0 small d-flex align-items-center gap-1">
                              {loja.nomeFantasia} <span className="text-primary" style={{ fontSize: '0.75rem' }}>✓</span>
                            </h6>
                            <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Farmácia Oficial Parceira</small>
                          </div>
                        </div>
                        <Link to={`/loja/${loja.id}`} className="btn btn-sm text-white fw-bold px-3 py-2 rounded-3 shadow-sm" style={{ backgroundColor: '#0d6efd', fontSize: '0.8rem' }}>
                          Ver Loja
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex align-items-center gap-2 mb-3 bg-white p-2 px-3 rounded-4 shadow-sm w-100 flex-nowrap">

                  <div className="position-relative flex-grow-1" style={{ minWidth: '200px' }}>

                    {/* Ícone de Lupa elegante no início */}
                    <span
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 d-flex align-items-center"
                      style={{ pointerEvents: 'none', opacity: 0.5 }}
                    >
                      <img src="/icons/lupa.png" alt="buscar" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                    </span>

                    <input
                      type="text"
                      className="form-control text-dark w-100"
                      placeholder="Buscar..."
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      style={{
                        fontSize: '0.85rem',
                        paddingLeft: '2.6rem',  // Espaço para a lupa não cobrir o texto
                        paddingRight: '2.6rem', // Espaço para o "✕" não cobrir o texto
                        paddingTop: '0.65rem',
                        paddingBottom: '0.65rem',
                        borderRadius: '14px',
                        border: '1px solid #d0dae6', // Dá o contraste necessário na tela branca
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      // Efeito de Foco (Acende a borda ao clicar)
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--dl-primary, #0f9b58)';
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(15, 155, 88, 0.12)';
                        setMostrarHistorico(true);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                        setTimeout(() => setMostrarHistorico(false), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBuscar();
                      }}
                    />

                    {/* Botão de Limpar */}
                    {termoBusca && (
                      <button
                        className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent py-1 px-2 d-flex align-items-center justify-content-center"
                        onClick={() => { setTermoBusca(''); setNomeProduto(''); }}
                        style={{ fontSize: '0.75rem', zIndex: 5, opacity: 0.6, right: '10px' }}
                      >
                        ✕
                      </button>
                    )}

                    {mostrarHistorico && historicoBuscas.length > 0 && (
                      <div className="position-absolute bg-white rounded-bottom shadow-sm border w-100" style={{ top: '100%', left: 0, zIndex: 10, marginTop: '0', overflowY: 'auto', maxHeight: '250px', borderTop: 'none', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px' }}>
                        {historicoBuscas.map((busca, idx) => (
                          <div key={idx} className="d-flex align-items-center px-3 py-3 border-bottom" style={{ cursor: 'pointer' }} onMouseDown={(e) => { e.preventDefault(); handleBuscar(busca); }}>
                            <span style={{ opacity: 0.3, fontSize: '1rem', marginRight: '12px' }}>🕒</span>
                            <span className="text-dark fw-medium" style={{ fontSize: '0.9rem' }}>{busca}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center text-nowrap">
                    <button
                      className="btn btn-sm text-white fw-bold d-flex align-items-center justify-content-center rounded-4 shadow-sm px-4 py-2 text-nowrap"
                      style={{ backgroundColor: 'var(--dl-primary, #0f9b58)', fontSize: '0.85rem', border: 'none', height: '100%' }}
                      onClick={handleBuscar}
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-center align-items-center gap-2 px-2 mb-2">
                  <span className="text-muted fw-bold small">
                    {ofertas.length} {ofertas.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
                  </span>
                </div>


                {carregando ? (
                  <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                ) : ofertas.length === 0 ? (
                  <div className="text-center py-5 bg-white rounded-4 shadow-sm mx-2">
                    <span style={{ fontSize: '3rem' }}>😕</span>
                    <h6 className="fw-bold mt-2 text-dark">Nenhuma oferta encontrada.</h6>
                    <p className="text-muted small">Tente alterar os filtros ou categoria acima.</p>
                  </div>
                ) : (
                  <div>
                    <div className="row g-2">
                      {ofertas.slice(0, limiteExibicao).map((oferta) => (
                        <div className="col-6 col-md-4 col-xl-3" key={oferta.id}>
                          <OfertaCard 
                            oferta={oferta} 
                            favoritosIds={favoritosIds} 
                            handleToggleFavorito={handleToggleFavorito} 
                            abrirDetalhes={abrirDetalhes} 
                          />
                        </div>
                      ))}
                    </div>
                    {ofertas.length > limiteExibicao && (
                      <div className="text-center mt-4 mb-3">
                        <button 
                          className="btn fw-bold rounded-pill px-5 py-2 shadow-sm"
                          style={{ backgroundColor: 'var(--dl-primary, #0f9b58)', color: 'white', border: 'none' }}
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

          {/* MENU RETRÁTIL DE FILTROS ADICIONAIS (SEM BUSCA TEXTUAL) */}
          <IonModal isOpen={mostrarFiltros} onDidDismiss={() => setMostrarFiltros(false)}>
            <IonHeader>
              <IonToolbar>
                <IonTitle style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/icons/filtro.png" alt="icon" style={{ width: "16px", height: "16px", objectFit: "contain" }} /> Filtrar Ofertas
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setMostrarFiltros(false)} color="dark">Fechar</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <div className="p-4" style={{ backgroundColor: '#fff', height: '100%', overflowY: 'auto' }}>
              <form onSubmit={fecharModalFiltros}>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Categoria</label>
                  <select className="form-select bg-light border-0 py-2.5 rounded-3 text-dark" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                    <option value="">Todas as Categorias</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id.toString()}>{cat.nome}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Vence em até:</label>
                  <select className="form-select bg-light border-0 py-2.5 rounded-3 text-dark" value={diasMaxValidade} onChange={(e) => setDiasMaxValidade(e.target.value)}>
                    <option value="">Qualquer data</option>
                    <option value="7">Próximos 7 dias</option>
                    <option value="15">Próximos 15 dias</option>
                    <option value="30">Próximos 30 dias</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Distância máxima</label>
                  <select
                    className="form-select bg-light border-0 py-2.5 rounded-3 text-dark"
                    value={distanciaMaxKm}
                    onChange={(e) => setDistanciaMaxKm(e.target.value)}
                    disabled={!localizacao}
                  >
                    <option value="">Qualquer distância</option>
                    <option value="5">Até 5 km</option>
                    <option value="10">Até 10 km</option>
                    <option value="25">Até 25 km</option>
                    <option value="50">Até 50 km</option>
                    <option value="100">Até 100 km</option>
                  </select>
                  {!localizacao && (
                    <small className="text-muted d-block mt-1">Habilite a localização do aparelho para usar este filtro.</small>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Faixa de Preço (R$)</label>
                  <div className="d-flex gap-2">
                    <input type="number" placeholder="Min" className="form-control bg-light border-0 text-center py-2 rounded-3"
                      value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />
                    <span className="mt-1 text-muted">-</span>
                    <input type="number" placeholder="Max" className="form-control bg-light border-0 text-center py-2 rounded-3"
                      value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />
                  </div>
                </div>

                {/* BOTÕES DE LIMPAR E APLICAR LADO A LADO */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light fw-bold rounded-3 py-2.5 flex-grow-1 text-muted"
                    onClick={limparFiltros}
                  >
                    Limpar
                  </button>
                  <button
                    type="submit"
                    className="btn text-white fw-bold rounded-3 py-2.5 flex-grow-1"
                    style={{ backgroundColor: 'var(--dl-primary, #0f9b58)', border: 'none' }}
                  >
                    Aplicar Filtros
                  </button>
                </div>

              </form>
            </div>
          </IonModal>

          {/* MODAL DE DETALHES COMPLETO */}
          <OfertaDetalhesModal 
            detalhesOferta={detalhesOferta} 
            setDetalhesOferta={setDetalhesOferta} 
            formatarMoeda={formatarMoeda} 
            formatarData={formatarData} 
            formatarDistancia={formatarDistancia} 
          />

        </div>

        {/* FAB de Favoritos */}
        <Link to="/favoritos"
          className="position-fixed shadow-lg d-flex align-items-center justify-content-center rounded-circle bg-warning border border-2 border-white"
          style={{
            bottom: '20px',
            right: '20px',
            width: '56px',
            height: '56px',
            cursor: 'pointer',
            zIndex: 1000,
            textDecoration: 'none'
          }}
        >
          <img 
            src="/icons/favorito.png" 
            alt="Favoritos" 
            style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
          />
        </Link>
        


      </IonContent>
    </IonPage>
  );
}