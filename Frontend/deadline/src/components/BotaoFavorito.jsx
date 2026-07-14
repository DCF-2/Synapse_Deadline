import React, { useState, useEffect } from 'react';
import { isFavorito, alternarFavorito } from '../utils/favoritos';

export default function BotaoFavorito({ oferta, className = '', style = {}, onChange }) {
  const [favorito, setFavorito] = useState(() => isFavorito(oferta.id));

  useEffect(() => {
    const atualizar = () => setFavorito(isFavorito(oferta.id));
    atualizar();
    window.addEventListener('favoritos-atualizados', atualizar);
    return () => window.removeEventListener('favoritos-atualizados', atualizar);
  }, [oferta.id]);

  const toggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const agoraFavorito = alternarFavorito(oferta);
    setFavorito(agoraFavorito);
    onChange?.(agoraFavorito);
  };

  return (
    <button
      type="button"
      className={`btn btn-sm rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center ${className}`}
      style={{
        width: '36px',
        height: '36px',
        backgroundColor: favorito ? '#ffc107' : 'rgba(255,255,255,0.95)',
        zIndex: 3,
        ...style,
      }}
      title={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      onClick={toggle}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill={favorito ? '#fff' : '#adb5bd'} viewBox="0 0 16 16">
        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.05-.372.602-.372.652 0l1.847 3.65 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
      </svg>
    </button>
  );
}
