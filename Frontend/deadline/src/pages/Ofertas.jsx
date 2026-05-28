import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function OfertasPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados da API e Filtros
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [buscaInput, setBuscaInput] = useState('');
  const [buscaAtiva, setBuscaAtiva] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState(''); // Novo filtro!
  const [ordenacao, setOrdenacao] = useState('id,desc'); 

  // Estados para os Modals
  const [ofertaSelecionada, setOfertaSelecionada] = useState(null); // Para o modal de Visualização
  const [showConfirm, setShowConfirm] = useState(null); // Modal de confirmação ({ id, tipoAcao, ativoAtual })
  const [processandoAcao, setProcessandoAcao] = useState(false);

  const debounceTimer = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  // Carregar as categorias reais
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;
        const res = await fetch(`${API_URL}/categoria`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) { console.error("Erro categorias:", error); }
    };
    fetchCategorias();
  }, []);

  // Lógica de Busca Assíncrona
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setBuscaAtiva(buscaInput.trim());
    }, 600);
    return () => clearTimeout(debounceTimer.current);
  }, [buscaInput]);

  // Função central de carregamento de ofertas
  const carregarOfertas = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const token = localStorage.getItem('deadline_token');
      if (!token) { handleLogout(); return; }

      const url = new URL(`${API_URL}/oferta/empresa`);
      
      if (buscaAtiva) url.searchParams.append('nome', buscaAtiva);
      if (categoriaSelecionada) url.searchParams.append('categoriaId', categoriaSelecionada);
      if (statusSelecionado !== '') url.searchParams.append('ativo', statusSelecionado);
      if (ordenacao) url.searchParams.append('sort', ordenacao);
      
      url.searchParams.append('size', '50'); // Exemplo com 50 itens na página

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error(`Erro ao buscar ofertas.`);

      const data = await res.json();
      setOfertas(data.content || []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOfertas();
  }, [buscaAtiva, categoriaSelecionada, statusSelecionado, ordenacao]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setBuscaAtiva(buscaInput.trim());
  };

  const limparBusca = () => {
    setBuscaInput('');
    setBuscaAtiva('');
  };

  // ---- AÇÕES DO MODAL (INATIVAR / REMOVER) ----
  const executarAcao = async () => {
    if (!showConfirm) return;
    setProcessandoAcao(true);
    
    const { id, tipoAcao, ativoAtual } = showConfirm;
    const token = localStorage.getItem('deadline_token');

    try {
      let res;
      if (tipoAcao === 'remover') {
        res = await fetch(`${API_URL}/oferta/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else if (tipoAcao === 'status') {
        const novoStatus = !ativoAtual;
        res = await fetch(`${API_URL}/oferta/${id}/status?ativo=${novoStatus}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error('Erro ao processar a requisição.');

      // Atualiza os dados no ecrã
      setShowConfirm(null);
      setOfertaSelecionada(null);
      carregarOfertas();

    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setProcessandoAcao(false);
    }
  };

  const formatarMoeda = (valor) => {
    if (valor == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  const formatarData = (dataString) => {
    if (!dataString) return '—';
    return new Date(`${dataString}T00:00:00`).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* HEADER MOBILE */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#23a889' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
          <div className="mt-4">
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
            <Link to="/nova-oferta" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#23a889', borderRadius: '10px' }}>
              <span>➕</span> Nova Oferta
            </Link>
          </div>

          {/* PAINEL DE BUSCA E FILTROS */}
          <div className="row mb-4 bg-white p-3 rounded-4 shadow-sm mx-0 align-items-center g-3">
            <div className="col-12 col-md-3">
              <form onSubmit={handleBuscar} className="d-flex gap-2 align-items-center">
                <input 
                  type="text" className="form-control form-control-sm bg-light border-0" 
                  placeholder="Buscar pelo nome..." 
                  value={buscaInput} onChange={(e) => setBuscaInput(e.target.value)}
                />
                <button type="submit" className="btn btn-sm text-white px-3" style={{ backgroundColor: '#23a889' }}>🔍</button>
                {buscaAtiva && (
                  <button type="button" className="btn btn-sm text-white px-2" style={{ backgroundColor: '#eeab45' }} onClick={limparBusca}>✕</button>
                )}
              </form>
            </div>
            
            <div className="col-12 col-md-3">
              <select className="form-select form-select-sm bg-light border-0 text-muted" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
                <option value="">Todas as Categorias</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <select className="form-select form-select-sm bg-light border-0 text-muted" value={statusSelecionado} onChange={(e) => setStatusSelecionado(e.target.value)}>
                <option value="">Status: Todos</option>
                <option value="true">🟢 Ativos</option>
                <option value="false">🔴 Inativos</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <select className="form-select form-select-sm bg-light border-0 text-muted" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="id,desc">Mais Recentes</option>
                <option value="validadeProduto,asc">Vencendo em breve</option>
                <option value="precoPromocional,asc">Menor Preço (Oferta)</option>
                <option value="percentualDesconto,desc">Maior Desconto (%)</option>
              </select>
            </div>
          </div>

          {carregando && <div className="text-center my-5 text-muted"><div className="spinner-border text-success"></div></div>}
          {erro && <div className="alert alert-danger rounded-3">⚠️ {erro}</div>}
          {!carregando && !erro && ofertas.length === 0 && <div className="text-center my-5 text-muted"><p style={{ fontSize: '3rem' }}>📣</p><p>Nenhuma oferta encontrada.</p></div>}

          {/* GRID DE OFERTAS */}
          <div className="row g-3">
            {!carregando && !erro && ofertas.map((oferta) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" key={oferta.id}>
                <div className={`card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden ${!oferta.ativo ? 'opacity-50' : ''}`}>
                  
                  {!oferta.ativo && <span className="position-absolute badge bg-secondary m-2" style={{zIndex: 2, right: 0}}>Inativo</span>}
                  
                  {oferta.percentualDesconto && oferta.ativo && (
                    <span className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded-3 text-white fw-bold" style={{ backgroundColor: '#e63946', fontSize: '11px', zIndex: 2 }}>
                      -{oferta.percentualDesconto.toFixed(0)}%
                    </span>
                  )}

                  <div className="card-body p-3 d-flex flex-column">
                    <div className="text-center mb-3">
                      {oferta.foto ? (
                        <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxHeight: '80px', objectFit: 'contain', maxWidth: '100%' }} />
                      ) : ( <span style={{ fontSize: '3rem', opacity: 0.15 }}>📣</span> )}
                    </div>

                    <span className="fw-bold text-dark small text-truncate d-block">{oferta.tituloProduto}</span>
                    <span className="text-muted d-block text-truncate mb-1" style={{ fontSize: '11px' }}>{oferta.nomeCategoria}</span>
                    
                    <div className="mt-2 flex-grow-1">
                      <span className="text-muted text-decoration-line-through d-block" style={{ fontSize: '11px' }}>De: {formatarMoeda(oferta.precoOriginal)}</span>
                      <span className="fw-bold text-success" style={{ fontSize: '1.05rem' }}>Por: {formatarMoeda(oferta.precoPromocional)}</span>
                    </div>

                    <div className="border-top mt-2 pt-2" style={{ fontSize: '10px', color: '#6c757d' }}>
                      <div>📅 Validade: {formatarData(oferta.validadeProduto)}</div>
                      <div>🛑 Fim Oferta: {formatarData(oferta.dataFimOferta)}</div>
                    </div>

                    <button 
                      className="btn w-100 fw-medium mt-3" 
                      style={{ backgroundColor: '#f0fdf4', color: '#23a889', borderRadius: '8px', fontSize: '12px', border: '1px solid #bbf7d0' }}
                      onClick={() => setOfertaSelecionada(oferta)}>
                      👁 Visualizar Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* MODAL DE VISUALIZAÇÃO DA OFERTA */}
      {ofertaSelecionada && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4">
              
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <span className="text-truncate">{ofertaSelecionada.tituloProduto}</span>
                  <span className={`badge ${ofertaSelecionada.ativo ? 'bg-success' : 'bg-secondary'}`} style={{fontSize: '0.7rem'}}>
                    {ofertaSelecionada.ativo ? 'ATIVA' : 'INATIVA'}
                  </span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setOfertaSelecionada(null)}></button>
              </div>
              
              <div className="modal-body">
                  <div className="text-center mb-4 position-relative">
                     {ofertaSelecionada.foto ? (
                        <img src={ofertaSelecionada.foto} alt="Produto" className="rounded shadow-sm" style={{ maxHeight: '160px', objectFit: 'contain' }} />
                     ) : ( <span style={{ fontSize: '5rem', opacity: 0.2 }}>📣</span> )}
                  </div>
                  
                  {/* Linha 1: Preços e Descontos */}
                  <div className="row g-2 mb-3">
                      <div className="col-4">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.70rem'}}>Preço Original</small>
                              <span className="fw-bold text-decoration-line-through text-muted small">{formatarMoeda(ofertaSelecionada.precoOriginal)}</span>
                          </div>
                      </div>
                      <div className="col-4">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.70rem'}}>Desconto</small>
                              <span className="fw-bold text-danger">-{ofertaSelecionada.percentualDesconto?.toFixed(1)}%</span>
                          </div>
                      </div>
                      <div className="col-4">
                          <div className="bg-light p-2 rounded-3 text-center h-100" style={{border: '1px solid #bbf7d0'}}>
                              <small className="text-success fw-bold d-block" style={{fontSize: '0.70rem'}}>Preço Oferta</small>
                              <span className="fw-bold text-success">{formatarMoeda(ofertaSelecionada.precoPromocional)}</span>
                          </div>
                      </div>
                  </div>

                  {/* Linha 2: Datas */}
                  <div className="row g-2 mb-3">
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Produto Vence em</small>
                              <span className="fw-bold text-danger">{formatarData(ofertaSelecionada.validadeProduto)}</span>
                          </div>
                      </div>
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Oferta Encerra em</small>
                              <span className="fw-bold">{formatarData(ofertaSelecionada.dataFimOferta)}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Botões de Ação */}
              <div className="modal-footer border-0 pt-0 d-flex flex-column gap-2">
                <button className="btn btn-success fw-bold rounded-3 py-2 w-100" onClick={() => navigate(`/editar-oferta/${ofertaSelecionada.id}`)}>
                ✏️ Editar Dados da Oferta
                </button>
                
                <button className={`btn fw-bold rounded-3 py-2 w-100 ${ofertaSelecionada.ativo ? 'btn-outline-warning' : 'btn-outline-success'}`} 
                        onClick={() => setShowConfirm({ id: ofertaSelecionada.id, tipoAcao: 'status', ativoAtual: ofertaSelecionada.ativo, nome: ofertaSelecionada.tituloProduto })}>
                   {ofertaSelecionada.ativo ? '⏸ Pausar Oferta (Inativar)' : '▶️ Reativar Oferta'}
                </button>

                <button className="btn btn-outline-danger fw-bold rounded-3 py-2 w-100" 
                        onClick={() => setShowConfirm({ id: ofertaSelecionada.id, tipoAcao: 'remover', nome: ofertaSelecionada.tituloProduto })}>
                   🗑 Apagar Definitivamente
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE AÇÃO */}
      {showConfirm && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-4 shadow-lg p-4 text-center">
               <div className="mb-3"><span style={{fontSize: '3rem'}}>⚠️</span></div>
               <h5 className="fw-bold text-dark">Confirmar Ação</h5>
               <p className="text-muted small mb-4">
                 Tem certeza que deseja {showConfirm.tipoAcao === 'remover' ? 'apagar permanentemente' : (showConfirm.ativoAtual ? 'inativar' : 'reativar')} a oferta do produto <strong>{showConfirm.nome}</strong>?
               </p>
               
               <div className="d-flex gap-2">
                  <button className="btn btn-light w-50 fw-bold rounded-3" onClick={() => setShowConfirm(null)}>Cancelar</button>
                  <button className="btn btn-danger w-50 fw-bold rounded-3" onClick={executarAcao}>
                     {processandoAcao ? 'Aguarde...' : 'Confirmar'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}