import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/theme.css';
import { obterLocalizacaoConsumidor, formatarDistancia } from '../utils/geolocalizacao';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function LojaPerfil() {
  const { id } = useParams();
  const [loja, setLoja] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [localizacao, setLocalizacao] = useState(null);

  // Estados do Modal de Detalhes
  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  useEffect(() => {
    obterLocalizacaoConsumidor()
      .then(setLocalizacao)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const carregarLoja = async () => {
      try {
        const resLoja = await fetch(`${API_URL}/empresa/publico/${id}`);
        if (resLoja.ok) setLoja(await resLoja.json());

        const url = new URL(`${API_URL}/oferta/publico`);
        url.searchParams.append('empresaId', id);
        url.searchParams.append('size', '50');
        url.searchParams.append('sort', 'id,desc');
        if (localizacao) {
          url.searchParams.append('latitude', localizacao.latitude);
          url.searchParams.append('longitude', localizacao.longitude);
        }

        const resOfertas = await fetch(url.toString());
        if (resOfertas.ok) {
           const data = await resOfertas.json();
           setOfertas(data.content || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
      }
    };
    carregarLoja();
  }, [id, localizacao]);

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';

  const abrirDetalhes = async (ofertaId) => {
    setCarregandoDetalhes(true);
    try {
      const url = new URL(`${API_URL}/oferta/publico/${ofertaId}`);
      if (localizacao) {
        url.searchParams.append('latitude', localizacao.latitude);
        url.searchParams.append('longitude', localizacao.longitude);
      }
      const res = await fetch(url.toString());
      if (res.ok) setDetalhesOferta(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  // --- FUNÇÕES DE CONTACTO DIRETO DA LOJA (Gera engajamento no Dashboard) ---
  const entrarEmContatoWhatsApp = () => {
    if (!loja?.contatoWhatsapp) {
      alert("Esta loja não disponibilizou um número de WhatsApp.");
      return;
    }
    // Registra a métrica de clique no backend (Usamos a primeira oferta ou ID geral se mapeado)
    if (ofertas.length > 0) {
      fetch(`${API_URL}/oferta/publico/${ofertas[0].id}/engajamento`, { method: 'POST' }).catch(console.error);
    }

    const fone = loja.contatoWhatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá! Vi o perfil da sua loja no Deadline e gostaria de saber mais sobre as vossas ofertas ativas.`);
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  const enviarEmailLoja = () => {
    if (!loja?.emailContato) {
      alert("Esta loja não disponibilizou um e-mail de contacto.");
      return;
    }
    if (ofertas.length > 0) {
      fetch(`${API_URL}/oferta/publico/${ofertas[0].id}/engajamento`, { method: 'POST' }).catch(console.error);
    }

    const assunto = encodeURIComponent(`Contacto via Plataforma Deadline`);
    const corpo = encodeURIComponent(`Olá, vi o vosso catálogo de produtos com desconto no aplicativo Deadline e gostaria de tirar uma dúvida.`);
    window.open(`mailto:${loja.emailContato}?subject=${assunto}&body=${corpo}`, '_blank');
  };

  const abrirMapaExt = (endereco) => {
    if (!endereco) return;
    const query = encodeURIComponent(`${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}`);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  const getEnderecoString = () => {
    if (!loja?.endereco) return '';
    return encodeURIComponent(`${loja.endereco.logradouro}, ${loja.endereco.numero} - ${loja.endereco.bairro}, ${loja.endereco.cidade} - ${loja.endereco.uf}`);
  };

  if (carregando) return <div className="text-center py-5 mt-5"><div className="spinner-border text-success"></div></div>;
  if (!loja) return <div className="text-center py-5 mt-5 fw-bold text-muted">Loja não encontrada.</div>;

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* NAVBAR */}
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark text-decoration-none" to="/">
            <span className="text-success fs-4">←</span> Voltar para Vitrine
          </Link>
          <img src="/logo_deadline.png" alt="Deadline" style={{ height: '30px' }} />
        </div>
      </nav>

      {/* HEADER / CAPA DA LOJA (Estilo Mercado Livre / Premium) */}
      <div className="bg-white shadow-sm mb-4">
        <div style={{ height: '180px', background: 'linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-secondary) 100%)' }}></div>
        
        <div className="container position-relative pb-4">
          <div className="bg-white rounded-circle shadow-lg d-flex align-items-center justify-content-center overflow-hidden border border-4 border-white position-absolute" 
               style={{ width: '140px', height: '140px', top: '-70px', left: '15px' }}>
             {loja.logotipo ? (
               <img src={loja.logotipo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
             ) : ( <span style={{ fontSize: '3.5rem' }}>🏢</span> )}
          </div>
          
          <div style={{ paddingTop: '80px', paddingLeft: '15px' }}>
             <div className="d-flex align-items-center gap-2 mb-1">
               <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small rounded-pill">
                 ✓ Loja Oficial Parceira
               </span>
             </div>
             
             <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
               <div>
                 <h1 className="fw-bold text-dark m-0">{loja.nomeFantasia}</h1>
                 <div className="d-flex flex-wrap gap-4 mt-2 text-muted small">
                    <span>📍 {loja.endereco?.cidade} - {loja.endereco?.uf}</span>
                    {ofertas[0]?.distanciaKm != null && (
                      <span className="fw-bold text-primary">↔ {formatarDistancia(ofertas[0].distanciaKm)} de você</span>
                    )}
                    <span>🕒 {loja.horarioFuncionamento}</span>
                 </div>
               </div>

               {/* ========================================================================= */}
               {/* ADIÇÃO: BOTÕES MODERNOS DE CONTACTO DIRETO NO PERFIL DA LOJA              */}
               {/* ========================================================================= */}
               <div className="d-flex gap-2 w-100 w-md-auto mt-2">
                 <button className="btn text-white fw-bold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" 
                         style={{ backgroundColor: '#25D366', fontSize: '0.9rem' }} onClick={entrarEmContatoWhatsApp}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592"/></svg>
                    WhatsApp da Loja
                 </button>
                 <button className="btn text-white fw-bold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" 
                         style={{ backgroundColor: '#0d6efd', fontSize: '0.9rem' }} onClick={enviarEmailLoja}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/></svg>
                    E-mail
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* GRID DE OFERTAS DA LOJA */}
      <div className="container py-4">
         <h4 className="fw-bold mb-4 text-dark border-bottom pb-2">Produtos em Destaque</h4>
         
         {ofertas.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
               <span style={{fontSize: '3rem'}}>🏷️</span>
               <p className="text-muted mt-3 mb-0">Esta loja não tem ofertas ativas no momento.</p>
            </div>
         ) : (
            <div className="row g-4">
              {ofertas.map((oferta) => (
                <div className="col-12 col-md-6 col-xl-3" key={oferta.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                    <div className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3 text-white fw-bold shadow-sm" style={{ backgroundColor: '#e63946', zIndex: 2, fontSize: '0.85rem' }}>
                      -{oferta.percentualDesconto?.toFixed(0)}%
                    </div>
                    <div className="bg-white text-center p-4 border-bottom" style={{ height: '200px' }}>
                      {oferta.foto ? (
                        <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : ( <span style={{ fontSize: '4rem', opacity: 0.1 }}>📦</span> )}
                    </div>
                    <div className="card-body d-flex flex-column p-4 bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="text-success small fw-bold text-uppercase">{oferta.nomeCategoria}</span>
                        {oferta.distanciaKm != null && (
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
                            📍 {formatarDistancia(oferta.distanciaKm)}
                          </span>
                        )}
                      </div>
                      <h6 className="fw-bold text-dark mb-3 text-truncate" title={oferta.tituloProduto}>{oferta.tituloProduto}</h6>
                      <div className="mb-3">
                        <span className="text-muted text-decoration-line-through small d-block">De: {formatarMoeda(oferta.precoOriginal)}</span>
                        <span className="fw-bold text-dark fs-4">Por: {formatarMoeda(oferta.precoPromocional)}</span>
                      </div>
                      <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Vence em:</small>
                          <span className="fw-bold text-danger small">{formatarData(oferta.validadeProduto)}</span>
                        </div>
                        <button className="btn btn-sm text-white fw-bold px-3 rounded-pill" style={{backgroundColor: 'var(--dl-primary)'}} onClick={() => abrirDetalhes(oferta.id)}>
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
         )}
      </div>

      {/* SECÇÃO DO MAPA (NO FINAL) */}
      <div id="mapa" className="container py-5 mt-4 border-top">
         <div className="bg-white rounded-4 shadow-sm p-4">
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
               📍 Como chegar à {loja.nomeFantasia}
            </h5>
            <div className="row g-4 align-items-center">
               <div className="col-lg-4">
                  <div className="p-3 bg-light rounded-3 border">
                     <p className="fw-bold mb-1">Endereço Completo:</p>
                     <p className="text-muted small mb-3">
                        {loja.endereco?.logradouro}, {loja.endereco?.numero}<br/>
                        {loja.endereco?.bairro}<br/>
                        {loja.endereco?.cidade} - {loja.endereco?.uf}<br/>
                        CEP: {loja.endereco?.cep}
                     </p>
                     <p className="fw-bold mb-1">Retirada:</p>
                     <p className="text-muted small m-0">{loja.instrucoesRetirada || "Apresente o código da oferta no balcão."}</p>
                     <button className="btn btn-sm btn-outline-dark w-100 fw-bold rounded-pill mt-3" onClick={() => abrirMapaExt(loja.endereco)}>
                       Abrir no Google Maps ↗
                     </button>
                  </div>
               </div>
               <div className="col-lg-8">
                  <div className="rounded-3 overflow-hidden shadow-sm border" style={{ height: '300px', backgroundColor: '#e9ecef' }}>
                     {loja.endereco ? (
                       <iframe 
                         width="100%" 
                         height="100%" 
                         style={{ border: 0 }} 
                         loading="lazy" 
                         allowFullScreen 
                         src={`https://maps.google.com/maps?q=${getEnderecoString()}&t=&z=15&ie=UTF8&iwloc=&output=embed`}>
                       </iframe>
                     ) : (
                       <div className="d-flex h-100 align-items-center justify-content-center text-muted">Endereço não disponível</div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* MODAL DE DETALHES INTEGRADO (Permite comprar direto do perfil) */}
      {detalhesOferta && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-0 bg-light p-4">
                <div className="d-flex align-items-center gap-3">
                  <h5 className="fw-bold text-dark m-0">Detalhes da Oferta</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setDetalhesOferta(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-5 text-center">
                    <div className="bg-light rounded-4 p-3 mb-3 d-flex align-items-center justify-content-center border" style={{ height: '220px' }}>
                      {detalhesOferta.foto ? (
                        <img src={detalhesOferta.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : ( <span style={{ fontSize: '4rem', opacity: 0.1 }}>📦</span> )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-25">
                      <div className="text-start">
                        <span className="text-muted text-decoration-line-through small d-block">{formatarMoeda(detalhesOferta.precoOriginal)}</span>
                        <h3 className="fw-bold text-success m-0">{formatarMoeda(detalhesOferta.precoPromocional)}</h3>
                      </div>
                      <div className="badge bg-danger fs-6 rounded-3">-{detalhesOferta.percentualDesconto?.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="col-md-7 d-flex flex-column">
                    <h4 className="fw-bold text-dark mb-2">{detalhesOferta.tituloProduto}</h4>
                    <p className="text-muted small mb-4">{detalhesOferta.descricao || "Sem descrição disponível."}</p>
                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>PRODUTO VENCE EM</small>
                          <span className="fw-bold text-danger">{formatarData(detalhesOferta.validadeProduto)}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>OFERTA ENCERRA EM</small>
                          <span className="fw-bold text-dark">{formatarData(detalhesOferta.dataFimOferta)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto border-top pt-4">
                      <h6 className="fw-bold text-dark mb-3"><span className="text-success me-2">📍</span> Informações de Retirada</h6>
                      {detalhesOferta.distanciaKm != null && (
                        <p className="small fw-bold text-primary mb-2">
                          Distância de você: {formatarDistancia(detalhesOferta.distanciaKm)}
                        </p>
                      )}
                      <p className="small text-muted mb-2"><strong>Horário: </strong> {detalhesOferta.horarioFuncionamento}</p>
                      <div className="alert alert-warning small py-2 mb-0 d-flex align-items-start gap-2 border">
                        <span className="mt-1">📋</span>
                        <div><strong>Instruções do Lojista:</strong><br/>{detalhesOferta.instrucoesRetirada}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}