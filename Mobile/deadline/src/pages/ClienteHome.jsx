import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Componentes Oficiais do Ionic para o projeto mobile
import { IonPage, IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle } from '@ionic/react';
import '../styles/theme.css'; 

// Plugin Nativo do Capacitor para permissões e coordenadas de GPS no Celular
import { Geolocation } from '@capacitor/geolocation';

const API_URL = import.meta.env.VITE_API_URL || 'http://10.0.2.2:8080';

/* ==========================================================================
   FUNÇÕES DE GEOLOCALIZAÇÃO NATIVA + FALLBACK
   ========================================================================== */
const obterLocalizacaoConsumidor = async () => {
  try {
    const statusPermissao = await Geolocation.checkPermissions();
    
    if (statusPermissao.location !== 'granted') {
      const resultadoSolicitacao = await Geolocation.requestPermissions();
      if (resultadoSolicitacao.location !== 'granted') {
        console.warn("Permissão de GPS negada pelo usuário.");
        return null;
      }
    }

    const posicao = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000 
    });

    return {
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude
    };
  } catch (error) {
    console.error("Erro ao usar Capacitor Geolocation, tentando fallback para Web...", error);
    
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        resolve(null);
      }
    });
  }
};

const formatarDistancia = (dist) => {
  if (dist == null) return '';
  return dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`;
};
/* ========================================================================== */

export default function ClienteHome() {
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados para a Barra de Busca (Externa)
  const [termoBusca, setTermoBusca] = useState(''); 
  const [nomeProduto, setNomeProduto] = useState(''); 

  // Estados para os Filtros (Internos ao Modal)
  const [categoriaId, setCategoriaId] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [diasMaxValidade, setDiasMaxValidade] = useState('');
  const [distanciaMaxKm, setDistanciaMaxKm] = useState('100');
  const [lojasEncontradas, setLojasEncontradas] = useState([]);

  const [localizacao, setLocalizacao] = useState(null);
  const [statusLocalizacao, setStatusLocalizacao] = useState('pendente'); 

  const [ordenacao, setOrdenacao] = useState('validadeProduto,asc');

  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const debounceTimer = useRef(null);

  const abrirMapa = (oferta) => {
    const end = oferta.enderecoEmpresa;
    const query = encodeURIComponent(`${end.logradouro}, ${end.numero} - ${end.bairro}, ${end.cidade} - ${end.uf}`);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  const abrirWhatsApp = (oferta) => {
    fetch(`${API_URL}/oferta/publico/${oferta.id}/engajamento`, { method: 'POST' }).catch(console.error);
    const fone = oferta.contatoWhatsapp?.replace(/\D/g, ''); 
    const mensagem = encodeURIComponent(`Olá! Vi a oferta do produto "${oferta.tituloProduto}" por R$ ${oferta.precoPromocional.toFixed(2)} no Deadline. Ainda está disponível?`);
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  useEffect(() => {
    fetch(`${API_URL}/categoria`)
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error("Erro ao carregar categorias:", err));
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

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const termo = termoBusca.trim();
      if (termo.length >= 3 || termo.length === 0) {
        setNomeProduto(termo);
      }
    }, 600);
    return () => clearTimeout(debounceTimer.current);
  }, [termoBusca]);

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
  }, [nomeProduto, categoriaId, diasMaxValidade, distanciaMaxKm, ordenacao, localizacao]);

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

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ backgroundColor: 'var(--dl-background, #f8f9fa)', minHeight: '100vh' }}>
          
          <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container px-3 d-flex justify-content-center align-items-center">
              <Link className="navbar-brand d-flex align-items-center gap-2 m-0" to="/">
                <img src="/logo_deadline.png" alt="Deadline" style={{ height: '32px' }} />
              </Link>
            </div>
          </nav>

          <div className="text-white py-4 text-center" style={{ background: 'linear-gradient(135deg, var(--dl-primary, #0f9b58) 0%, var(--dl-secondary, #0d6efd) 100%)' }}>
            <div className="container px-3 py-1">
              <h2 className="fw-bold mb-1 fs-4 text-white">Salve produtos, economize muito!</h2>
              <p className="small opacity-90 mb-0 text-white">Ofertas imperdíveis perto do vencimento em farmácias próximas.</p>
            </div>
          </div>

          {/* BARRA DE PESQUISA EXTERNA (MANTIDA FORA DOS FILTROS) */}
          <div className="bg-white py-2.5 px-3 border-bottom shadow-xs">
            <div className="container p-0 position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}>🔍</span>
              <input 
                type="text" 
                className="form-control bg-light border-0 ps-5 py-2.5 rounded-pill text-dark text-start" 
                placeholder="Buscar por remédios, fraldas, cosméticos..." 
                value={termoBusca} 
                onChange={(e) => setTermoBusca(e.target.value)} 
                style={{ fontSize: '0.85rem' }}
              />
              {termoBusca && (
                <button 
                  className="btn position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 bg-transparent py-1 px-2"
                  onClick={() => setTermoBusca('')}
                  style={{ fontSize: '0.8rem', zIndex: 5 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border-bottom shadow-xs py-2 mb-3">
            <div className="container px-3 d-flex gap-2 overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              <button
                onClick={() => setCategoriaId('')}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap transition-all ${categoriaId === '' ? 'btn-success text-white' : 'btn-light text-muted'}`}
                style={categoriaId === '' ? { backgroundColor: 'var(--dl-primary, #0f9b58)', borderColor: 'var(--dl-primary, #0f9b58)' } : {}}
              >
                📦 Todas as Categorias
              </button>
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaId(cat.id.toString())}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap transition-all ${categoriaId === cat.id.toString() ? 'btn-success text-white' : 'btn-light text-muted'}`}
                  style={categoriaId === cat.id.toString() ? { backgroundColor: 'var(--dl-primary, #0f9b58)', borderColor: 'var(--dl-primary, #0f9b58)' } : {}}
                >
                  ✨ {cat.nome}
                </button>
              ))}
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
                              <img src={loja.logotipo} alt={loja.nomeFantasia} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : ( <span className="fs-5">🏢</span> )}
                          </div>
                          <div>
                            <h6 className="fw-bold text-dark m-0 small d-flex align-items-center gap-1">
                              {loja.nomeFantasia} <span className="text-primary" style={{fontSize: '0.75rem'}}>✓</span>
                            </h6>
                            <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Farmácia Oficial Parceira</small>
                          </div>
                        </div>
                        <Link to={`/loja/${loja.id}`} className="btn btn-sm text-white fw-bold px-3 py-2 rounded-3 shadow-sm" style={{ backgroundColor: '#0d6efd', fontSize: '0.8rem' }}>
                          Ver Loja
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center mb-3 bg-white p-2 px-3 rounded-4 shadow-sm">
                  <span className="text-muted fw-bold small">{ofertas.length} {ofertas.length === 1 ? 'oferta' : 'ofertas'}</span>
                  
                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1 rounded-pill px-3 py-1.5" 
                      style={{ backgroundColor: 'var(--dl-primary, #0f9b58)', fontSize: '0.75rem', border: 'none' }}
                      onClick={() => setMostrarFiltros(true)}
                    >
                      <span>🔍</span> Filtros
                    </button>

                    <select 
                      className="form-select form-select-sm bg-light border-0 fw-bold py-1 pe-4 text-dark" 
                      style={{ width: '125px', fontSize: '0.75rem', borderRadius: '20px' }}
                      value={ordenacao} 
                      onChange={(e) => setOrdenacao(e.target.value)}
                    >
                      <option value="validadeProduto,asc">Vence Cedo</option>
                      <option value="precoPromocional,asc">Menor Preço</option>
                      <option value="percentualDesconto,desc">Maior Desct.</option>
                      <option value="id,desc">Mais Recentes</option>
                      {localizacao && <option value="distanciaKm,asc">Mais Próximo</option>}
                    </select>
                  </div>
                </div>

                {carregando ? (
                   <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                ) : ofertas.length === 0 ? (
                   <div className="text-center py-5 bg-white rounded-4 shadow-sm mx-2">
                     <span style={{fontSize: '3rem'}}>😕</span>
                     <h6 className="fw-bold mt-2 text-dark">Nenhuma oferta encontrada.</h6>
                     <p className="text-muted small">Tente alterar os filtros ou categoria acima.</p>
                   </div>
                ) : (
                  <div className="row g-2">
                    {ofertas.map((oferta) => (
                      <div className="col-6 col-md-4 col-xl-3" key={oferta.id}>
                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ minHeight: '270px' }}>
                          
                          <div className="position-absolute top-0 start-0 m-2 px-2 py-0.5 rounded-3 text-white fw-bold shadow-sm" 
                               style={{ backgroundColor: '#e63946', zIndex: 2, fontSize: '0.75rem' }}>
                            -{oferta.percentualDesconto?.toFixed(0)}%
                          </div>

                          <div className="bg-light text-center p-2 d-flex align-items-center justify-content-center" style={{ height: '115px' }}>
                            {oferta.foto ? (
                              <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '2.5rem', opacity: 0.15 }}>📦</span>
                            )}
                          </div>

                          <div className="card-body d-flex flex-column p-2">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span className="text-success fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{oferta.nomeCategoria}</span>
                              {oferta.distanciaKm != null && (
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.6rem' }}>
                                  📍 {formatarDistancia(oferta.distanciaKm)}
                                </span>
                              )}
                            </div>
                            
                            <h6 className="fw-bold text-dark mb-1 text-truncate small" title={oferta.tituloProduto} style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                              {oferta.tituloProduto}
                            </h6>
                            
                            <div className="my-1">
                              <span className="text-muted text-decoration-line-through d-block" style={{ fontSize: '0.7rem' }}>De: {formatarMoeda(oferta.precoOriginal)}</span>
                              <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>Por: {formatarMoeda(oferta.precoPromocional)}</span>
                            </div>

                            <div className="mt-auto pt-2 border-top d-flex flex-column gap-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted" style={{ fontSize: '0.65rem' }}>Vence em:</span>
                                <span className="fw-bold text-danger" style={{ fontSize: '0.7rem' }}>{formatarData(oferta.validadeProduto)}</span>
                              </div>
                              <button className="btn btn-sm text-white fw-bold py-1.5 px-2 rounded-3 w-100 mt-1 shadow-xs" 
                                      style={{ backgroundColor: 'var(--dl-primary, #0f9b58)', fontSize: '0.75rem', border: 'none' }}
                                      onClick={() => abrirDetalhes(oferta.id)}>
                                {carregandoDetalhes ? '...' : 'Ver Detalhes'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MENU RETRÁTIL DE FILTROS ADICIONAIS (SEM BUSCA TEXTUAL) */}
          <IonModal isOpen={mostrarFiltros} onDidDismiss={() => setMostrarFiltros(false)}>
            <IonHeader>
              <IonToolbar>
                <IonTitle style={{ fontSize: '1rem', fontWeight: 'bold' }}>🔍 Filtrar Ofertas</IonTitle>
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
          {detalhesOferta && (
            <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                  <div className="modal-header border-0 bg-light p-3">
                    <Link to={`/loja/${detalhesOferta.empresaId}`} className="d-flex align-items-center gap-2 text-decoration-none">
                      <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden" style={{width: '40px', height: '40px'}}>
                         {detalhesOferta.logotipoEmpresa ? (
                           <img src={detalhesOferta.logotipoEmpresa} alt="Logo" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                         ) : ( <span className="fw-bold text-success">🏢</span> )}
                      </div>
                      <div>
                        <small className="text-muted d-block fw-bold" style={{fontSize: '0.65rem'}}>Vendido por:</small>
                        <h6 className="fw-bold text-dark m-0 small d-flex align-items-center gap-1">
                           {detalhesOferta.nomeFantasiaEmpresa} <span>↗️</span>
                        </h6>
                      </div>
                    </Link>
                    <button type="button" className="btn-close" onClick={() => setDetalhesOferta(null)}></button>
                  </div>
                  <div className="modal-body p-3" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <div className="row g-3">
                      <div className="col-md-5 text-center">
                        <div className="bg-light rounded-4 p-2 mb-2 d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                          {detalhesOferta.foto ? (
                            <img src={detalhesOferta.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : ( <span style={{ fontSize: '3rem', opacity: 0.1 }}>📦</span> )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 p-2 rounded-4 border border-success border-opacity-25">
                          <div className="text-start">
                            <span className="text-muted text-decoration-line-through small d-block" style={{ fontSize: '0.75rem' }}>De: {formatarMoeda(detalhesOferta.precoOriginal)}</span>
                            <h4 className="fw-bold text-success m-0" style={{ fontSize: '1.25rem' }}>{formatarMoeda(detalhesOferta.precoPromocional)}</h4>
                          </div>
                          <div className="badge bg-danger rounded-3">-{detalhesOferta.percentualDesconto?.toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="col-md-7 d-flex flex-column">
                        <h5 className="fw-bold text-dark mb-1">{detalhesOferta.tituloProduto}</h5>
                        <p className="text-muted small mb-3">{detalhesOferta.descricao || "Sem descrição disponível."}</p>
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="p-2 border rounded-3 bg-light text-center">
                              <small className="text-muted fw-bold d-block" style={{fontSize: '0.6rem'}}>PRODUTO VENCE EM</small>
                              <span className="fw-bold text-danger small">{formatarData(detalhesOferta.validadeProduto)}</span>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 border rounded-3 bg-light text-center">
                              <small className="text-muted fw-bold d-block" style={{fontSize: '0.6rem'}}>OFERTA ENCERRA EM</small>
                              <span className="fw-bold text-dark small">{formatarData(detalhesOferta.dataFimOferta)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-auto pt-2 border-top">
                          <h6 className="fw-bold text-dark small mb-1">📍 Retirada</h6>
                          {detalhesOferta.distanciaKm != null && (
                            <p className="small fw-bold text-primary mb-1" style={{ fontSize: '0.75rem' }}>
                              Distância de você: {formatarDistancia(detalhesOferta.distanciaKm)}
                            </p>
                          )}
                          <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                            {detalhesOferta.enderecoEmpresa?.logradouro}, {detalhesOferta.enderecoEmpresa?.numero} - {detalhesOferta.enderecoEmpresa?.bairro}
                          </p>
                          <div className="alert alert-warning small py-1.5 px-2 mb-0 d-flex gap-1" style={{ fontSize: '0.75rem' }}>
                            <span>📋</span>
                            <div><strong>Instruções:</strong> {detalhesOferta.instrucoesRetirada}</div>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-sm btn-outline-dark fw-bold rounded-pill flex-grow-1 py-2" style={{ fontSize: '0.8rem' }} onClick={() => abrirMapa(detalhesOferta)}>
                            Mapa
                          </button>
                          <button className="btn btn-sm text-white fw-bold rounded-pill flex-grow-1 py-2" style={{backgroundColor: '#25D366', fontSize: '0.8rem', border: 'none' }} onClick={() => abrirWhatsApp(detalhesOferta)}>
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
}