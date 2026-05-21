import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProdutosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mocks dos produtos cadastrados na plataforma
  const [produtos, setProdutos] = useState([
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
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#52b788' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>

        {/* MENU LATERAL FIXO */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{
            backgroundColor: '#52b788',
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
                <Link to="/dashboard" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                  <span>📊</span> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                {/* Agora ativo apontando para si mesmo ou rota correspondente */}
                <Link to="/produtos" className="nav-link active text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}>
                  <span>📦</span> Meus Produtos
                </Link>
              </li>
              <li className="nav-item">
                <span className="nav-link text-white opacity-75 d-flex align-items-center gap-2" style={{ cursor: 'not-allowed' }}>
                  <span>📢</span> Minhas Ofertas
                </span>
              </li>
              <li className="nav-item">
                <span className="nav-link text-white opacity-75 d-flex align-items-center gap-2" style={{ cursor: 'not-allowed' }}>
                  <span>👤</span> Meu Perfil
                </span>
              </li>
            </ul>
          </div>

          {/* Rodapé do Menu */}
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

          {/* Topo da Página com Título à Esquerda e Botão de Cadastro alinhado à Direita */}
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Meus Produtos</h2>
              <p className="text-muted small m-0 mt-1">Gerencie todo o catálogo de itens cadastrados</p>
            </div>
            <div>
              {/* Botão de ação direta para o cadastro */}
              <Link to="/cadastro" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#52b788', borderRadius: '10px' }}>
                <span>➕</span> Novo Produto
              </Link>
            </div>
          </div>

          {/* GRID COMPLETO DE PRODUTOS */}
          <div className="row g-3">
            {produtos.map((produto) => (
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
                      <span className="fw-bold text-dark d-block mb-1">{produto.nome}</span>
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