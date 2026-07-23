import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';
import { obterFavoritos, contarFavoritos } from '../utils/favoritos';
import BotaoFavorito from '../components/BotaoFavorito';
import OfertaCard from '../components/OfertaCard';
import OfertaDetalhesModal from '../components/OfertaDetalhesModal';
import Footer from '../components/Footer';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [detalhesOferta, setDetalhesOferta] = useState(null);

  const recarregar = () => setFavoritos(obterFavoritos());

  useEffect(() => {
    recarregar();
    window.addEventListener('favoritos-atualizados', recarregar);
    return () => window.removeEventListener('favoritos-atualizados', recarregar);
  }, []);

  const total = contarFavoritos();

  const abrirDetalhes = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${API_URL}/api/publico/ofertas/${id}`); // Tenta rota pública
      
      // Ajuste caso a rota seja diferente
      const response = res.ok ? res : await fetch(`${API_URL}/oferta/publico/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDetalhesOferta(data);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--dl-background)', minHeight: '100vh' }}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src="/logo_deadline.png" alt="Deadline" style={{ height: '35px' }} />
          </Link>
          <div className="d-flex gap-2 align-items-center">
            <Link to="/favoritos" className="btn btn-warning fw-bold rounded-pill px-3 d-flex align-items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.05-.372.602-.372.652 0l1.847 3.65 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
              </svg>
              Favoritos
              {total > 0 && <span className="badge bg-dark rounded-pill">{total}</span>}
            </Link>
            <Link to="/auth" className="btn btn-outline-success fw-bold rounded-pill px-4">Entrar / Sou Empresa</Link>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Link to="/" className="btn btn-light rounded-pill px-3"><img src="/icons/voltar.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Voltar</Link>
          <div>
            <h2 className="fw-bold text-dark m-0">Meus Favoritos</h2>
            <p className="text-muted mb-0 small">Ofertas salvas no seu navegador</p>
          </div>
        </div>

        {favoritos.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <span style={{ fontSize: '4rem' }}>⭐</span>
            <h5 className="fw-bold mt-3 text-dark">Nenhum favorito ainda</h5>
            <p className="text-muted">Clique na estrela ao lado de uma oferta para salvá-la aqui.</p>
            <Link to="/" className="btn text-white fw-bold rounded-pill px-4 mt-2" style={{ backgroundColor: 'var(--dl-primary)' }}>
              Ver ofertas
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favoritos.map((oferta) => (
              <div className="col-12 col-md-6 col-xl-4" key={oferta.id}>
                <OfertaCard 
                  oferta={oferta} 
                  onClickCard={abrirDetalhes} 
                  esconderLoja={false} 
                />
                <div className="mt-2 text-end">
                  {oferta.empresaId && (
                    <Link to={`/loja/${oferta.empresaId}`} className="btn btn-sm btn-outline-success fw-bold px-3 rounded-pill w-100">
                      Ir para a loja
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OfertaDetalhesModal
        detalhesOferta={detalhesOferta}
        onClose={() => setDetalhesOferta(null)}
      />
      <Footer />
    </div>
  );
}
