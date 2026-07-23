import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ProdutoImagemAutoPlay = ({ produto }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const fotos = [produto.foto, ...(produto.fotosAdicionais || [])].filter(Boolean);

  useEffect(() => {
    let intv;
    if (fotos.length > 1) {
      intv = setInterval(() => {
        setImgIdx(prev => (prev + 1) % fotos.length);
      }, 3000);
    }
    return () => clearInterval(intv);
  }, [fotos.length]);

  if (fotos.length === 0) {
    return <span style={{ fontSize: '3rem', opacity: 0.2 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>;
  }
  return <img src={fotos[imgIdx]} alt={produto.tituloProduto} style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />;
};

export default function ProdutosPage() {
  const { showAlert } = useModal();

  // Estados da API
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Controle de Modais
  const [produtoSelecionado, setProdutoSelecionado] = useState(null); // Modal de Visualizar
  const [imagemAtivaModal, setImagemAtivaModal] = useState(null);
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

  const carregarProdutos = async (nomeBusca, categoria, status, ord) => {
    try {
      setCarregando(true);
      setErro(null);

      const token = localStorage.getItem('deadline_token');
      if (!token) { handleLogout(); return; }

      const url = new URL(`${API_URL}/produto/empresa`);

      if (nomeBusca) url.searchParams.append('nome', nomeBusca);
      if (categoria) url.searchParams.append('categoriaId', categoria);
      if (status !== undefined && status !== null && status !== '') url.searchParams.append('ativo', status); 
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
    carregarProdutos(buscaAtiva, categoriaSelecionada, statusSelecionado, ordenacao);
  }, [buscaAtiva, categoriaSelecionada, statusSelecionado, ordenacao]);

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

  // Função para buscar os detalhes completos antes de abrir o modal
  const abrirModalVisualizar = async (produto) => {
    try {
      const token = localStorage.getItem('deadline_token');
      const res = await fetch(`${API_URL}/produto/${produto.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const detalhes = await res.json();
        setProdutoSelecionado(detalhes); // Abre o modal com todos os dados
        setImagemAtivaModal(detalhes.foto);
      } else {
        setProdutoSelecionado(produto); // Fallback: usa os dados resumidos se falhar
        setImagemAtivaModal(produto.foto);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do produto:", error);
      setProdutoSelecionado(produto);
      setImagemAtivaModal(produto.foto);
    }
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

  const alternarStatusProduto = async (id, novoStatus) => {
    try {
      const token = localStorage.getItem('deadline_token');
      const res = await fetch(`${API_URL}/produto/${id}/status?ativo=${novoStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error('Erro ao alterar status.');
      
      setProdutoSelecionado(null);
      await carregarProdutos(buscaAtiva, categoriaSelecionada, statusSelecionado, ordenacao);
    } catch (error) {
      showAlert("Erro", error.message);
    }
  };

 return (
    <> {/* Usamos Fragment (<> e </>) pois o Layout já cuida das tags <div> envolventes */}
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Meus Produtos</h2>
          <p className="text-muted small m-0 mt-1">Gerencie todo o catálogo de itens cadastrados</p>
        </div>
        <Link to="/cadastro-produto" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#52b788', borderRadius: '10px' }}>
          <span><img src="/icons/simbolo-de-mais-preto.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> Novo Produto
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
              <img src="/icons/lupa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} />
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
      {erro && <div className="alert alert-danger shadow-sm rounded-3"><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {erro}</div>}
      {!carregando && !erro && produtos.length === 0 && (
        <div className="text-center my-5 text-muted">
          <p style={{ fontSize: '3rem' }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></p>
          <p className="fw-medium">Nenhum produto encontrado.</p>
        </div>
      )}

      <div className="row g-3">
        {!carregando && !erro && produtos.map((produto) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" key={produto.id}>
            <div 
              className={`card border-0 shadow-sm rounded-4 h-100 p-3 d-flex flex-column ${!produto.ativo ? 'opacity-50' : ''}`} 
              style={{ minHeight: '220px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => abrirModalVisualizar(produto)}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)' }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--bs-box-shadow-sm)' }}
            >
              
              {!produto.ativo && (
                <span className="badge bg-danger position-absolute" style={{ top: '10px', right: '10px' }}>Inativo</span>
              )}

              <div className="text-center mb-3 flex-grow-1 d-flex align-items-center justify-content-center pt-2">
                  <ProdutoImagemAutoPlay produto={produto} />
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-truncate" title={produto.tituloProduto}>{produto.tituloProduto}</h6>
                <p className="text-muted small mb-2">{produto.nomeCategoria || 'Sem Categoria'}</p>
                <p className="fw-bold text-success m-0">R$ {produto.precoOriginal?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
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
                  <div className="text-center mb-4 position-relative pb-4">
                     {imagemAtivaModal ? (
                        <img src={imagemAtivaModal} alt="Produto" className="rounded shadow-sm" style={{ maxHeight: '160px', objectFit: 'contain' }} />
                     ) : (
                        <span style={{ fontSize: '5rem', opacity: 0.2 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                     )}
                     
                     {produtoSelecionado.fotosAdicionais && produtoSelecionado.fotosAdicionais.length > 0 && (
                        <div className="position-absolute bottom-0 w-100 d-flex gap-2 overflow-auto pb-2 justify-content-center" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.02), transparent)'}}>
                          {[produtoSelecionado.foto, ...produtoSelecionado.fotosAdicionais].filter(Boolean).map((imgUrl, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setImagemAtivaModal(imgUrl)}
                              className={`rounded-3 overflow-hidden border cursor-pointer flex-shrink-0 bg-white ${imagemAtivaModal === imgUrl ? 'border-success opacity-100 shadow-sm' : 'border-light opacity-50'}`}
                              style={{ width: '40px', height: '40px', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                              <img src={imgUrl} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  
                  {/* LINHA 1: Categoria e Preço */}
                  <div className="row g-2 mb-2">
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Categoria</small>
                              <span className="fw-bold">{produtoSelecionado.nomeCategoria || '—'}</span>
                          </div>
                      </div>
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Preço Original</small>
                              <span className="fw-bold text-success">R$ {produtoSelecionado.precoOriginal?.toFixed(2) || '0.00'}</span>
                          </div>
                      </div>
                  </div>

                  {/* LINHA 2: Código de Barras e Validade Padrão */}
                  <div className="row g-2 mb-3">
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Código de Barras</small>
                              <span className="fw-bold">{produtoSelecionado.codBarrasEan || '—'}</span>
                          </div>
                      </div>
                      <div className="col-6">
                          <div className="bg-light p-2 rounded-3 text-center h-100">
                              <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>Validade Padrão</small>
                              <span className="fw-bold">
                                {produtoSelecionado.validadeProduto ? `${produtoSelecionado.validadeProduto} dias` : '—'}
                              </span>
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
                    <img src="/icons/simbolo-de-mais-preto.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Criar Nova Oferta
                  </button>
                ) : (
                  <button className="btn btn-success fw-bold rounded-3 py-2 w-100" onClick={() => alternarStatusProduto(produtoSelecionado.id, true)}>
                    <img src="/icons/refazer.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Reativar Produto
                  </button>
                )}
                
                <button className="btn fw-bold rounded-3 py-2 w-100" style={{backgroundColor: '#e9ecef', color: '#495057'}} onClick={() => navigate(`/editar-produto/${produtoSelecionado.id}`)}>
                  <img src="/icons/lista-de-controle.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Editar Dados do Produto
                </button>
                
                <button className={`btn fw-bold rounded-3 py-2 w-100 ${produtoSelecionado.ativo ? 'btn-outline-danger' : 'btn-outline-secondary'}`} 
                        onClick={() => setShowConfirm(produtoSelecionado)}>
                   {produtoSelecionado.ativo ? (
                     <><img src="/icons/pausa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Inativar Produto</>
                   ) : (
                     <><img src="/icons/excluir.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Apagar Definitivamente</>
                   )}
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
                  <span style={{fontSize: '3rem'}}><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
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
    </>
  )};