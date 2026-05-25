import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CATEGORIAS = [
  { id: 1, nome: 'Alimentos e Bebidas' },
  { id: 2, nome: 'Higiene e Beleza' },
  { id: 3, nome: 'Medicamentos' },
  { id: 4, nome: 'Outro' },
];

export default function Produtos() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  // Modal states
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modalView, setModalView] = useState('detalhes'); // 'detalhes' | 'editar' | 'excluir'

  // Edição
  const [editNome, setEditNome] = useState('');
  const [editEan, setEditEan] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editPreco, setEditPreco] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editImagem, setEditImagem] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState(null);

  // Exclusão
  const [excluindo, setExcluindo] = useState(false);

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
      if (!token) { handleLogout(); return; }

      const res = await fetch(`${API_URL}/produto/empresa`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error(`Erro ${res.status}: Ocorreu um problema ao buscar os produtos.`);

      const data = await res.json();
      setProdutos(data && data.content ? data.content : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarProdutos(); }, []);

  const abrirModal = (produto) => {
    setProdutoSelecionado(produto);
    setModalView('detalhes');
    setErroModal(null);
    setEditImagem(null);
  };

  const abrirEditar = () => {
    const cat = CATEGORIAS.find(c => c.nome === produtoSelecionado.nomeCategoria);
    setEditNome(produtoSelecionado.tituloProduto || '');
    setEditEan(produtoSelecionado.codBarrasEan || '');
    setEditCategoria(cat ? String(cat.id) : '');
    setEditPreco(produtoSelecionado.precoOriginal ? String(produtoSelecionado.precoOriginal) : '');
    setEditDescricao(produtoSelecionado.descricao || '');
    setEditImagem(null);
    setErroModal(null);
    setModalView('editar');
  };

  const fecharModal = () => {
    if (salvando || excluindo) return;
    setProdutoSelecionado(null);
    setModalView('detalhes');
    setErroModal(null);
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setErroModal(null);
    setSalvando(true);
    try {
      const token = localStorage.getItem('deadline_token');
      const corpo = {
        tituloProduto: editNome,
        codBarrasEan: editEan.trim() || null,
        idCategoria: parseInt(editCategoria),
        descricao: editDescricao.trim() || null,
        precoOriginal: parseFloat(editPreco),
        foto: editImagem ? editImagem.name : produtoSelecionado.foto,
      };

      const res = await fetch(`${API_URL}/produto/${produtoSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(corpo),
      });

      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao salvar. Verifique os campos.');
      }

      setMensagemSucesso(`"${editNome}" atualizado com sucesso.`);
      setTimeout(() => setMensagemSucesso(null), 4000);
      fecharModal();
      await carregarProdutos();
    } catch (err) {
      setErroModal(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    setExcluindo(true);
    try {
      const token = localStorage.getItem('deadline_token');
      const res = await fetch(`${API_URL}/produto/${produtoSelecionado.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error('Não foi possível excluir o produto.');

      const nome = produtoSelecionado.tituloProduto;
      setProdutoSelecionado(null);
      setMensagemSucesso(`"${nome}" foi desativado com sucesso.`);
      setTimeout(() => setMensagemSucesso(null), 4000);
      await carregarProdutos();
    } catch (err) {
      setErroModal(err.message);
      setModalView('detalhes');
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* BARRA SUPERIOR MOBILE */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#3aad77' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ backgroundColor: '#3aad77', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
          <div>
            <div className="d-none d-md-block text-white my-3 ps-2">
              <h4 className="fw-bold d-flex align-items-center gap-2"><span>⏱️</span> Deadline</h4>
            </div>
            <ul className="nav nav-pills flex-column mb-auto mt-4 gap-1">
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                  <span>📊</span> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/produtos" className="nav-link text-white fw-medium d-flex align-items-center gap-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
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
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4"
          style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>

          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Meus Produtos</h2>
              <p className="text-muted small m-0 mt-1">Gerencie todo o catálogo de itens cadastrados</p>
            </div>
            <Link to="/cadastro-produto" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2"
              style={{ backgroundColor: '#3aad77', borderRadius: '10px' }}>
              <span>➕</span> Novo Produto
            </Link>
          </div>

          {mensagemSucesso && (
            <div className="alert alert-success rounded-3 d-flex align-items-center gap-2" role="alert">
              ✓ {mensagemSucesso}
            </div>
          )}

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

          {!carregando && !erro && produtos.length === 0 && (
            <div className="text-center my-5 text-muted">
              <p style={{ fontSize: '3rem' }}>📦</p>
              <p className="fw-medium">Nenhum produto cadastrado para esta empresa.</p>
            </div>
          )}

          {/* GRID DE PRODUTOS */}
          <div className="row g-3">
            {!carregando && !erro && produtos.map((produto) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={produto.id}>
                <div
                  className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden"
                  style={{ minHeight: '320px', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onClick={() => abrirModal(produto)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <span className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3 text-white fw-bold small"
                    style={{ backgroundColor: '#3aad77', fontSize: '12px', zIndex: 2 }}>
                    {produto.precoOriginal ? `R$ ${produto.precoOriginal.toFixed(2)}` : 'R$ 0,00'}
                  </span>
                  <span className="position-absolute top-0 end-0 m-3 px-2 py-1 rounded-5 fw-bold"
                    style={{ backgroundColor: produto.ativo ? '#e8f5e9' : '#ffebee', color: produto.ativo ? '#2e7d32' : '#c62828', fontSize: '11px', zIndex: 2 }}>
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>

                  <div className="card-body d-flex flex-column justify-content-between p-3 pt-5">
                    <div className="d-flex justify-content-center align-items-center flex-grow-1 my-3" style={{ minHeight: '100px' }}>
                      {produto.foto
                        ? <img src={produto.foto} alt={produto.tituloProduto} style={{ maxWidth: '100%', maxHeight: '90px', objectFit: 'contain' }} />
                        : <span style={{ fontSize: '5rem', opacity: 0.15 }}>📦</span>
                      }
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

      {/* ======================== MODAL ======================== */}
      {produtoSelecionado && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} onClick={fecharModal}>
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            style={{ maxWidth: '500px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 border-0 shadow-lg">

              {/* CABEÇALHO */}
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                {modalView === 'editar' ? (
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-light rounded-3 p-1 px-2" onClick={() => setModalView('detalhes')}>← Voltar</button>
                    <h5 className="modal-title fw-bold m-0">Editar produto</h5>
                  </div>
                ) : modalView === 'excluir' ? (
                  <h5 className="modal-title fw-bold text-danger m-0">🗑 Excluir produto</h5>
                ) : (
                  <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                    <h5 className="modal-title fw-bold text-truncate m-0">{produtoSelecionado.tituloProduto}</h5>
                    <span className="flex-shrink-0 px-2 py-1 rounded-5 fw-bold"
                      style={{ backgroundColor: produtoSelecionado.ativo ? '#e8f5e9' : '#ffebee', color: produtoSelecionado.ativo ? '#2e7d32' : '#c62828', fontSize: '11px' }}>
                      {produtoSelecionado.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                )}
                {!salvando && !excluindo && (
                  <button className="btn-close ms-auto flex-shrink-0" onClick={fecharModal}></button>
                )}
              </div>

              {/* ERRO NO MODAL */}
              {erroModal && (
                <div className="mx-4 mt-3 alert alert-danger rounded-3 py-2 small">⚠️ {erroModal}</div>
              )}

              {/* ---- VIEW: DETALHES ---- */}
              {modalView === 'detalhes' && (
                <>
                  <div className="modal-body px-4 pt-3 pb-2">
                    <div className="d-flex justify-content-center align-items-center mb-4 rounded-3"
                      style={{ height: '150px', backgroundColor: '#f8f9fa' }}>
                      {produtoSelecionado.foto
                        ? <img src={produtoSelecionado.foto} alt={produtoSelecionado.tituloProduto} style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }} />
                        : <span style={{ fontSize: '5rem', opacity: 0.15 }}>📦</span>
                      }
                    </div>
                    <table className="table table-borderless small mb-0">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-medium ps-0" style={{ width: '40%' }}>Categoria</td>
                          <td className="fw-bold pe-0">{produtoSelecionado.nomeCategoria || '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium ps-0">Preço original</td>
                          <td className="fw-bold pe-0">R$ {produtoSelecionado.precoOriginal?.toFixed(2) || '0,00'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium ps-0">Código EAN</td>
                          <td className="fw-bold pe-0">{produtoSelecionado.codBarrasEan || '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium ps-0">Status</td>
                          <td className="pe-0">
                            <span className="px-2 py-1 rounded-5 fw-bold"
                              style={{ backgroundColor: produtoSelecionado.ativo ? '#e8f5e9' : '#ffebee', color: produtoSelecionado.ativo ? '#2e7d32' : '#c62828', fontSize: '12px' }}>
                              {produtoSelecionado.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                        {produtoSelecionado.descricao && (
                          <tr>
                            <td className="text-muted fw-medium ps-0">Descrição</td>
                            <td className="pe-0">{produtoSelecionado.descricao}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
                    <button className="btn btn-light rounded-3 fw-medium" style={{ flex: '0 0 auto' }} onClick={fecharModal}>Fechar</button>
                    <button className="btn rounded-3 fw-medium" style={{ flex: '1', backgroundColor: '#fff5f5', color: '#c62828', border: '1px solid #fca5a5' }}
                      onClick={() => setModalView('excluir')}>
                      🗑 Excluir
                    </button>
                    <button className="btn text-white rounded-3 fw-medium" style={{ flex: '2', backgroundColor: '#3aad77' }}
                      onClick={abrirEditar}>
                      ✏️ Editar produto
                    </button>
                  </div>
                </>
              )}

              {/* ---- VIEW: EDITAR ---- */}
              {modalView === 'editar' && (
                <form onSubmit={handleSalvarEdicao}>
                  <div className="modal-body px-4 pt-3 pb-2">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-medium small">Nome</label>
                        <input type="text" className="form-control form-control-sm" value={editNome}
                          onChange={e => setEditNome(e.target.value)} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium small">Código de barras</label>
                        <input type="text" className="form-control form-control-sm" placeholder="EAN (Opcional)"
                          value={editEan} onChange={e => setEditEan(e.target.value)} maxLength={13} />
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-medium small">Categoria</label>
                        <select className="form-select form-select-sm" value={editCategoria}
                          onChange={e => setEditCategoria(e.target.value)} required>
                          <option value="">Selecione</option>
                          {CATEGORIAS.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium small">Preço original (R$)</label>
                        <input type="number" className="form-control form-control-sm" value={editPreco}
                          onChange={e => setEditPreco(e.target.value)} required min="0.01" step="0.01" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small">Descrição</label>
                      <textarea className="form-control form-control-sm" rows={3} value={editDescricao}
                        onChange={e => setEditDescricao(e.target.value)} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label fw-medium small">Imagem do produto</label>
                      {produtoSelecionado.foto && !editImagem && (
                        <div className="mb-2 px-2 py-1 rounded-3 d-flex align-items-center gap-2"
                          style={{ border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
                          <span className="text-success small">✓ Imagem atual:</span>
                          <span className="text-muted small text-truncate">{produtoSelecionado.foto}</span>
                        </div>
                      )}
                      <label className="d-flex flex-column align-items-center justify-content-center rounded-3 p-3"
                        style={{ border: '2px dashed #d1d5db', cursor: 'pointer' }}>
                        <input type="file" accept="image/*" onChange={e => setEditImagem(e.target.files[0])} style={{ display: 'none' }} />
                        {editImagem
                          ? <span className="text-success small">✓ {editImagem.name}</span>
                          : <span className="text-muted small">Clique para substituir a imagem</span>
                        }
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
                    <button type="button" className="btn btn-light rounded-3 fw-medium" style={{ flex: '1' }}
                      onClick={() => setModalView('detalhes')} disabled={salvando}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn text-white rounded-3 fw-medium" style={{ flex: '2', backgroundColor: '#3aad77', opacity: salvando ? 0.65 : 1 }}
                      disabled={salvando}>
                      {salvando ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Salvando...</>
                      ) : 'Salvar alterações'}
                    </button>
                  </div>
                </form>
              )}

              {/* ---- VIEW: CONFIRMAR EXCLUSÃO ---- */}
              {modalView === 'excluir' && (
                <>
                  <div className="modal-body px-4 pt-3 pb-2">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#fff5f5', border: '1px solid #fca5a5' }}>
                      <p className="text-muted mb-1 small">
                        Tem certeza que deseja excluir <strong className="text-dark">"{produtoSelecionado.tituloProduto}"</strong>?
                      </p>
                      <p className="text-muted small mb-0">
                        O produto será desativado e não aparecerá mais no catálogo.
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
                    <button className="btn btn-light rounded-3 fw-medium" style={{ flex: '1' }}
                      onClick={() => setModalView('detalhes')} disabled={excluindo}>
                      Cancelar
                    </button>
                    <button className="btn text-white rounded-3 fw-medium" style={{ flex: '2', backgroundColor: '#dc2626', opacity: excluindo ? 0.65 : 1 }}
                      onClick={handleExcluir} disabled={excluindo}>
                      {excluindo ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Excluindo...</>
                      ) : 'Confirmar exclusão'}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}