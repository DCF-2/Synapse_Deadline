import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProdutosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados principais da API
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // ESTADOS DE FILTRO, BUSCA E ORDENAÇÃO
  const [buscaInput, setBuscaInput] = useState('');
  const [buscaAtiva, setBuscaAtiva] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [ordenacao, setOrdenacao] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  useEffect(() => {
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
          url.searchParams.append('nome', buscaAtiva); // Ajuste 'nome' se o seu back-end usar outro termo (ex: 'busca' ou 'titulo')
        }
        
        // 2. Filtro por Categoria
        if (categoriaSelecionada) {
          url.searchParams.append('categoriaId', categoriaSelecionada);
        }

        // 3. Ordenação (Padrão Spring Data: sort=campo,direcao)
        if (ordenacao) {
          url.searchParams.append('sort', ordenacao);
        }

        // Padrão de paginação (opcional)
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

        if (data && data.content) {
          setProdutos(data.content);
        } else {
          setProdutos([]);
        }

      } catch (error) {
        console.error("Erro na integração com o back-end:", error);
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarProdutos();
  }, [buscaAtiva, categoriaSelecionada, ordenacao]); // O fetch é refeito sempre que um desses 3 estados mudar

  // Disparado ao clicar em "Buscar" ou dar Enter no campo de texto
  const handleBuscar = (e) => {
    e.preventDefault();
    setBuscaAtiva(buscaInput);
  };

  // Limpa a busca por texto
  const limparBusca = () => {
    setBuscaInput('');
    setBuscaAtiva('');
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
          style={{ backgroundColor: '#3aad77', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
          
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

        {/* CONTEÚDO PRINCIPAL */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4"
          style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>

          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Meus Produtos</h2>
              <p className="text-muted small m-0 mt-1">Gerencie todo o catálogo de itens cadastrados</p>
            </div>
            <div>
              <Link to="/cadastro" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#52b788', borderRadius: '10px' }}>
                <span>➕</span> Novo Produto
              </Link>
            </div>
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
                {/* Lembre-se de ajustar estes Values (IDs) conforme seu banco de dados */}
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

          {erro && (
            <div className="alert alert-danger shadow-sm rounded-3" role="alert">
              ⚠️ <strong>Não foi possível carregar os produtos:</strong> {erro}
            </div>
          )}

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
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden" style={{ minHeight: '260px' }}>

                  <span className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3 text-white fw-bold small"
                    style={{ backgroundColor: '#52b788', fontSize: '12px', zIndex: 2 }}>
                    {produto.precoOriginal ? `R$ ${produto.precoOriginal.toFixed(2)}` : 'R$ 0,00'}
                  </span>

                  <span className="position-absolute top-0 end-0 m-3 px-2 py-1 rounded-5 fw-bold"
                    style={{
                      backgroundColor: produto.ativo ? '#e8f5e9' : '#ffebee',
                      color: produto.ativo ? '#2e7d32' : '#c62828',
                      fontSize: '11px',
                      zIndex: 2
                    }}>
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>

                  <div className="card-body d-flex flex-column justify-content-between p-3 pt-5">
                    <div className="d-flex justify-content-center align-items-center flex-grow-1 my-4">
                      {produto.foto ? (
                        <img src={produto.foto} alt={produto.tituloProduto} style={{ maxWidth: '100%', maxHeight: '70px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '4rem', opacity: 0.15 }}>📦</span>
                      )}
                    </div>

                    <div className="mt-2">
                      <span className="fw-bold text-dark d-block mb-1 text-truncate" title={produto.tituloProduto}>
                        {produto.tituloProduto || 'Sem título'}
                      </span>
                      <span className="text-muted small d-block">
                        {produto.nomeCategoria || 'Sem categoria'}
                      </span>
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