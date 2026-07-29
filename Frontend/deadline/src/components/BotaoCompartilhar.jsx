import React, { useState, useRef, useEffect } from 'react';
import { useModal } from '../contexts/ModalContext';

export default function BotaoCompartilhar({ oferta, className = '', style = {} }) {
  const { showAlert } = useModal();
  const [aberto, setAberto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickFora(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setAberto(!aberto);
  };

  const getLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/oferta/${oferta.id}`;
  };

  const textoCompartilhamento = `Veja essa oferta no Kai Ofertas: ${oferta.tituloProduto} por apenas R$ ${oferta.precoPromocional?.toFixed(2)}!`;

  const compartilhar = (tipo, e) => {
    e.stopPropagation();
    e.preventDefault();
    const link = encodeURIComponent(getLink());
    const texto = encodeURIComponent(textoCompartilhamento);
    
    switch (tipo) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${texto}%20${link}`, '_blank');
        break;
      case 'facebook':
        navigator.clipboard.writeText(`${textoCompartilhamento} ${getLink()}`);
        showAlert('Sucesso', 'Link e texto copiados! Cole no chat do Messenger.');
        window.open('https://www.messenger.com/', '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${texto}&url=${link}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${textoCompartilhamento} ${getLink()}`);
        showAlert('Sucesso', 'Link e texto copiados! Você será redirecionado para o Direct do Instagram.');
        window.open('https://www.instagram.com/direct/inbox/', '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent("Olha essa oferta no Kai Ofertas!")}&body=${texto}%20${link}`, '_blank');
        break;
      case 'copiar':
        navigator.clipboard.writeText(`${textoCompartilhamento} ${getLink()}`);
        showAlert('Sucesso', 'Link copiado para a área de transferência!');
        break;
      default:
        break;
    }
    setAberto(false);
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        className={`btn btn-sm rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center ${className}`}
        style={{
          width: '36px',
          height: '36px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          zIndex: 3,
          ...style,
        }}
        title="Compartilhar"
        onClick={toggle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#adb5bd" viewBox="0 0 16 16">
          <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
        </svg>
      </button>

      {aberto && (
        <div className="position-absolute bg-white shadow rounded-3 py-2" style={{ top: '100%', right: '0', minWidth: '160px', zIndex: 10 }}>
          <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={(e) => compartilhar('whatsapp', e)}>
            <span><img src="/icons/whatsapp.png" alt="WhatsApp" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> WhatsApp
          </button>
          <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={(e) => compartilhar('copiar', e)}>
            <span><img src="/icons/lista-de-controle.png" alt="Copiar" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> Copiar link
          </button>
          <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={(e) => compartilhar('twitter', e)}>
            <span><img src="/icons/twitter.png" alt="X (Twitter)" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> X
          </button>
          <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={(e) => compartilhar('instagram', e)}>
            <span><img src="/icons/instagram.png" alt="Instagram" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> Instagram
          </button>
          <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={(e) => compartilhar('facebook', e)}>
            <span><img src="/icons/facebook.png" alt="Facebook" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> Facebook
          </button>
          <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={(e) => compartilhar('email', e)}>
            <span><img src="/icons/e-mail.png" alt="E-mail" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> E-mail
          </button>
        </div>
      )}
    </div>
  );
}
