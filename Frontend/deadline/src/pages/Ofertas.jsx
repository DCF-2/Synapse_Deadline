import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function OfertasPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados da API
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Filtros e Ordenação dinâmicos
  const [buscaInput, setBuscaInput] = useState('');
  const [buscaAtiva, setBuscaAtiva] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  
  // Alinhado com as propriedades que existem no banco/DTO
  const [ordenacao, setOrdenacao] = useState('dataCriacao,desc'); 

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  useEffect(() => {
    const carregarOfertas = async () => {
      try {
        setCarregando(true);
        setErro(null);
        const token = localStorage.getItem('deadline_token');
        if (!token) { handleLogout(); return; }

        const url = new URL(`${API_URL}/oferta/empresa`);
        
        if (buscaAtiva) url.searchParams.append('nome', buscaAtiva);
        if (categoriaSelecionada) url.searchParams.append('categoriaId', categoriaSelecionada);
        if (ordenacao) url.searchParams.append('sort', ordenacao);
        
        url.searchParams.append('size', '12');

        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401 || res.status === 403) { handleLogout(); return; }
        if (!res.ok) throw new Error(`Erro ${res.status}: Problema ao buscar ofertas.`);

        const data = await res.json();
        
        // Suporta tanto Page do Spring (data.content) quanto Arrays puros de listas antigas
        const listaResultados = data.content || (Array.isArray(data) ? data : []);
        setOfertas(listaResultados);
      } catch (error) {
        console.error("Erro na integração:", error);
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarOfertas();
  }, [buscaAtiva, categoriaSelecionada, ordenacao]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setBuscaAtiva(buscaInput);
  };

  // Formatação de Moeda Oficial (Vinda do código deles)
  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
      return '—';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  // Formatação de Data corrigindo fuso horário (Vinda do código deles)
  const formatarData = (dataString) => {
    if (!dataString) return '—';
    return new Date(`${dataString}T00:00:00`).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* HEADER MOBILE */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#23a889' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>

        {/* MENU LATERAL */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ backgroundColor: '#23a889', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
          
          <div>
            <div className="d-none d-md-block text-white my-3 ps-2">
              <h4 className="fw-bold d-flex align-items-center gap-2"><span>⏱️</span> Deadline</h4>
            </div>

            <ul className="nav nav-pills flex-column mb-auto mt-4 gap-1">
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2"><span>📊</span> Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/produtos" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2"><span>📦</span> Meus Produtos</Link>
              </li>
              <li className="nav-item">
                <Link to="/ofertas" className="nav-link active text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}>
                  <span>📢</span> Minhas Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Card Informativo "Sabia que..." do código deles */}
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

        {/* CONTEÚDO PRINCIPAL */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>

          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Minhas Ofertas</h2>
              <p className="text-muted small m-0 mt-1">Gerencie seus produtos com desconto ativo</p>
            </div>
            <div>
              {/* Rota unificada com a deles (/nova-oferta) */}
              <Link to="/nova-oferta" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#23a889', borderRadius: '10px' }}>
                <span>➕</span> Criar Oferta
              </Link>
            </div>
          </div>

          {/* PAINEL DE BUSCA E FILTROS */}
          <div className="row mb-4 bg-white p-3 rounded-4 shadow-sm mx-0 align-items-center g-3">
            
            <div className="col-12 col-md-5">
              <form onSubmit={handleBuscar} className="d-flex gap-2">
                <input 
                  type="text" className="form-control form-control-sm bg-light border-0" 
                  placeholder="Buscar pelo nome do produto..." 
                  value={buscaInput} onChange={(e) => setBuscaInput(e.target.value)}
                />
                <button type="submit" className="btn btn-sm text-white px-3" style={{ backgroundColor: '#23a889' }}>Buscar</button>
              </form>
            </div>
            
            <div className="col-12 col-md-3">
              <select className="form-select form-select-sm bg-light border-0 text-muted" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
                <option value="">Todas as Categorias</option>
                <option value="1">Medicamentos</option>
                <option value="2">Higiene Pessoal</option>
                <option value="3">Dermocosméticos</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <select className="form-select form-select-sm bg-light border-0 text-muted" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="dataCriacao,desc">Mais Recentes</option>
                <option value="validadeProduto,asc">Vencendo em breve</option>
                <option value="precoPromocional,asc">Menor Preço (Oferta)</option>
                <option value="percentualDesconto,desc">Maior Desconto (%)</option>
              </select>
            </div>
          </div>

          {/* FEEDBACKS */}
          {carregando && (
            <div className="text-center my-5 text-muted">
              <div className="spinner-border text-success mb-2" role="status"></div>
              <p>Buscando ofertas cadastradas...</p>
            </div>
          )}
          {erro && <div className="alert alert-danger rounded-3">⚠️ {erro}</div>}
          
          {!carregando && !erro && ofertas.length === 0 && (
            <div className="text-center my-5 text-muted">
              <p style={{ fontSize: '3rem' }}>📣</p>
              <p className="fw-medium">Nenhuma oferta encontrada para esta empresa.</p>
            </div>
          )}

          {/* GRID DE OFERTAS RESPONSIVO */}
          <div className="row g-3">
            {!carregando && !erro && ofertas.map((oferta) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" key={oferta.id}>
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                  
                  {/* Badge de Desconto Dinâmico */}
                  {oferta.percentualDesconto && (
                    <span className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded-3 text-white fw-bold"
                      style={{ backgroundColor: '#e63946', fontSize: '11px', zIndex: 2 }}>
                      -{oferta.percentualDesconto.toFixed(0)}%
                    </span>
                  )}

                  <div className="card-body p-3 d-flex flex-column">
                    <div className="text-center mb-3">
                      {oferta.foto ? (
                        <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxHeight: '80px', objectFit: 'contain', maxWidth: '100%' }} />
                      ) : (
                        <span style={{ fontSize: '3rem', opacity: 0.15 }}>📣</span>
                      )}
                    </div>

                    <span className="fw-bold text-dark small text-truncate d-block">{oferta.tituloProduto || 'Produto sem nome'}</span>
                    <span className="text-muted d-block text-truncate mb-1" style={{ fontSize: '11px' }}>{oferta.nomeCategoria || 'Sem categoria'}</span>
                    
                    <div className="mt-2 flex-grow-1">
                      <span className="text-muted text-decoration-line-through d-block" style={{ fontSize: '11px' }}>
                        De: {formatarMoeda(oferta.precoOriginal)}
                      </span>
                      <span className="fw-bold text-success" style={{ fontSize: '1.05rem' }}>
                        Por: {formatarMoeda(oferta.precoPromocional)}
                      </span>
                    </div>

                    <div className="border-top mt-2 pt-2" style={{ fontSize: '10px', color: '#6c757d' }}>
                      <div>📅 Validade: {formatarData(oferta.validadeProduto)}</div>
                      <div>🛑 Fim Oferta: {formatarData(oferta.dataFimOferta)}</div>
                    </div>

                    <button className="btn btn-sm btn-outline-success mt-3 rounded-3 w-100" style={{ fontSize: '11px' }}>Editar</button>
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