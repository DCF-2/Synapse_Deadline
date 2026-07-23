import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BotaoFavorito from './BotaoFavorito';
import BotaoCompartilhar from './BotaoCompartilhar';

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

const OfertaCard = ({ oferta, onClickCard, esconderLoja = false }) => {
  const [imagemAtualIndex, setImagemAtualIndex] = useState(0);

  const todasImagens = [oferta.foto, ...(oferta.fotosAdicionais || [])].filter(Boolean);

  useEffect(() => {
    if (todasImagens.length > 1) {
      const interval = setInterval(() => {
        setImagemAtualIndex((prev) => (prev + 1) % todasImagens.length);
      }, 3000); // Muda de imagem a cada 3 segundos
      return () => clearInterval(interval);
    }
  }, [todasImagens.length]);

  const imagemExibida = todasImagens.length > 0 ? todasImagens[imagemAtualIndex] : null;

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 position-relative hover-lift" 
         onClick={() => {
           onClickCard(oferta.id);
           const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
           fetch(`${apiUrl}/api/publico/metricas/ofertas/${oferta.id}/engajamento/detalhe`, { method: 'POST' }).catch(() => {});
         }} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
      
      <div className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2" style={{ zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}><BotaoFavorito oferta={oferta} /></div>
        <div style={{ pointerEvents: 'auto' }}><BotaoCompartilhar oferta={oferta} /></div>
      </div>

      <div className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3 text-white fw-bold shadow-sm" 
           style={{ backgroundColor: '#e63946', zIndex: 2, fontSize: '0.85rem' }}>
        -{oferta.percentualDesconto?.toFixed(0)}%
      </div>

      <div className="bg-light text-center p-4 rounded-top-4 position-relative" style={{ height: '200px' }}>
        {imagemExibida ? (
          <img src={imagemExibida} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '4rem', opacity: 0.1 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
        )}
        
        {todasImagens.length > 1 && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1">
            {todasImagens.map((_, idx) => (
              <div 
                key={idx} 
                className={`rounded-circle ${idx === imagemAtualIndex ? 'bg-success' : 'bg-secondary'}`}
                style={{ width: '6px', height: '6px', opacity: 0.7, transition: 'all 0.3s' }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="text-success small fw-bold text-uppercase">{oferta.nomeCategoria}</span>
          {oferta.distanciaKm != null && (
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
              <img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {formatarDistancia(oferta.distanciaKm)}
            </span>
          )}
        </div>
        <h6 className="fw-bold text-dark mb-1 text-truncate" title={oferta.tituloProduto}>{oferta.tituloProduto}</h6>
        
        {!esconderLoja && oferta.nomeFantasiaEmpresa && (
          <div className="mb-3 d-flex flex-column align-items-start">
            <small className="text-muted d-block fw-bold lh-1 mb-1" style={{fontSize: '0.65rem'}}>Vendido por:</small>
            <Link to={`/loja/${oferta.empresaId}`} 
                  className="d-inline-flex align-items-center gap-2 text-decoration-none" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                    fetch(`${apiUrl}/api/publico/metricas/empresas/${oferta.empresaId}/engajamento/perfil`, { method: 'POST' }).catch(() => {});
                  }}
                  title="Visitar perfil da loja">
              <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden border" style={{width: '28px', height: '28px', flexShrink: 0}}>
                 {oferta.logotipoEmpresa ? (
                   <img src={oferta.logotipoEmpresa} alt="Logo" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} onError={(e) => { e.target.onerror = null; e.target.src = '/icons/companhia.png'; }} />
                 ) : ( <span style={{fontSize: '0.7rem'}}><img src="/icons/companhia.png" alt="icon" style={{ width: "16px", height: "16px", objectFit: "contain" }} /></span> )}
              </div>
              <span className="fw-bold text-dark lh-1 text-truncate" style={{fontSize: '0.85rem'}}>
                 {oferta.nomeFantasiaEmpresa}
              </span>
            </Link>
          </div>
        )}

        {!(!esconderLoja && oferta.nomeFantasiaEmpresa) && <div className="mb-3"></div>}
        
        <div className="mb-3 mt-auto">
          <span className="text-muted text-decoration-line-through small d-block">De: {formatarMoeda(oferta.precoOriginal)}</span>
          <span className="fw-bold text-dark fs-4">Por: {formatarMoeda(oferta.precoPromocional)}</span>
        </div>
        
        <div className="pt-3 border-top d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Vence em:</small>
            <span className="fw-bold text-danger small">{formatarData(oferta.validadeProduto)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfertaCard;
