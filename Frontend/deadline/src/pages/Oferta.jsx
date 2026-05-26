import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Oferta() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  const carregarOfertas = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const token = localStorage.getItem('deadline_token');
      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(`${API_URL}/oferta/empresa`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: não foi possível carregar as ofertas.`);
      }

      const data = await response.json();
      setOfertas(Array.isArray(data) ? data : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOfertas();
  }, []);

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
      return '—';
    }

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#52b788' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{
            backgroundColor: '#3aad77',
            height: '100vh',
            position: 'sticky',
            top: 0,
            zIndex: 1030,
          }}>
          <div>
            <div className="d-none d-md-block text-white my-3 ps-2">
              <h4 className="fw-bold d-flex align-items-center gap-2">
                <span>⏱️</span> Deadline
              </h4>
            </div>

            <ul className="nav nav-pills flex-column mb-auto mt-4 gap-1">
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                  <span>📊</span> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/produtos" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                  <span>📦</span> Meus Produtos
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ofertas" className="nav-link active text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}>
                  <span>📢</span> Minhas Ofertas
                </Link>
              </li>
              <li className="nav-item">
                <span className="nav-link text-white opacity-75 d-flex align-items-center gap-2" style={{ cursor: 'not-allowed' }}>
                  <span>👤</span> Meu Perfil
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <div className="p-3 mb-3 text-white rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '13px' }}>
              <p className="fw-bold mb-1">Sabia que...</p>
              <p className="m-0 opacity-90" style={{ lineHeight: '1.4' }}>
                Promover itens com data de validade próxima reduz perdas e aumenta o giro do estoque.
              </p>
            </div>

            <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-2 border-0" onClick={handleLogout}>
              <span>🚪</span> Sair
            </button>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Minhas Ofertas</h2>
              <p className="text-muted small m-0 mt-1">Gerencie as promoções criadas para seus produtos.</p>
            </div>
            <div>
              <Link to="/nova-oferta" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#52b788', borderRadius: '10px' }}>
                <span>➕</span> Nova Oferta
              </Link>
            </div>
          </div>

          {carregando && (
            <div className="text-center my-5 text-muted">
              <div className="spinner-border text-success mb-2" role="status"></div>
              <p>Buscando ofertas cadastradas...</p>
            </div>
          )}

          {erro && (
            <div className="alert alert-danger shadow-sm rounded-3" role="alert">
              ⚠️ <strong>Não foi possível carregar as ofertas:</strong> {erro}
            </div>
          )}

          {!carregando && !erro && ofertas.length === 0 && (
            <div className="text-center my-5 text-muted">
              <p style={{ fontSize: '3rem' }}>📣</p>
              <p className="fw-medium">Nenhuma oferta cadastrada para esta empresa.</p>
            </div>
          )}

          <div className="row g-3">
            {!carregando && !erro && ofertas.map((oferta) => (
              <div className="col-12 col-md-6 col-lg-4" key={oferta.id}>
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-center align-items-center mb-3" style={{ minHeight: '90px' }}>
                      {oferta.foto ? (
                        <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '3.5rem', opacity: 0.15 }}>📣</span>
                      )}
                    </div>
                    <p className="fw-bold text-dark mb-1">{oferta.tituloProduto || 'Produto sem nome'}</p>
                    <p className="text-muted small mb-3">{oferta.nomeCategoria || 'Categoria não informada'}</p>
                    <div className="small text-muted mb-2">Preço original: {formatarMoeda(oferta.precoOriginal)}</div>
                    <div className="fw-bold text-success mb-2">Preço promocional: {formatarMoeda(oferta.precoPromocional)}</div>
                    <div className="small text-muted mb-2">Desconto: {oferta.percentualDesconto ? `${oferta.percentualDesconto.toFixed(0)}%` : '—'}</div>
                    <div className="small text-muted mb-2">Validade do produto: {oferta.validadeProduto ? new Date(`${oferta.validadeProduto}T00:00:00`).toLocaleDateString('pt-BR') : '—'}</div>
                    <div className="small text-muted">Fim da oferta: {oferta.dataFimOferta ? new Date(`${oferta.dataFimOferta}T00:00:00`).toLocaleDateString('pt-BR') : '—'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}