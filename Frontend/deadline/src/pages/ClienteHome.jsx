import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';
import { obterLocalizacaoConsumidor, formatarDistancia, mensagemErroGeolocalizacao, statusDeErroGeolocalizacao } from '../utils/geolocalizacao';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ClienteHome() {
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // 1. Estados para Filtros
  const [termoBusca, setTermoBusca] = useState(''); 
  const [nomeProduto, setNomeProduto] = useState(''); 
  const [categoriaId, setCategoriaId] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [diasMaxValidade, setDiasMaxValidade] = useState('');
  const [distanciaMaxKm, setDistanciaMaxKm] = useState('100'); 
  const [lojasEncontradas, setLojasEncontradas] = useState([]);

  // 2. Estados de Geolocalização e Cidade
  const [localizacao, setLocalizacao] = useState(null);
  const [cidadeUsuario, setCidadeUsuario] = useState(''); 
  const [statusLocalizacao, setStatusLocalizacao] = useState('pendente');
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState('');
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  // 3. Estado de Ordenação, Modal e Cookies
  const [ordenacao, setOrdenacao] = useState('validadeProduto,asc');
  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [mostrarCookies, setMostrarCookies] = useState(!localStorage.getItem('cookieDeadline')); 

  const debounceTimer = useRef(null);

  // --- Funções de Ação Externas ---
  const abrirMapa = (oferta) => {
    const end = oferta.enderecoEmpresa;
    const query = encodeURIComponent(`${end.logradouro}, ${end.numero} - ${end.bairro}, ${end.cidade} - ${end.uf}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const abrirWhatsApp = (oferta) => {
    fetch(`${API_URL}/oferta/publico/${oferta.id}/engajamento`, { method: 'POST' }).catch(console.error);
    const fone = oferta.contatoWhatsapp?.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá! Vi a oferta do produto "${oferta.tituloProduto}" por R$ ${oferta.precoPromocional.toFixed(2)} no Deadline. Ainda está disponível?`);
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  const abrirEmail = (oferta) => {
    fetch(`${API_URL}/oferta/publico/${oferta.id}/engajamento`, { method: 'POST' }).catch(console.error);
    if (!oferta.emailContato) {
      alert("Este lojista não disponibilizou um e-mail de contacto.");
      return;
    }
    const assunto = encodeURIComponent(`Interesse na oferta: ${oferta.tituloProduto}`);
    const corpo = encodeURIComponent(`Olá, vi a oferta do produto "${oferta.tituloProduto}" por R$ ${oferta.precoPromocional?.toFixed(2)} e gostaria de mais informações.`);
    window.open(`mailto:${oferta.emailContato}?subject=${assunto}&body=${corpo}`, '_blank');
  };

  const aceitarCookies = () => {
    localStorage.setItem('cookieDeadline', 'true');
    setMostrarCookies(false);
  };

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

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await res.json();
        const nomeDaCidade = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Sua localização';
        setCidadeUsuario(nomeDaCidade);
      } catch (e) {
        setCidadeUsuario('Localização encontrada');
      }

    } catch (err) {
      console.warn('Geolocalização:', err);
      setLocalizacao(null);
      setStatusLocalizacao(statusDeErroGeolocalizacao(err));
      setMensagemLocalizacao(mensagemErroGeolocalizacao(err));
      setCidadeUsuario('Localização não informada');
    } finally {
      setBuscandoLocalizacao(false);
    }
  }, []);

  useEffect(() => {
    solicitarLocalizacao();
  }, [solicitarLocalizacao]);

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
  }, [nomeProduto, categoriaId, diasMaxValidade, precoMax, precoMin, distanciaMaxKm, ordenacao, localizacao]);

  const aplicarFiltrosTexto = (e) => {
    e.preventDefault();
    setNomeProduto(termoBusca.trim());
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
    <div style={{ backgroundColor: 'var(--dl-background, #ebebeb)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* NAVBAR MINIMALISTA */}
      <nav className="navbar navbar-expand-lg py-3 shadow-sm sticky-top bg-white">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3">
          
          <div className="d-flex align-items-center gap-4">
            <Link className="navbar-brand d-flex align-items-center m-0" to="/">
              <img src="/logo_deadline.png" alt="Deadline" style={{ height: '35px' }} />
            </Link>

            {/* SEÇÃO "ENVIAR PARA..." (Localização do Usuário) */}
            <div className="d-none d-md-flex align-items-center gap-1 text-muted cursor-pointer" onClick={solicitarLocalizacao} style={{cursor: 'pointer'}} title="Atualizar localização">
              <span className="fs-4 text-dark opacity-75">📍</span>
              <div className="d-flex flex-column lh-1">
                <span style={{fontSize: '0.7rem'}}>Enviar para</span>
                <strong className="text-dark" style={{fontSize: '0.85rem'}}>
                  {buscandoLocalizacao ? 'Buscando...' : (cidadeUsuario || 'Definir localização')}
                </strong>
              </div>
            </div>
          </div>

          <form onSubmit={aplicarFiltrosTexto} className="flex-grow-1 position-relative" style={{ maxWidth: '500px' }}>
            <input 
              type="text" 
              className="form-control shadow-sm border border-secondary border-opacity-25" 
              placeholder="Buscar produtos, marcas e muito mais..." 
              value={termoBusca} 
              onChange={(e) => setTermoBusca(e.target.value)} 
              style={{ padding: '10px 20px', borderRadius: '4px' }}
            />
            <button type="submit" className="btn position-absolute top-50 end-0 translate-middle-y border-0" style={{ color: 'var(--dl-primary)' }}>
              🔍
            </button>
          </form>

          {/* ACESSO MINIMALISTA DO LOJISTA E USUÁRIO */}
          <div className="d-flex align-items-center gap-3">
             <Link to="/auth" className="text-dark text-decoration-none fw-medium" style={{ fontSize: '0.9rem' }}>Crie a sua conta</Link>
             <Link to="/auth" className="text-dark text-decoration-none fw-medium" style={{ fontSize: '0.9rem' }}>Entre</Link>
          </div>
          
        </div>
      </nav>

      {/* HERO SECTION DEADLINE */}
      <div className="text-white py-4 text-center mb-4" style={{ background: 'linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-secondary) 100%)' }}>
        <div className="container">
          <h2 className="fw-bold mb-2">Salve produtos, economize muito!</h2>
          <p className="lead opacity-90 mb-0" style={{ fontSize: '1.1rem' }}>Encontre ofertas imperdíveis de produtos próximos da validade em lojas perto de você.</p>
        </div>
      </div>

      <div className="container py-2">
        <div className="row">
          
          {/* BARRA LATERAL (SIDEBAR FILTROS) */}
          <div className="col-lg-3 d-none d-lg-block">
            <h5 className="fw-bold text-dark mb-1">{nomeProduto ? `Resultados para "${nomeProduto}"` : 'Todas as Ofertas'}</h5>
            <p className="text-muted small mb-4">{ofertas.length} resultados</p>

            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3">Categorias</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <button className={`btn btn-link p-0 text-decoration-none small ${categoriaId === '' ? 'text-dark fw-bold' : 'text-muted'}`} onClick={() => setCategoriaId('')}>
                    Todas
                  </button>
                </li>
                {categorias.map(cat => (
                  <li key={cat.id} className="mb-2">
                    <button className={`btn btn-link p-0 text-decoration-none small ${categoriaId === String(cat.id) ? 'text-dark fw-bold' : 'text-muted'}`} onClick={() => setCategoriaId(String(cat.id))}>
                      {cat.nome}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3">Vencimento Rápido ⚡</h6>
              <div className="d-flex flex-column gap-2">
                {[{val: '', label: 'Qualquer data'}, {val: '7', label: 'Até 7 dias'}, {val: '15', label: 'Até 15 dias'}, {val: '30', label: 'Até 30 dias'}].map(opt => (
                  <label key={opt.val} className="d-flex align-items-center gap-2 small text-muted cursor-pointer">
                    <input type="radio" name="vencimento" className="form-check-input" checked={diasMaxValidade === opt.val} onChange={() => setDiasMaxValidade(opt.val)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* FILTRO DE DISTÂNCIA */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3">Distância Máxima</h6>
              <select
                className="form-select form-select-sm bg-white shadow-sm border-0"
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
              {!localizacao && statusLocalizacao !== 'ok' && (
                <small className="text-danger d-block mt-1" style={{fontSize: '0.7rem'}}>
                  Requer permissão de localização.
                </small>
              )}
            </div>

            {/* FILTRO DE PREÇO */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3">Preço (R$)</h6>
              <div className="d-flex align-items-center gap-2">
                <input type="number" className="form-control form-control-sm text-center border-0 shadow-sm" placeholder="Mínimo" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />
                <span className="text-muted">-</span>
                <input type="number" className="form-control form-control-sm text-center border-0 shadow-sm" placeholder="Máximo" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />
              </div>
            </div>
          </div>

          {/* GRID DE PRODUTOS PRINCIPAL */}
          <div className="col-lg-9">
            
            {lojasEncontradas.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-3">Lojas Encontradas</h6>
                {lojasEncontradas.map(loja => (
                  <div key={loja.id} className="bg-white rounded-3 shadow-sm p-3 mb-2 border border-light d-flex flex-column flex-md-row align-items-center justify-content-between gap-3" style={{ borderLeft: '4px solid var(--dl-primary) !important' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden border" style={{ width: '60px', height: '60px' }}>
                        {loja.logotipo ? (
                          <img src={loja.logotipo} alt={loja.nomeFantasia} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : ( <span className="fw-bold text-success fs-4">🏢</span> )}
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-1">
                          {loja.nomeFantasia} 
                          <span className="text-white d-flex align-items-center justify-content-center" style={{fontSize: '0.6rem', width: '14px', height: '14px', backgroundColor: 'var(--dl-primary)', borderRadius: '50%'}}>✓</span>
                        </h6>
                        <span className="text-muted small d-block">Loja Oficial Parceira Deadline</span>
                      </div>
                    </div>
                    
                    <Link to={`/loja/${loja.id}`} className="btn btn-outline-success fw-bold px-4 py-1 rounded-pill w-100 w-md-auto shadow-sm">
                      Ver Ofertas da Loja
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* SELECT ORDENAÇÃO */}
            <div className="d-flex justify-content-end mb-3">
              <select className="form-select form-select-sm border-0 shadow-sm w-auto bg-white text-dark fw-bold" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="validadeProduto,asc">Mais relevantes (Vencimento)</option>
                <option value="precoPromocional,asc">Menor Preço</option>
                <option value="percentualDesconto,desc">Maior Desconto</option>
                {localizacao && <option value="distanciaKm,asc">Mais Próximo</option>}
              </select>
            </div>

            {/* GRELHA */}
            {carregando ? (
              <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : ofertas.length === 0 ? (
              <div className="bg-white rounded-3 shadow-sm p-5 text-center">
                 <span style={{ fontSize: '4rem', opacity: 0.5 }}>🔍</span>
                 <h5 className="text-dark fw-bold mt-3">Não há anúncios que correspondam à sua busca.</h5>
                 <ul className="text-muted small list-unstyled mt-3">
                   <li>Verifique a ortografia da palavra.</li>
                   <li>Tente usar palavras mais genéricas ou aumentar a distância.</li>
                 </ul>
              </div>
            ) : (
              <div className="row g-3 mb-5">
                {ofertas.map((oferta) => (
                  <div className="col-12 col-sm-6 col-md-4" key={oferta.id}>
                    
                    {/* CARD PRODUTO */}
                    <div className="card h-100 border-0 shadow-sm bg-white" style={{ borderRadius: '8px', cursor: 'pointer', transition: 'box-shadow 0.2s' }} 
                         onClick={() => abrirDetalhes(oferta.id)}
                         onMouseEnter={(e) => e.currentTarget.classList.add('shadow')}
                         onMouseLeave={(e) => e.currentTarget.classList.remove('shadow')}>
                      
                      <div className="border-bottom p-3 d-flex align-items-center justify-content-center position-relative" style={{ height: '220px', backgroundColor: '#fff' }}>
                        {oferta.foto ? (
                          <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : ( <span style={{ fontSize: '3rem', opacity: 0.1 }}>📦</span> )}
                        
                        {oferta.distanciaKm != null && (
                          <div className="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
                            <span className="text-white fw-medium" style={{ fontSize: '0.7rem' }}>📍 {formatarDistancia(oferta.distanciaKm)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-body p-3 d-flex flex-column">
                        <small className="text-muted text-decoration-line-through mb-1" style={{ fontSize: '0.75rem' }}>
                          R$ {oferta.precoOriginal?.toFixed(2).replace('.', ',')}
                        </small>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="fs-4 text-dark" style={{ lineHeight: '1' }}>R$ {oferta.precoPromocional?.toFixed(2).replace('.', ',')}</span>
                          <span className="fw-bold text-success" style={{ fontSize: '0.8rem' }}>{oferta.percentualDesconto?.toFixed(0)}% OFF</span>
                        </div>
                        
                        <div className="mb-2">
                          <span className="fw-bold text-danger" style={{ fontSize: '0.75rem' }}>⏰ Vence em: {formatarData(oferta.validadeProduto)}</span>
                        </div>
                        
                        <p className="text-dark small mb-2 text-truncate-2" style={{ lineHeight: '1.3', flexGrow: 1 }}>{oferta.tituloProduto}</p>
                        <small className="text-muted d-block mt-auto" style={{ fontSize: '0.7rem' }}>Vendido por <span className="fw-bold text-dark">{oferta.nomeFantasiaEmpresa}</span></small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHES DO PRODUTO ENRIQUECIDO */}
      {detalhesOferta && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl my-4">
            <div className="modal-content border-0" style={{ borderRadius: '8px', backgroundColor: '#fff' }}>
              
              <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setDetalhesOferta(null)} style={{ zIndex: 10 }}></button>
              
              <div className="row g-0">
                <div className="col-lg-7 p-4 border-end d-flex flex-column justify-content-center align-items-center position-relative" style={{ minHeight: '400px' }}>
                  {detalhesOferta.foto ? (
                    <img src={detalhesOferta.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                  ) : ( <span style={{ fontSize: '5rem', opacity: 0.1 }}>📦</span> )}
                </div>

                <div className="col-lg-5 p-4 d-flex flex-column">
                  
                  {/* Categoria e EAN Adicionados */}
                  <div className="mb-2 text-muted small d-flex flex-wrap align-items-center gap-2">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border">{detalhesOferta.nomeCategoria}</span>
                    {detalhesOferta.codBarrasEan && <span>• EAN: {detalhesOferta.codBarrasEan}</span>}
                  </div>
                  
                  <h4 className="fw-bold text-dark mb-3" style={{ lineHeight: '1.3' }}>{detalhesOferta.tituloProduto}</h4>
                  
                  <div className="mb-4">
                    <span className="text-muted text-decoration-line-through d-block" style={{ fontSize: '0.9rem' }}>
                      R$ {detalhesOferta.precoOriginal?.toFixed(2).replace('.', ',')}
                    </span>
                    <div className="d-flex align-items-center gap-3">
                      <span className="display-5 text-dark" style={{ fontWeight: '300' }}>R$ {detalhesOferta.precoPromocional?.toFixed(2).replace('.', ',')}</span>
                      <span className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>{detalhesOferta.percentualDesconto?.toFixed(0)}% OFF</span>
                    </div>
                  </div>

                  <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: '#ffe6e6', border: '1px solid #ffcccc' }}>
                     <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fs-5">⏰</span>
                        <span className="fw-bold text-danger">Atenção ao Vencimento</span>
                     </div>
                     <p className="m-0 text-danger small">Este produto vence no dia <strong>{formatarData(detalhesOferta.validadeProduto)}</strong>. A oferta será encerrada em {formatarData(detalhesOferta.dataFimOferta)}.</p>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                       <span style={{ color: '#00a650' }}>📍</span>
                       <span className="fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                          Retire hoje mesmo {detalhesOferta.distanciaKm != null ? `a ${formatarDistancia(detalhesOferta.distanciaKm)} de você` : 'na loja'}
                       </span>
                    </div>
                    
                    {/* Informações Enriquecidas da Loja */}
                    <Link to={`/loja/${detalhesOferta.empresaId}`} className="text-decoration-none text-muted small d-block ms-4 mb-1">
                       Vendido por <span className="fw-bold" style={{color: 'var(--dl-primary)'}}>{detalhesOferta.nomeFantasiaEmpresa}</span>
                    </Link>
                    {detalhesOferta.cnpjEmpresa && (
                       <small className="text-muted d-block ms-4 mb-1">CNPJ: {detalhesOferta.cnpjEmpresa}</small>
                    )}
                    {detalhesOferta.ramoEmpresa && (
                       <small className="text-muted d-block ms-4 mb-1">Segmento: {detalhesOferta.ramoEmpresa}</small>
                    )}
                    <small className="text-muted d-block ms-4 mt-2"> {detalhesOferta.enderecoEmpresa?.logradouro}, {detalhesOferta.enderecoEmpresa?.bairro}</small>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-auto">
                    <button className="btn text-white fw-bold py-3 shadow-sm d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#25D366', borderRadius: '6px' }} onClick={() => abrirWhatsApp(detalhesOferta)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
                      Comprar via WhatsApp
                    </button>
                    <div className="d-flex gap-2">
                       <button className="btn fw-bold py-2 flex-grow-1 border-secondary border-opacity-25" style={{ backgroundColor: '#f8f9fa', color: 'var(--dl-primary)', borderRadius: '6px' }} onClick={() => abrirEmail(detalhesOferta)}>
                         Contactar por E-mail
                       </button>
                       <button className="btn fw-bold py-2 flex-grow-1 border-secondary border-opacity-25" style={{ backgroundColor: '#f8f9fa', color: '#333', borderRadius: '6px' }} onClick={() => abrirMapa(detalhesOferta)}>
                         Como Chegar
                       </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row g-0 border-top">
                 <div className="col-12 p-4">
                    <h5 className="fw-normal text-dark mb-3" style={{ fontSize: '1.2rem' }}>O que você precisa saber sobre este produto</h5>
                    <p className="text-muted small" style={{ whiteSpace: 'pre-line' }}>{detalhesOferta.descricao || "A loja não forneceu uma descrição detalhada."}</p>
                    <div className="alert alert-light border mt-3 mb-0">
                       <strong>Instruções de Retirada:</strong> {detalhesOferta.instrucoesRetirada}
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* AVISO DE COOKIES (LGPD) */}
      {mostrarCookies && (
        <div className="fixed-bottom p-3 bg-dark text-white shadow-lg d-flex flex-column flex-md-row align-items-center justify-content-between gap-3" style={{ zIndex: 2000 }}>
          <div className="d-flex align-items-center gap-3">
            <span className="fs-3">🍪</span>
            <p className="m-0 small">
              Usamos cookies para melhorar sua experiência no Deadline e para podermos exibir as lojas e ofertas mais próximas da sua localização. 
              Ao continuar navegando, você concorda com a nossa política de privacidade.
            </p>
          </div>
          <button className="btn btn-success fw-bold px-4 rounded-pill flex-shrink-0" onClick={aceitarCookies}>
            Aceitar cookies
          </button>
        </div>
      )}

      {/* Estilos Auxiliares */}
      <style>{`
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}