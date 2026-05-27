import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const metricas = [
    { id: 1, titulo: "Itens Vendidos", valor: 8, icone: "📦", bgIcone: "#e8f5e9" },
    { id: 2, titulo: "Ofertas Ativas", valor: 8, icone: "📣", bgIcone: "#e8f5e9" },
    { id: 3, titulo: "Urgentes (< 7 dias)", valor: 1, icone: "⚠️", bgIcone: "#ffebee" },
  ];

  const [produtosRecentes, setProdutosRecentes] = useState([
    { id: 1, nome: "Esponja de banho", categoria: "Outros", desconto: "-5%", status: "Ativo" },
    { id: 2, nome: "Lenço umidecido", categoria: "Higiene", desconto: "-10%", status: "Ativo" },
    { id: 3, nome: "Protetor solar", categoria: "Cosméticos", desconto: "-35%", status: "Ativo" },
    { id: 4, nome: "Creatina", categoria: "Suplementos", desconto: "-25%", status: "Ativo" },
    { id: 5, nome: "Dorflex", categoria: "Medicamentos", desconto: "-50%", status: "Ativo" },
    { id: 6, nome: "Fralda calça", categoria: "Higiene", desconto: "-15%", status: "Ativo" },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* BARRA SUPERIOR MOBILE */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#23a889' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>

        {/* MENU LATERAL FIXO (Ocupa 100vh no desktop e não rola) */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{
            backgroundColor: '#23a889',
            height: '100vh',
            position: 'sticky',
            top: 0,
            zIndex: 1030
          }}>

          <div>
            {/* Logo */}
            <div className="d-none d-md-block text-white my-3 ps-2">
              <h4 className="fw-bold d-flex align-items-center gap-2">
                <span>⏱️</span> Deadline
              </h4>
            </div>

            {/* Itens do Menu */}
            <ul className="nav nav-pills flex-column mb-auto mt-4 gap-1">
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link active text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}>
                  <span>📊</span> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                {/* O 'to="/produtos"' aponta para a rota no App.jsx */}
                <Link to="/produtos" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                  <span>📦</span> Meus Produtos
                </Link>
              </li>
              <li className="nav-item">
                  <Link to="/ofertas" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                  <span>📢</span> Minhas Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Rodapé do Menu com o Card de Dica e Botão Sair */}
          <div className="mt-4">
            <div className="p-3 mb-3 text-white rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', fontSize: '13px' }}>
              <p className="fw-bold mb-1">Sabia que...</p>
              <p className="m-0 opacity-90" style={{ lineHeight: '1.4' }}>
                Vender com 50% de desconto ainda é melhor do que descartar e ter prejuízo total?
              </p>
            </div>

            <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-2 border-0" onClick={handleLogout}>
              <span>🚪</span> Sair
            </button>
          </div>
        </nav>

        {/* CONTEÚDO PRINCIPAL COM ROLAGEM INDEPENDENTE */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4"
          style={{
            height: '100vh',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}>

          {/* Título do Topo */}
          <div className="pt-3 pb-2 mb-4">
            <h2 className="fw-bold text-dark m-0">Dashboard</h2>
            <p className="text-muted small m-0 mt-1">Visão geral dos seus produtos e ofertas</p>
          </div>

          {/* GRID DOS 4 CARDS DE MÉTRICAS */}
          <div className="row g-3 mb-5">
            {metricas.map((card) => (
              <div className="col-12 col-sm-6 col-lg-4" key={card.id}>
                <div className="card border-0 shadow-sm rounded-4 p-2">
                  <div className="card-body d-flex justify-content-between align-items-start">
                    <div>
                      <span className="text-muted small fw-medium d-block mb-2">{card.titulo}</span>
                      <h2 className="fw-bold text-dark m-0" style={{ fontSize: '2rem' }}>{card.valor}</h2>
                    </div>
                    <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '40px', height: '40px', backgroundColor: card.bgIcone, fontSize: '1.2rem' }}>
                      {card.icone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SEÇÃO OFERTAS RECENTES */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">Ofertas Recentes</h5>
            <span className="text-success small fw-medium" style={{ cursor: 'pointer' }}>Ver todos</span>
          </div>

          <div className="row g-3">
            {produtosRecentes.map((produto) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-2" key={produto.id}>
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden" style={{ minHeight: '260px' }}>

                  <span className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3 text-white fw-bold small"
                    style={{ backgroundColor: '#ff7a00', fontSize: '12px', zIndex: 2 }}>
                    {produto.desconto}
                  </span>

                  <span className="position-absolute top-0 end-0 m-3 px-2 py-1 rounded-5 text-success fw-bold"
                    style={{ backgroundColor: '#e8f5e9', fontSize: '11px', zIndex: 2 }}>
                    {produto.status}
                  </span>

                  <div className="card-body d-flex flex-column justify-content-between p-3 pt-5">
                    <div className="d-flex justify-content-center align-items-center flex-grow-1 my-4">
                      <span style={{ fontSize: '4rem', opacity: 0.15 }}>📦</span>
                    </div>

                    <div className="mt-2">
                      <span className="text-muted small d-block">{produto.categoria}</span>
                    </div>
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