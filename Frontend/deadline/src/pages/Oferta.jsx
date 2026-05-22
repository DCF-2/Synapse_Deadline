import React from "react";
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Oferta(){
    return(
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
                    backgroundColor: '#3aad77',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1030
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
                        <Link to="/produtos" className="nav-link active text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}>
                          <span>📦</span> Meus Produtos
                        </Link>
                      </li>
                      <li className="nav-item">
                        <span className="nav-link text-white opacity-75 d-flex align-items-center gap-2" style={{ cursor: 'not-allowed' }}>
                            <link to="/ofertas" href="" className="nav-link active text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}></link>
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
        
                  <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
                              <div>
                                <h2 className="fw-bold text-dark m-0">Meus Produtos</h2>
                                <p className="text-muted small m-0 mt-1">Gerencie todo o catálogo de itens cadastrados</p>
                              </div>
                              <div>
                                <Link to="/cadastrooferta" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#52b788', borderRadius: '10px' }}>
                                  <span>➕</span> Novo Produto
                                </Link>
                              </div>
                            </div>
        
                  {/* Feedbacks Visuais */}
                  {carregando && (
                    <div className="text-center my-5 text-muted">
                      <div className="spinner-border text-success mb-2" role="status"></div>
                      <p>Buscando produtos no banco de dados...</p>
                    </div>
                  )}
        
                  {erro && (
                    <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                      ⚠️ <strong>Não foi possível carregar os produtos:</strong> {erro}
                    </div>
                  )}
        
                  {!carregando && !erro && ofertas.length === 0 && (
                    <div className="text-center my-5 text-muted">
                      <p style={{ fontSize: '3rem' }}>📦</p>
                      <p className="fw-medium">Nenhuma oferta cadastrada para esta empresa.</p>
                    </div>
                  )}
           
                </main>
              </div>
            </div>
    );
}
