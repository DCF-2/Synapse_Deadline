import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import '../styles/theme.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function LojaPerfil() {
  const { id } = useParams();
  const [loja, setLoja] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Detalhes
  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  useEffect(() => {
    const carregarLoja = async () => {
      try {
        const resLoja = await fetch(`${API_URL}/empresa/publico/${id}`);
        if (resLoja.ok) setLoja(await resLoja.json());

        const resOfertas = await fetch(`${API_URL}/oferta/publico?empresaId=${id}&size=50&sort=id,desc`);
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
  }, [id]);

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';

  const abrirDetalhes = async (ofertaId) => {
    setCarregandoDetalhes(true);
    try {
      const res = await fetch(`${API_URL}/oferta/publico/${ofertaId}`);
      if (res.ok) setDetalhesOferta(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const entrarEmContatoWhatsApp = () => {
    if (!loja?.contatoWhatsapp) {
      alert("Esta loja não disponibilizou um número de WhatsApp.");
      return;
    }
    if (ofertas.length > 0) {
      fetch(`${API_URL}/oferta/publico/${ofertas[0].id}/engajamento`, { method: 'POST' }).catch(console.error);
    }
    const fone = loja.contatoWhatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá! Vi o perfil da sua loja no Deadline e gostaria de saber mais sobre as vossas ofertas ativas.`);
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  if (carregando) return (
    <IonPage><IonContent fullscreen><div className="text-center py-5 mt-5"><div className="spinner-border text-success"></div></div></IonContent></IonPage>
  );
  if (!loja) return (
    <IonPage><IonContent fullscreen><div className="text-center py-5 mt-5 fw-bold text-muted">Loja não encontrada.</div></IonContent></IonPage>
  );

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '40px' }}>
          
          <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
            <div className="container px-3 d-flex justify-content-between align-items-center">
              <Link className="navbar-brand d-flex align-items-center gap-1 fw-bold text-dark text-decoration-none" to="/" style={{ fontSize: '0.9rem' }}>
                <span className="text-success fs-5">←</span> Vitrine
              </Link>
              <img src="/logo_deadline.png" alt="Deadline" style={{ height: '26px' }} />
            </div>
          </nav>

          {/* BANNER E PERFIL COMPACTADOS */}
          <div className="bg-white shadow-sm mb-3">
            <div style={{ height: '110px', background: 'linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-secondary) 100%)' }}></div>
            <div className="container position-relative pb-3 px-3">
              <div className="bg-white rounded-circle shadow d-flex align-items-center justify-content-center overflow-hidden border border-3 border-white position-absolute" 
                   style={{ width: '90px', height: '90px', top: '-45px', left: '15px' }}>
                 {loja.logotipo ? (
                   <img src={loja.logotipo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                 ) : ( <span style={{ fontSize: '2.5rem' }}>🏢</span> )}
              </div>
              
              <div style={{ paddingTop: '50px' }}>
                 <h4 className="fw-bold text-dark m-0">{loja.nomeFantasia}</h4>
                 <div className="d-flex flex-wrap gap-2 mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                    <span>📍 {loja.endereco?.cidade} - {loja.endereco?.uf}</span>
                    <span>🕒 {loja.horarioFuncionamento}</span>
                 </div>
                 <button className="btn btn-sm text-white fw-bold rounded-pill px-3 mt-2 d-flex align-items-center gap-1" 
                         style={{ backgroundColor: '#25D366', fontSize: '0.75rem' }} onClick={entrarEmContatoWhatsApp}>
                    Contatar WhatsApp
                 </button>
              </div>
            </div>
          </div>

          <div className="container px-3">
            <h6 className="fw-bold text-muted mb-2 small">Ofertas desta Farmácia ({ofertas.length})</h6>
            
            {ofertas.length === 0 ? (
              <div className="text-center py-4 bg-white rounded-4 shadow-sm">
                <p className="text-muted small mb-0">Nenhum produto em oferta no momento.</p>
              </div>
            ) : (
              /* GRID DE MINIATURAS DA LOJA - OTIMIZADO PARA MOBILE */
              <div className="row g-2">
                {ofertas.map((oferta) => (
                  <div className="col-6 col-md-4 col-xl-3" key={oferta.id}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ minHeight: '260px' }}>
                      <div className="position-absolute top-0 start-0 m-2 px-2 py-0.5 rounded-3 text-white fw-bold" 
                           style={{ backgroundColor: '#e63946', zIndex: 2, fontSize: '0.7rem' }}>
                        -{oferta.percentualDesconto?.toFixed(0)}%
                      </div>
                      <div className="bg-light text-center p-2 d-flex align-items-center justify-content-center" style={{ height: '110px' }}>
                        {oferta.foto ? (
                          <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : ( <span style={{ fontSize: '2.5rem', opacity: 0.15 }}>📦</span> )}
                      </div>
                      <div className="card-body d-flex flex-column p-2">
                        <h6 className="fw-bold text-dark mb-1 text-truncate small" style={{ fontSize: '0.85rem' }}>{oferta.tituloProduto}</h6>
                        <div className="my-1">
                          <span className="text-muted text-decoration-line-through d-block" style={{ fontSize: '0.7rem' }}>De: {formatarMoeda(oferta.precoOriginal)}</span>
                          <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>Por: {formatarMoeda(oferta.precoPromocional)}</span>
                        </div>
                        <div className="mt-auto pt-2 border-top">
                          <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.65rem' }}>
                            <span className="text-muted">Vence:</span>
                            <span className="fw-bold text-danger">{formatarData(oferta.validadeProduto)}</span>
                          </div>
                          <button className="btn btn-sm text-white fw-bold py-1 px-2 rounded-3 w-100 mt-1" 
                                  style={{ backgroundColor: 'var(--dl-primary)', fontSize: '0.75rem' }} onClick={() => abrirDetalhes(oferta.id)}>
                            Ver
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETALHES DA OFERTA (PERMANECE COM FORMATO MODAL DO ORIGINAL CASO SEJA ACIONADO) */}
          {detalhesOferta && (
            <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow">
                  <div className="modal-header p-3 border-0 bg-light">
                    <h6 className="fw-bold m-0 text-dark">Detalhes da Oferta</h6>
                    <button type="button" className="btn-close" onClick={() => setDetalhesOferta(null)}></button>
                  </div>
                  <div className="modal-body p-3">
                    <div className="text-center bg-light rounded-4 p-2 mb-2" style={{ height: '140px' }}>
                      <img src={detalhesOferta.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <h6 className="fw-bold text-dark text-center mb-2">{detalhesOferta.tituloProduto}</h6>
                    <div className="alert alert-danger py-1.5 text-center small fw-bold mb-2">
                       Vence em: {formatarData(detalhesOferta.validadeProduto)}
                    </div>
                    <div className="text-center mb-3">
                      <span className="text-muted text-decoration-line-through small me-2">De: {formatarMoeda(detalhesOferta.precoOriginal)}</span>
                      <span className="fw-bold text-success fs-5">Por: {formatarMoeda(detalhesOferta.precoPromocional)}</span>
                    </div>
                    <button className="btn text-white w-100 fw-bold py-2 rounded-pill" style={{ backgroundColor: '#25D366' }}
                            onClick={() => window.open(`https://wa.me/55${loja.contatoWhatsapp?.replace(/\D/g, '')}`, '_blank')}>
                      Reservar via WhatsApp
                    </button>
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