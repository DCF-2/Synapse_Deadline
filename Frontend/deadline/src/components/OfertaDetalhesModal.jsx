import React from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const formatarMoeda = (valor) => {
  if (valor == null) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatarDistancia = (km) => {
  if (km == null) return '';
  return km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`;
};

const formatarData = (dataStr) => {
  if (!dataStr) return '';
  const data = new Date(dataStr + 'T00:00:00'); // Garante fuso horário local
  return data.toLocaleDateString('pt-BR');
};

const abrirMapa = (oferta) => {
  fetch(`${API_URL}/api/publico/metricas/ofertas/${oferta.id}/engajamento/como_chegar`, { method: 'POST' }).catch(console.error);
  
  const end = oferta.enderecoEmpresa;
  if (!end || !end.logradouro) {
    alert("Esta oferta não possui informações detalhadas de endereço.");
    return;
  }
  const query = encodeURIComponent(`${end.logradouro}, ${end.numero} - ${end.bairro}, ${end.cidade} - ${end.uf}`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
};

const abrirWhatsApp = (oferta) => {
  // 1. Registra o engajamento silenciosamente no backend
  fetch(`${API_URL}/api/publico/metricas/ofertas/${oferta.id}/engajamento/whatsapp`, { method: 'POST' }).catch(console.error);
  
  // 2. Abre o WhatsApp com texto pronto
  const fone = oferta.contatoWhatsapp?.replace(/\D/g, ''); // Limpa formatação
  const mensagem = encodeURIComponent(`Olá! Vi a oferta do produto "${oferta.tituloProduto}" por R$ ${oferta.precoPromocional?.toFixed(2)} no Deadline. Ainda está disponível?`);
  window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
};

const abrirEmail = (oferta) => {
  // Regista o clique também para o lojista saber que houve interesse!
  fetch(`${API_URL}/api/publico/metricas/ofertas/${oferta.id}/engajamento/email`, { method: 'POST' }).catch(console.error);
  
  if (!oferta.emailContato) {
    alert("Este lojista não disponibilizou um e-mail de contacto.");
    return;
  }
  
  const assunto = encodeURIComponent(`Interesse na oferta: ${oferta.tituloProduto}`);
  const corpo = encodeURIComponent(`Olá, vi a oferta do produto "${oferta.tituloProduto}" por R$ ${oferta.precoPromocional?.toFixed(2)} no Deadline e gostaria de mais informações ou reservar a minha unidade.`);
  window.open(`mailto:${oferta.emailContato}?subject=${assunto}&body=${corpo}`, '_blank');
};

const OfertaDetalhesModal = ({ detalhesOferta, onClose }) => {
  if (!detalhesOferta) return null;

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          
          <div className="modal-header border-0 bg-light p-4">
            <Link to={`/loja/${detalhesOferta.empresaId}`} className="d-flex align-items-center gap-3 text-decoration-none" title="Visitar perfil da loja" onClick={(e) => {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
              fetch(`${apiUrl}/api/publico/metricas/empresas/${detalhesOferta.empresaId}/engajamento/perfil`, { method: 'POST' }).catch(() => {});
              onClose();
            }}>
              <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden border" style={{width: '50px', height: '50px'}}>
                 {detalhesOferta.logotipoEmpresa ? (
                   <img src={detalhesOferta.logotipoEmpresa} alt="Logo" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                 ) : ( <span className="fw-bold text-success"><img src="/icons/companhia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> )}
              </div>
              <div>
                <small className="text-muted d-block fw-bold" style={{fontSize: '0.75rem'}}>Vendido e entregue por:</small>
                <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2 hover-primary" style={{ transition: 'color 0.2s' }}>
                   {detalhesOferta.nomeFantasiaEmpresa}
                </h5>
              </div>
            </Link>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              <div className="col-md-5 text-center">
                <div className="bg-light rounded-4 p-3 mb-3 d-flex align-items-center justify-content-center border" style={{ height: '220px' }}>
                  {detalhesOferta.foto ? (
                    <img src={detalhesOferta.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '4rem', opacity: 0.1 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-25">
                  <div className="text-start">
                    <span className="text-muted text-decoration-line-through small d-block">{formatarMoeda(detalhesOferta.precoOriginal)}</span>
                    <h3 className="fw-bold text-success m-0">{formatarMoeda(detalhesOferta.precoPromocional)}</h3>
                  </div>
                  <div className="badge bg-danger fs-6 rounded-3">-{detalhesOferta.percentualDesconto?.toFixed(0)}%</div>
                </div>
                <div className="alert alert-danger small mt-2 py-2 px-3 mb-0 text-start d-flex align-items-start gap-2 border-0 bg-danger bg-opacity-10 text-danger">
                  <span className="mt-1"><img src="/icons/notificacao.png" alt="aviso" style={{ width: "16px", height: "16px", objectFit: "contain" }} /></span>
                  <div>
                    <strong>Confirmação de Disponibilidade:</strong><br/>
                    Contate a empresa para confirmar a disponibilidade do item antes de se deslocar.
                  </div>
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
                  <h6 className="fw-bold text-dark mb-3"><span className="text-success me-2"><img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> Informações de Retirada</h6>
                  {detalhesOferta.distanciaKm != null && (
                    <p className="small fw-bold text-primary mb-2">
                      Distância de você: {formatarDistancia(detalhesOferta.distanciaKm)}
                    </p>
                  )}
                  <p className="small text-muted mb-2">
                    <strong>Endereço: </strong> 
                    {detalhesOferta.enderecoEmpresa?.logradouro}, {detalhesOferta.enderecoEmpresa?.numero} - {detalhesOferta.enderecoEmpresa?.bairro}, {detalhesOferta.enderecoEmpresa?.cidade}/{detalhesOferta.enderecoEmpresa?.uf}
                  </p>
                  <p className="small text-muted mb-2">
                    <strong>Horário: </strong> {detalhesOferta.horarioFuncionamento}
                  </p>
                  <div className="alert alert-warning small py-2 mb-0 d-flex align-items-start gap-2">
                    <span className="mt-1">📋</span>
                    <div>
                      <strong>Instruções do Lojista:</strong><br/>
                      {detalhesOferta.instrucoesRetirada}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-light p-3 d-flex flex-wrap gap-2">
             <button className="btn btn-outline-dark fw-bold rounded-pill px-4 flex-grow-1 d-flex align-items-center justify-content-center gap-2" onClick={() => abrirMapa(detalhesOferta)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                </svg>
                Como Chegar
             </button>
             
             <div className="d-flex gap-2 flex-grow-1">
               <button className="btn text-white fw-bold rounded-pill px-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                       style={{backgroundColor: '#25D366'}} onClick={() => abrirWhatsApp(detalhesOferta)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                  WhatsApp
               </button>
               
               <button className="btn text-white fw-bold rounded-pill px-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                       style={{backgroundColor: '#0d6efd'}} onClick={() => abrirEmail(detalhesOferta)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
                  </svg>
                  E-mail
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfertaDetalhesModal;
