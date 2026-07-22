import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies anteriormente
    const consent = localStorage.getItem('deadline_cookies_accepted');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('deadline_cookies_accepted', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="position-fixed bottom-0 start-0 w-100 p-3" 
      style={{ zIndex: 9999, pointerEvents: 'none' }}
    >
      <div 
        className="container bg-white rounded-4 shadow-lg border p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
        style={{ pointerEvents: 'auto', maxWidth: '800px', margin: '0 auto' }}
      >
        <div className="d-flex align-items-start gap-3">
          <div className="fs-2 lh-1">🍪</div>
          <div>
            <h6 className="fw-bold mb-1 text-dark">Nós usamos cookies</h6>
            <p className="text-muted mb-0 small">
              O Deadline utiliza cookies e outras tecnologias para garantir o funcionamento 
              do site, medir o desempenho e personalizar sua experiência. 
              Ao continuar navegando, você concorda com nosso uso de cookies.
            </p>
          </div>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2 flex-shrink-0">
          <button 
            className="btn btn-dark fw-bold rounded-pill px-4 py-2 shadow-sm"
            onClick={handleAccept}
          >
            Aceitar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
