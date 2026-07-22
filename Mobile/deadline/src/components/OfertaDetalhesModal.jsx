import React from 'react';
import { Link } from 'react-router-dom';
import { Share } from '@capacitor/share';

const API_URL = import.meta.env.VITE_API_URL;

export default function OfertaDetalhesModal({ detalhesOferta, setDetalhesOferta, formatarMoeda, formatarData }) {
  if (!detalhesOferta) return null;

  const formatarDistanciaLocal = (dist) => {
    if (dist == null) return '';
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

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

  const compartilharNativo = async (oferta) => {
    try {
      await Share.share({
        title: oferta.tituloProduto,
        text: `Confira essa oferta: ${oferta.tituloProduto} por R$ ${oferta.precoPromocional.toFixed(2)} no Deadline!`,
        url: window.location.origin + `/oferta/${oferta.id}`,
        dialogTitle: 'Compartilhar Oferta'
      });
      fetch(`${API_URL}/oferta/publico/${oferta.id}/engajamento`, { method: 'POST' }).catch(console.error);
    } catch (err) {
      console.error("Erro ao compartilhar nativo:", err);
    }
  };

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div className="modal-header border-0 bg-light p-3">
            <Link to={`/loja/${detalhesOferta.empresaId}`} className="d-flex align-items-center gap-2 text-decoration-none">
              <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '40px', height: '40px' }}>
                {detalhesOferta.logotipoEmpresa ? (
                  <img src={detalhesOferta.logotipoEmpresa} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (<span className="fw-bold text-success"><img src="/icons/loja.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain" }} /></span>)}
              </div>
              <div>
                <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>Vendido por:</small>
                <h6 className="fw-bold text-dark m-0 small d-flex align-items-center gap-1">
                  {detalhesOferta.nomeFantasiaEmpresa}
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
                  ) : (<span style={{ fontSize: '3rem', opacity: 0.15 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "40px", height: "40px", objectFit: "contain" }} /></span>)}
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
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-success fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>{detalhesOferta.nomeCategoria}</span>
                  {detalhesOferta.distanciaKm != null && (
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                      <img src="/icons/mapa.png" alt="icon" style={{ width: "12px", height: "12px", objectFit: "contain" }} /> {formatarDistanciaLocal(detalhesOferta.distanciaKm)}
                    </span>
                  )}
                </div>
                <h5 className="fw-bold text-dark mb-1">{detalhesOferta.tituloProduto}</h5>
                <p className="text-muted small mb-3">{detalhesOferta.descricao || "Sem descrição disponível."}</p>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 border rounded-3 bg-light text-center">
                      <small className="text-muted fw-bold d-block" style={{ fontSize: '0.6rem' }}>PRODUTO VENCE EM</small>
                      <span className="fw-bold text-danger small">{formatarData(detalhesOferta.validadeProduto)}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 border rounded-3 bg-light text-center">
                      <small className="text-muted fw-bold d-block" style={{ fontSize: '0.6rem' }}>OFERTA ENCERRA EM</small>
                      <span className="fw-bold text-dark small">{formatarData(detalhesOferta.dataFimOferta)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-2 border-top">
                  <h6 className="fw-bold text-dark small mb-1"><img src="/icons/mapa.png" alt="icon" style={{ width: "14px", height: "14px", objectFit: "contain", marginRight: "4px" }} /> Retirada</h6>
                  {detalhesOferta.distanciaKm != null && (
                    <p className="small fw-bold text-primary mb-1" style={{ fontSize: '0.75rem' }}>
                      Distância de você: {formatarDistanciaLocal(detalhesOferta.distanciaKm)}
                    </p>
                  )}
                  <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                    {detalhesOferta.enderecoEmpresa?.logradouro}, {detalhesOferta.enderecoEmpresa?.numero} - {detalhesOferta.enderecoEmpresa?.bairro}
                  </p>
                  <div className="alert alert-warning small py-1.5 px-2 mb-2 d-flex gap-1" style={{ fontSize: '0.75rem' }}>
                    <span><img src="/icons/lista-de-controle.png" alt="icon" style={{ width: "14px", height: "14px", objectFit: "contain" }} /></span>
                    <div><strong>Instruções:</strong> {detalhesOferta.instrucoesRetirada}</div>
                  </div>
                  <div className="alert alert-danger small py-1.5 px-2 mb-0 d-flex gap-1 border-0 bg-danger bg-opacity-10 text-danger" style={{ fontSize: '0.75rem' }}>
                    <span><img src="/icons/notificacao.png" alt="icon" style={{ width: "14px", height: "14px", objectFit: "contain" }} /></span>
                    <div><strong>Confirmação de Disponibilidade:</strong> Contate a empresa para confirmar a disponibilidade do item antes de se deslocar.</div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-sm btn-outline-dark fw-bold rounded-pill flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.8rem' }} onClick={() => abrirMapa(detalhesOferta)}>
                    <img src="/icons/mapa.png" alt="Mapa" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> Mapa
                  </button>
                  <button className="btn btn-sm btn-outline-success fw-bold rounded-pill flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.8rem' }} onClick={() => abrirWhatsApp(detalhesOferta)}>
                    <img src="/icons/whatsapp.png" alt="WhatsApp" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> WhatsApp
                  </button>
                  <button className="btn btn-sm btn-outline-primary fw-bold rounded-pill flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.8rem' }} onClick={() => compartilharNativo(detalhesOferta)}>
                    <img src="/icons/compartilhar.png" alt="Share" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
