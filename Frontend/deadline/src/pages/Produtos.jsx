import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProdutosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados da API
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Controle de Modais
  const [produtoSelecionado, setProdutoSelecionado] = useState(null); // Modal de Visualizar
  const [showConfirm, setShowConfirm] = useState(null); // Modal de Confirmação (Ação)
  
  const [removendo, setRemovendo] = useState(false);
  const [feedbackRemocao, setFeedbackRemocao] = useState(null);

  // Estados de Filtro
  const [buscaInput, setBuscaInput] = useState('');
  const [buscaAtiva, setBuscaAtiva] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState(''); 
  const [ordenacao, setOrdenacao] = useState('');

   // Ref para controlar o debounce (busca assíncrona)
  const debounceTimer = useRef(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  // BUSCA CATEGORIAS DINÂMICAS
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;
        const res = await fetch(`${API_URL}/produto/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    fetchCategorias();
  }, []);

  const carregarProdutos = async (nomeBusca, categoria, ord) => {
    try {
      setCarregando(true);
      setErro(null);

      const token = localStorage.getItem('deadline_token');
      if (!token) { handleLogout(); return; }

      const url = new URL(`${API_URL}/produto/empresa`);

       if (nomeBusca) url.searchParams.append('nome', nomeBusca);
      if (categoria) url.searchParams.append('categoriaId', categoria);
      if (status !== '') url.searchParams.append('ativo', status); 
      if (ord) url.searchParams.append('sort', ord);

      url.searchParams.append('size', '50');

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error(`Erro ao buscar os produtos.`);

      const data = await res.json();
      setProdutos(data?.content || []);

    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // LÓGICA 1: BUSCA ASSÍNCRONA (A PARTIR DE 3 CARACTERES)
  // ==========================================
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const inputLimpo = buscaInput.trim();
      // Só dispara automaticamente se tiver 3+ caracteres ou se estiver vazio
      if (inputLimpo.length >= 3 || inputLimpo === '') {
        setBuscaAtiva(inputLimpo);
      }
    }, 600); // 600ms de delay para evitar requisições demais

    return () => clearTimeout(debounceTimer.current);
  }, [buscaInput]);

  // Dispara a busca sempre que os filtros reais (Ativos) mudarem
  useEffect(() => {
    carregarProdutos(buscaAtiva, categoriaSelecionada, ordenacao);
  }, [buscaAtiva, categoriaSelecionada, ordenacao]);

  // ==========================================
  // LÓGICA 2: BUSCA MANUAL PELO BOTÃO (QUALQUER QUANTIDADE DE CARACTERES)
  // ==========================================
  const handleBuscar = (e) => {
    e.preventDefault();
    const inputLimpo = buscaInput.trim();
    if (inputLimpo.length > 0 && inputLimpo.length < 3) {
       setErro('Digite pelo menos 3 caracteres para buscar pelo nome.');
       return;
    }
    setErro(null);
    setBuscaAtiva(inputLimpo);
  };

  const limparBusca = () => {
    setBuscaInput('');
    setBuscaAtiva('');
    setErro(null);
  };  

  // Disparado ao confirmar a remoção/inativação no Modal
  const confirmarAcaoRemover = async () => {
    if (!showConfirm) return;
    const id = showConfirm.id;
    
    setRemovendo(true);
    setFeedbackRemocao(null);

    try {
      const token = localStorage.getItem('deadline_token');
      const res = await fetch(`${API_URL}/produto/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error('Erro ao processar a ação.');

      setFeedbackRemocao({ tipo: 'sucesso', mensagem: 'Operação concluída com sucesso!' });
      setShowConfirm(null);
      setProdutoSelecionado(null);
      await carregarProdutos(buscaAtiva, categoriaSelecionada, statusSelecionado, ordenacao);

    } catch (error) {
      setFeedbackRemocao({ tipo: 'erro', mensagem: error.message });
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#52b788' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1">
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

          <div className="row mb-4 bg-white p-3 rounded-4 shadow-sm mx-0 align-items-center g-3">
            <div className="col-12 col-md-3">
              <form onSubmit={handleBuscar} className="d-flex gap-2 align-items-center">
                <input 
                  type="text" 
                  className="form-control form-control-sm bg-light border-0" 
                  placeholder="Buscar..." 
                  value={buscaInput}
                  onChange={(e) => setBuscaInput(e.target.value)}
                />
                <button type="submit" className="btn btn-sm text-white px-3" style={{ backgroundColor: '#52b788' }}>
                  🔍
                </button>
                {buscaAtiva && (
                  <button type="button" className="btn btn-sm text-white px-2" style={{ backgroundColor: '#eeab45' }} onClick={limparBusca}>
                    ✕
                  </button>
                )}
              </form>
            </div>
            
            <div className="col-12 col-md-3">
              <select className="form-select bg-light border-0 text-muted form-select-sm" 
                  value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
                  <option value="">Todas as Categorias</option>
                  {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                   ))}
             </select>
            </div>

            <div className="col-12 col-md-3">
              <select className="form-select bg-light border-0 text-muted form-select-sm" 
                  value={statusSelecionado} onChange={(e) => setStatusSelecionado(e.target.value)}>
                  <option value="">Status: Todos</option>
                  <option value="true">🟢 Ativos</option>
                  <option value="false">🔴 Inativos</option>
             </select>
            </div>

            <div className="col-12 col-md-3">
              <select className="form-select form-select-sm bg-light border-0 text-muted" 
                value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="">Ordenar por (Padrão)</option>
                <option value="tituloProduto,asc">Nome (A - Z)</option>
                <option value="tituloProduto,desc">Nome (Z - A)</option>
                <option value="precoOriginal,asc">Menor Preço</option>
                <option value="precoOriginal,desc">Maior Preço</option>
              </select>
            </div>
          </div>

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
              <p className="fw-medium">Nenhum produto encontrado.</p>
            </div>
          )}

          <div className="row g-3">
            {!carregando && !erro && produtos.map((produto) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" key={produto.id}>
                <div className={`card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-column ${!produto.ativo ? 'opacity-50' : ''}`} style={{ minHeight: '220px' }}>
                  
                  {!produto.ativo && (
                    <span className="badge bg-danger position-absolute" style={{ top: '10px', right: '10px' }}>Inativo</span>
                  )}

                  <div className="text-center mb-3 flex-grow-1 d-flex align-items-center justify-content-center pt-2">
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

      {/* NOVO MODAL DE VISUALIZAÇÃO COM DESIGN MODERNO */}
      {produtoSelecionado && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4">
              
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <span className="text-truncate">{produtoSelecionado.tituloProduto}</span>
                  <span className={`badge ${produtoSelecionado.ativo ? 'bg-success' : 'bg-danger'}`} style={{fontSize: '0.7rem'}}>
                    {produtoSelecionado.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setProdutoSelecionado(null)}></button>
              </div>
              
              <div className="modal-body">
                  <div className="text-center mb-4">
                     {produtoSelecionado.foto ? (
                        <img src={produtoSelecionado.foto} alt="Produto" className="rounded shadow-sm" style={{ maxHeight: '160px', objectFit: 'contain' }} />
                     ) : (
                        <span style={{ fontSize: '5rem', opacity: 0.2 }}>📦</span>
                     )}
                  </div>
                  
                  <div className="row g-2 mb-3">
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Categoria</small>
                              <span className="fw-bold">{produtoSelecionado.nomeCategoria || '—'}</span>
                          </div>
                      </div>
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Preço Original</small>
                              <span className="fw-bold text-success">R$ {produtoSelecionado.precoOriginal?.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>

                  <div className="bg-light p-3 rounded-3 mt-3">
                      <small className="text-muted fw-bold text-uppercase" style={{fontSize: '0.75rem'}}>Descrição</small>
                      <p className="small text-dark mt-1 mb-0" style={{whiteSpace: 'pre-wrap'}}>
                          {produtoSelecionado.descricao || "Sem descrição detalhada."}
                      </p>
                  </div>
              </div>

              {/* BOTÕES MODERNOS DO MODAL */}
              <div className="modal-footer border-0 pt-0 d-flex flex-column gap-2">
                {produtoSelecionado.ativo ? (
                  <button className="btn btn-success fw-bold rounded-3 py-2 w-100" onClick={() => navigate(`/nova-oferta?produtoId=${produtoSelecionado.id}`)}>
                    ➕ Criar Nova Oferta
                  </button>
                ) : (
                  <div className="alert alert-warning small py-2 mb-0 text-center w-100 border-0">⚠️ Reative o produto para criar ofertas.</div>
                )}
                
                <button className="btn fw-bold rounded-3 py-2 w-100" style={{backgroundColor: '#e9ecef', color: '#495057'}} onClick={() => navigate(`/editar-produto/${produtoSelecionado.id}`)}>
                  ✏️ Editar Dados do Produto
                </button>
                
                <button className={`btn fw-bold rounded-3 py-2 w-100 ${produtoSelecionado.ativo ? 'btn-outline-danger' : 'btn-outline-secondary'}`} 
                        onClick={() => setShowConfirm(produtoSelecionado)}>
                   {produtoSelecionado.ativo ? '🚫 Inativar Produto' : '🗑 Apagar Definitivamente'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL BONITO DE CONFIRMAÇÃO (Substitui o window.confirm) */}
      {showConfirm && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4 text-center">
               <div className="mb-3">
                  <span style={{fontSize: '3rem'}}>⚠️</span>
               </div>
               <h5 className="fw-bold text-dark">Confirmar Ação</h5>
               <p className="text-muted small mb-4">
                 Tem certeza que deseja {showConfirm.ativo ? 'inativar' : 'remover permanentemente'} o produto <strong>{showConfirm.tituloProduto}</strong>?
               </p>
               
               <div className="d-flex gap-2">
                  <button className="btn btn-light w-50 fw-bold rounded-3" onClick={() => setShowConfirm(null)}>Cancelar</button>
                  <button className="btn btn-danger w-50 fw-bold rounded-3" onClick={confirmarAcaoRemover}>
                     {removendo ? 'Aguarde...' : 'Confirmar'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}