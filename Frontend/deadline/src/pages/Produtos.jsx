import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProdutosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados principais da API
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [removendo, setRemovendo] = useState(false);
  const [feedbackRemocao, setFeedbackRemocao] = useState(null);

  // ESTADOS DE FILTRO, BUSCA E ORDENAÇÃO
  const [buscaInput, setBuscaInput] = useState('');
  const [buscaAtiva, setBuscaAtiva] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [ordenacao, setOrdenacao] = useState('');

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const token = localStorage.getItem('deadline_token');

      if (!token) {
        handleLogout();
        return;
      }

      // CONSTRUÇÃO DA URL COM PARÂMETROS DINÂMICOS
      const url = new URL(`${API_URL}/produto/empresa`);

      // 1. Busca por Nome
      if (buscaAtiva) {
        url.searchParams.append('nome', buscaAtiva); 
      }

      // 2. Filtro por Categoria
      if (categoriaSelecionada) {
        url.searchParams.append('categoriaId', categoriaSelecionada);
      }

      // 3. Ordenação
      if (ordenacao) {
        url.searchParams.append('sort', ordenacao);
      }

      url.searchParams.append('size', '20');

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: Ocorreu um problema ao buscar os produtos.`);
      }

      const data = await res.json();
      setProdutos(data?.content || []);

    } catch (error) {
      console.error("Erro na integração com o back-end:", error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, [buscaAtiva, categoriaSelecionada, ordenacao]); // O fetch é refeito sempre que um desses 3 mudar

  const handleBuscar = (e) => {
    e.preventDefault();
    setBuscaAtiva(buscaInput);
  };

  const limparBusca = () => {
    setBuscaInput('');
    setBuscaAtiva('');
  };

  const removerProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este produto?')) return;

    setRemovendo(true);
    setFeedbackRemocao(null);

    try {
      const token = localStorage.getItem('deadline_token');

      const res = await fetch(`${API_URL}/produto/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao remover produto.');
      }

      setFeedbackRemocao({ tipo: 'sucesso', mensagem: 'Produto removido com sucesso!' });
      setProdutoSelecionado(null);

      await carregarProdutos();

    } catch (error) {
      setFeedbackRemocao({ tipo: 'erro', mensagem: error.message });
    } finally {
      setRemovendo(false);
    }
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
            <div className="p-3 mb-3 text-white rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '13px' }}>
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

        {/* CONTEÚDO PRINCIPAL */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Meus Produtos</h2>
              <p className="text-muted small m-0 mt-1">Gerencie todo o catálogo de itens cadastrados</p>
            </div>
            <Link to="/cadastro-produto" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#52b788', borderRadius: '10px' }}>
              <span>➕</span> Novo Produto
            </Link>
          </div>

          {/* PAINEL DE BUSCA E FILTROS */}
          <div className="row mb-4 bg-white p-3 rounded-4 shadow-sm mx-0 align-items-center g-3">
            
            {/* 1. Busca por Nome */}
            <div className="col-12 col-md-5">
              <form onSubmit={handleBuscar} className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control form-control-sm bg-light border-0" 
                  placeholder="Buscar por nome..." 
                  value={buscaInput}
                  onChange={(e) => setBuscaInput(e.target.value)}
                />
                <button type="submit" className="btn btn-sm text-white px-3" style={{ backgroundColor: '#52b788' }}>
                  Buscar
                </button>
                {buscaAtiva && (
                  <button type="button" className="btn btn-sm text-white px-3" style={{ backgroundColor: '#eeab45' }} onClick={limparBusca}>
                    Limpar
                  </button>
                )}
              </form>
            </div>
            
            {/* 2. Filtro por Categoria */}
            <div className="col-12 col-md-3">
              <select 
                className="form-select form-select-sm bg-light border-0 text-muted" 
                value={categoriaSelecionada} 
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
              >
                <option value="">Todas as Categorias</option>
                <option value="1">Medicamentos</option>
                <option value="2">Higiene Pessoal</option>
                <option value="3">Dermocosméticos</option>
                <option value="4">Suplementos</option>
              </select>
            </div>

            {/* 3. Ordenação */}
            <div className="col-12 col-md-4">
              <select 
                className="form-select form-select-sm bg-light border-0 text-muted" 
                value={ordenacao} 
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="">Ordenar por (Padrão)</option>
                <option value="tituloProduto,asc">Nome (A - Z)</option>
                <option value="tituloProduto,desc">Nome (Z - A)</option>
                <option value="precoOriginal,asc">Menor Preço</option>
                <option value="precoOriginal,desc">Maior Preço</option>
              </select>
            </div>
          </div>

          {/* FEEDBACKS VISUAIS */}
          {carregando && (
            <div className="text-center my-5 text-muted">
              <div className="spinner-border text-success mb-2" role="status"></div>
              <p>Buscando produtos...</p>
            </div>
          )}

          {erro && <div className="alert alert-danger shadow-sm rounded-3">⚠️ {erro}</div>}

          {!carregando && !erro && produtos.length === 0 && (
            <div className="text-center my-5 text-muted">
              <p style={{ fontSize: '3rem' }}>📦</p>
              <p className="fw-medium">Nenhum produto encontrado com esses filtros.</p>
            </div>
          )}

          {/* GRID DE PRODUTOS */}
          <div className="row g-3">
            {!carregando && !erro && produtos.map((produto) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" key={produto.id}>
                <div className="card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-column" style={{ minHeight: '220px' }}>
                  
                  {/* Foto Mockada / Condicional */}
                  <div className="text-center mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                     {produto.foto ? (
                        <img src={produto.foto} alt={produto.tituloProduto} style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
                     ) : (
                        <span style={{ fontSize: '3rem', opacity: 0.2 }}>📦</span>
                     )}
                  </div>
                  
                  <div>
                    <h6 className="fw-bold mb-1 text-truncate" title={produto.tituloProduto}>{produto.tituloProduto}</h6>
                    <p className="text-muted small mb-2">{produto.nomeCategoria || 'Sem Categoria'}</p>
                    <p className="fw-bold text-success mb-3">R$ {produto.precoOriginal?.toFixed(2)}</p>
                    <button 
                      className="btn w-100 fw-medium" 
                      style={{ backgroundColor: '#f0fdf4', color: '#3aad77', borderRadius: '8px', fontSize: '14px', border: '1px solid #bbf7d0' }}
                      onClick={() => setProdutoSelecionado(produto)}>
                      👁 Visualizar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* MODAL DE VISUALIZAÇÃO E AÇÕES */}
      {produtoSelecionado && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{produtoSelecionado.tituloProduto}</h5>
                <button type="button" className="btn-close" onClick={() => setProdutoSelecionado(null)}></button>
              </div>
              
              <div className="modal-body text-center">
                 {produtoSelecionado.foto ? (
                    <img src={produtoSelecionado.foto} alt="Produto" className="mb-3" style={{ maxHeight: '120px' }} />
                 ) : (
                    <div className="mb-3"><span style={{ fontSize: '4rem', opacity: 0.2 }}>📦</span></div>
                 )}
                <p className="text-muted small">{produtoSelecionado.nomeCategoria || 'Categoria não informada'}</p>
                <h4 className="fw-bold text-success">R$ {produtoSelecionado.precoOriginal?.toFixed(2)}</h4>
              </div>

              <div className="modal-footer border-0 pt-0 d-flex flex-column gap-2 align-items-stretch">
                <button className="btn btn-success fw-bold rounded-3 py-2" onClick={() => navigate(`/nova-oferta?produtoId=${produtoSelecionado.id}`)}>
                  ➕ Criar Oferta
                </button>
                <button className="btn btn-outline-danger fw-bold rounded-3" onClick={() => removerProduto(produtoSelecionado.id)} disabled={removendo}>
                  {removendo ? 'Removendo...' : '🗑 Remover Produto'}
                </button>
                <button className="btn btn-light rounded-3" onClick={() => setProdutoSelecionado(null)}>
                  Fechar
                </button>
                {feedbackRemocao && (
                  <div className={`alert mt-2 ${feedbackRemocao.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'}`}>{feedbackRemocao.mensagem}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}