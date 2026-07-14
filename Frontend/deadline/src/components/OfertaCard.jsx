import React from 'react';
import { Link } from 'react-router-dom';
import BotaoFavorito from './BotaoFavorito';

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
  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift" 
         onClick={() => onClickCard(oferta.id)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
      
      <div className="position-absolute top-0 end-0 m-3" onClick={(e) => e.stopPropagation()}>
        <BotaoFavorito oferta={oferta} />
      </div>

      <div className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3 text-white fw-bold shadow-sm" 
           style={{ backgroundColor: '#e63946', zIndex: 2, fontSize: '0.85rem' }}>
        -{oferta.percentualDesconto?.toFixed(0)}%
      </div>

      <div className="bg-light text-center p-4" style={{ height: '200px' }}>
        {oferta.foto ? (
          <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '4rem', opacity: 0.1 }}>📦</span>
        )}
      </div>
      
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="text-success small fw-bold text-uppercase">{oferta.nomeCategoria}</span>
          {oferta.distanciaKm != null && (
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
              📍 {formatarDistancia(oferta.distanciaKm)}
            </span>
          )}
        </div>
        <h6 className="fw-bold text-dark mb-1 text-truncate" title={oferta.tituloProduto}>{oferta.tituloProduto}</h6>
        
        {!esconderLoja && oferta.nomeFantasiaEmpresa && (
          <Link to={`/loja/${oferta.empresaId}`} 
                className="d-flex align-items-center gap-2 mb-3 text-decoration-none" 
                onClick={(e) => e.stopPropagation()}
                title="Visitar perfil da loja">
            <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden border" style={{width: '36px', height: '36px', flexShrink: 0}}>
               {oferta.logotipoEmpresa ? (
                 <img src={oferta.logotipoEmpresa} alt="Logo" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
               ) : ( <span style={{fontSize: '0.9rem'}}>🏢</span> )}
            </div>
            <div className="overflow-hidden">
              <small className="text-muted d-block fw-bold lh-1 mb-1" style={{fontSize: '0.65rem'}}>Vendido por:</small>
              <span className="fw-bold text-dark lh-1 d-flex align-items-center gap-1 text-truncate" style={{fontSize: '0.85rem'}}>
                 {oferta.nomeFantasiaEmpresa} <span style={{fontSize: '0.8rem'}}>↗️</span>
              </span>
            </div>
          </Link>
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
