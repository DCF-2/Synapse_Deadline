import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share } from '@capacitor/share';

const API_URL = 'https://synapse-deadline.onrender.com';

const OfertaCard = ({ oferta, favoritosIds, handleToggleFavorito, abrirDetalhes, esconderLoja = false }) => {
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

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';
  const formatarDistancia = (dist) => {
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  const isFavorito = favoritosIds.includes(oferta.id);

  const compartilharNativo = async (e, oferta) => {
    e.stopPropagation();
    try {
      await Share.share({
        title: oferta.tituloProduto,
        text: `Confira essa oferta: ${oferta.tituloProduto} por R$ ${oferta.precoPromocional.toFixed(2)} no Kai Ofertas!`,
        url: window.location.origin + `/oferta/${oferta.id}`,
        dialogTitle: 'Compartilhar Oferta'
      });
      fetch(`${API_URL}/oferta/publico/${oferta.id}/engajamento`, { method: 'POST' }).catch(console.error);
    } catch (err) {
      console.error("Erro ao compartilhar nativo:", err);
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ minHeight: '270px', cursor: 'pointer' }} onClick={() => abrirDetalhes(oferta.id)}>
      
      <div className="position-absolute top-0 start-0 m-2 px-2 py-0.5 rounded-3 text-white fw-bold shadow-sm"
        style={{ backgroundColor: '#e63946', zIndex: 2, fontSize: '0.75rem' }}>
        -{oferta.percentualDesconto?.toFixed(0)}%
      </div>

      <div className="position-absolute top-0 end-0 m-2 d-flex flex-column gap-2" style={{ zIndex: 3 }}>
        <div
          className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm"
          style={{ width: '30px', height: '30px', cursor: 'pointer' }}
          onClick={(e) => handleToggleFavorito(oferta.id, e)}
        >
          <img
            src="/icons/favorito.png"
            alt="Favorito"
            style={{
              width: '16px', height: '16px', objectFit: 'contain',
              ...(isFavorito ? { filter: 'saturate(1.5) brightness(0.95)' } : { filter: 'grayscale(100%) opacity(40%)' })
            }}
          />
        </div>
        <div
          className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm"
          style={{ width: '30px', height: '30px', cursor: 'pointer' }}
          onClick={(e) => compartilharNativo(e, oferta)}
        >
          <img
            src="/icons/compartilhar.png"
            alt="Compartilhar"
            style={{ width: '16px', height: '16px', objectFit: 'contain' }}
          />
        </div>
      </div>

      <div className="bg-light text-center p-2 d-flex flex-column align-items-center justify-content-center position-relative" style={{ height: '115px' }}>
        {todasImagens.length > 0 ? (
          <img src={todasImagens[imagemAtualIndex]} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '2.5rem', opacity: 0.15 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "30px", height: "30px", objectFit: "contain" }} /></span>
        )}

        {todasImagens.length > 1 && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-1 d-flex gap-1">
            {todasImagens.map((_, idx) => (
              <div
                key={idx}
                className={`rounded-circle ${idx === imagemAtualIndex ? 'bg-success' : 'bg-secondary'}`}
                style={{ width: '4px', height: '4px', opacity: 0.7, transition: 'all 0.3s' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column p-2">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="text-success fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{oferta.nomeCategoria}</span>
          {oferta.distanciaKm != null && (
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-1.5 py-0.5 d-flex align-items-center gap-1" style={{ fontSize: '0.6rem' }}>
              <img src="/icons/mapa.png" alt="icon" style={{ width: "10px", height: "10px", objectFit: "contain" }} /> {formatarDistancia(oferta.distanciaKm)}
            </span>
          )}
        </div>

        <h6 className="fw-bold text-dark mb-1 text-truncate small" title={oferta.tituloProduto} style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
          {oferta.tituloProduto}
        </h6>

        {!esconderLoja && oferta.nomeFantasiaEmpresa && (
          <div className="d-flex align-items-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
            <Link to={`/loja/${oferta.empresaId}`} className="text-decoration-none text-dark d-flex align-items-center gap-1 d-inline-flex">
              <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden border flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                {oferta.logotipoEmpresa ? (
                  <img src={oferta.logotipoEmpresa} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = '/icons/companhia.png'; }} />
                ) : (
                  <img src="/icons/companhia.png" alt="icon" style={{ width: "12px", height: "12px", objectFit: "contain" }} />
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-muted d-block lh-1" style={{ fontSize: '0.55rem' }}>Vendido por:</span>
                <span className="fw-bold text-dark lh-1 text-truncate d-block" style={{ fontSize: '0.7rem' }}>{oferta.nomeFantasiaEmpresa}</span>
              </div>
            </Link>
          </div>
        )}

        {!(!esconderLoja && oferta.nomeFantasiaEmpresa) && <div className="my-2"></div>}

        <div className="my-1">
          <span className="text-muted text-decoration-line-through d-block" style={{ fontSize: '0.7rem' }}>De: {formatarMoeda(oferta.precoOriginal)}</span>
          <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>Por: {formatarMoeda(oferta.precoPromocional)}</span>
        </div>

        <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
          <div>
            <span className="text-muted d-block" style={{ fontSize: '0.65rem' }}>Vence em:</span>
            <span className="fw-bold text-danger" style={{ fontSize: '0.7rem' }}>{formatarData(oferta.validadeProduto)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfertaCard;
