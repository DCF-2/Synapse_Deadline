import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProdutoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let ativo = true;

    const carregarProduto = async () => {
      try {
        setLoading(true);
        setErro(null);

        const token = localStorage.getItem('deadline_token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch(`${API_URL}/produto/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
           if(response.status === 401 || response.status === 403){
               navigate('/auth');
               return;
           }
          throw new Error(`Erro ${response.status}: não foi possível carregar os detalhes.`);
        }

        const data = await response.json();

        if (ativo) {
          setProduto(data);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    carregarProduto();

    return () => {
      ativo = false;
    };
  }, [id, navigate]);

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  const formatarData = (valor) => {
    if (!valor) return 'Não aplicável';
    return new Date(`${valor}T00:00:00`).toLocaleDateString('pt-BR');
  };

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    navigate('/auth');
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* HEADER MOBILE */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#52b788' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1">
        {/* SIDEBAR FIXA */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ backgroundColor: '#3aad77', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
          <div>
            <div className="d-none d-md-block text-white my-3 ps-2">
              <h4 className="fw-bold d-flex align-items-center gap-2">⏱️ Deadline</h4>
            </div>
            <ul className="nav flex-column mt-4">
              <li><Link to="/dashboard" className="nav-link text-white opacity-75">📊 Dashboard</Link></li>
              <li><Link to="/produtos" className="nav-link text-white fw-bold">📦 Meus Produtos</Link></li>
              <li><Link to="/ofertas" className="nav-link text-white opacity-75">📢 Minhas Ofertas</Link></li>
            </ul>
          </div>
          <div className="mt-4">
            <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-2 border-0" onClick={handleLogout}>
              <span>🚪</span> Sair
            </button>
          </div>
        </nav>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button onClick={() => navigate('/produtos')} className="btn btn-link text-muted text-decoration-none ps-0 fw-bold">
              ← Voltar para produtos
            </button>
          </div>

          {loading && (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <p className="mb-0">Carregando detalhes do produto...</p>
            </div>
          )}

          {erro && (
            <div className="alert alert-danger rounded-4 shadow-sm border-0">
              ⚠️ {erro}
            </div>
          )}

          {!loading && !erro && produto && (
            <div className="row g-4 align-items-start">
              
              {/* Coluna da Imagem */}
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ height: '400px' }}>
                  {!produto.ativo && (
                    <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 2 }}>
                       <span className="badge bg-danger fs-5 px-4 py-2 rounded-pill shadow-sm">INATIVO</span>
                    </div>
                  )}
                  {produto.foto ? (
                    <img src={produto.foto} alt={produto.tituloProduto} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center w-100 h-100" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
                      <span style={{ fontSize: '6rem', opacity: 0.3 }}>📦</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna dos Detalhes */}
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-4 p-4 p-lg-5 h-100">
                  <span className="badge bg-success-subtle text-success fw-semibold mb-3 fs-6" style={{ width: 'fit-content' }}>
                    {produto.nomeCategoria || 'Sem Categoria'}
                  </span>
                  
                  <h1 className="fw-bold text-dark mb-2">{produto.tituloProduto}</h1>
                  
                  {produto.codBarrasEan && (
                     <p className="text-muted small mb-4">EAN: {produto.codBarrasEan}</p>
                  )}

                  <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <div className="text-muted small text-uppercase fw-bold tracking-wider mb-1">Preço Original (Base)</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '2rem' }}>{formatarMoeda(produto.precoOriginal)}</div>
                  </div>

                  <div className="mb-4">
                     <h6 className="fw-bold text-dark mb-2">Descrição Completa</h6>
                     <p className="text-muted bg-light p-3 rounded-3" style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                       {produto.descricao || 'Nenhuma descrição detalhada fornecida para este produto.'}
                     </p>
                  </div>

                  {/* Detalhes da Oferta (se houver) */}
                  {produto.precoPromocional && (
                     <div className="p-4 rounded-4 mb-4 mt-auto" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                       <div className="d-flex justify-content-between align-items-center mb-3">
                           <h6 className="fw-bold text-warning-emphasis m-0 d-flex align-items-center gap-2">
                               <span style={{ fontSize: '1.2rem' }}>📢</span> Oferta Ativa
                           </h6>
                           <span className="badge bg-warning text-dark fs-6 rounded-pill">
                               -{produto.percentualDesconto?.toFixed(0)}%
                           </span>
                       </div>
                       
                       <div className="row g-3">
                           <div className="col-sm-6">
                               <div className="text-warning-emphasis small">Preço Promocional</div>
                               <div className="fw-bold text-dark fs-4">{formatarMoeda(produto.precoPromocional)}</div>
                           </div>
                           <div className="col-sm-6 text-sm-end">
                               <div className="text-warning-emphasis small">Validade / Fim</div>
                               <div className="fw-semibold text-dark">
                                   {formatarData(produto.validadeProduto)}
                               </div>
                           </div>
                       </div>
                     </div>
                  )}

                  <div className="d-flex gap-3 mt-4 pt-3 border-top">
                     <button 
                        onClick={() => navigate(`/editar-produto/${produto.id}`)} 
                        className="btn fw-bold px-4 py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1" 
                        style={{ backgroundColor: '#e9ecef', color: '#495057', borderRadius: '10px' }}
                     >
                        ✏️ Editar Dados do Produto
                     </button>
                     {produto.ativo ? (
                        <button 
                            onClick={() => navigate(`/nova-oferta?produtoId=${produto.id}`)} 
                            className="btn btn-success fw-bold px-4 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 flex-grow-1 shadow-sm"
                        >
                            ➕ Nova Oferta
                        </button>
                     ) : (
                         <div className="alert alert-warning small py-2 mb-0 text-center w-50 d-flex align-items-center justify-content-center border-0">⚠️ Reative para criar ofertas.</div>
                     )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}