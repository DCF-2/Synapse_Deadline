import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';
import { obterFavoritos, contarFavoritos } from '../utils/favoritos';
import BotaoFavorito from '../components/BotaoFavorito';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);

  const recarregar = () => setFavoritos(obterFavoritos());

  useEffect(() => {
    recarregar();
    window.addEventListener('favoritos-atualizados', recarregar);
    return () => window.removeEventListener('favoritos-atualizados', recarregar);
  }, []);

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';
  const total = contarFavoritos();

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
          <Link to="/" className="btn btn-light rounded-pill px-3">← Voltar</Link>
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
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                  <div className="position-absolute top-0 end-0 m-3">
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
                    <span className="text-success small fw-bold text-uppercase mb-1">{oferta.nomeCategoria}</span>
                    <h6 className="fw-bold text-dark mb-1 text-truncate" title={oferta.tituloProduto}>{oferta.tituloProduto}</h6>
                    {oferta.nomeFantasiaEmpresa && (
                      <small className="text-muted mb-2 d-block">{oferta.nomeFantasiaEmpresa}</small>
                    )}

                    <div className="mb-3">
                      <span className="text-muted text-decoration-line-through small d-block">De: {formatarMoeda(oferta.precoOriginal)}</span>
                      <span className="fw-bold text-dark fs-4">Por: {formatarMoeda(oferta.precoPromocional)}</span>
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Vence em:</small>
                        <span className="fw-bold text-danger small">{formatarData(oferta.validadeProduto)}</span>
                      </div>
                      {oferta.empresaId && (
                        <Link to={`/loja/${oferta.empresaId}`} className="btn btn-sm btn-outline-success fw-bold px-3 rounded-pill">
                          Ver loja
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
