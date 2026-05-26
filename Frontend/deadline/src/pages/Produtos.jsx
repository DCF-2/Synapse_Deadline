import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProdutosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados para gerenciar os dados da API
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [removendo, setRemovendo] = useState(false);
  const [feedbackRemocao, setFeedbackRemocao] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  // Função para carregar produtos (pode ser reutilizada após remoção)
  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const token = localStorage.getItem('deadline_token');
      if (!token) {
        handleLogout();
        return;
      }
      const res = await fetch(`${API_URL}/produto/empresa`, {
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

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Função para remover produto
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
                <Link to="/ofertas" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                  <span>📢</span> Minhas Ofertas
                </Link>
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
              <Link to="/cadastro-produto" className="btn text-white fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#52b788', borderRadius: '10px' }}>
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
                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden" style={{ minHeight: '320px' }}>

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
                    <div className="d-flex justify-content-center align-items-center flex-grow-1 my-3" style={{ minHeight: '100px' }}>
                      {produto.foto
                        ? <img src={produto.foto} alt={produto.tituloProduto}
                            style={{ maxWidth: '100%', maxHeight: '90px', objectFit: 'contain' }} />
                        : <span style={{ fontSize: '5rem', opacity: 0.15 }}>📦</span>
                      }
                    </div>

                    <div className="mt-2">
                      <span className="fw-bold text-dark d-block mb-1 text-truncate" title={produto.tituloProduto}>
                        {produto.tituloProduto || 'Sem título'}
                      </span>
                     <span className="text-muted small d-block mb-3">
                        {produto.nomeCategoria || 'Sem categoria'}
                      </span>
                      <button
                        className="btn w-100 fw-medium"
                        style={{ backgroundColor: '#f0fdf4', color: '#3aad77', borderRadius: '8px', fontSize: '14px', border: '1px solid #bbf7d0' }}
                        onClick={() => setProdutoSelecionado(produto)}>
                        👁 Visualizar
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
        {/* MODAL DE VISUALIZAÇÃO */}
      {produtoSelecionado && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setProdutoSelecionado(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{produtoSelecionado.tituloProduto}</h5>
                <button className="btn-close" onClick={() => setProdutoSelecionado(null)}></button>
              </div>
              <div className="modal-body pt-2">
                <div className="d-flex justify-content-center my-3">
                  {produtoSelecionado.foto
                    ? <img src={produtoSelecionado.foto} alt={produtoSelecionado.tituloProduto}
                        style={{ maxHeight: '150px', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '6rem', opacity: 0.15 }}>📦</span>
                  }
                </div>
                <table className="table table-borderless small">
                  <tbody>
                    <tr>
                      <td className="text-muted fw-medium">Categoria</td>
                      <td className="fw-bold">{produtoSelecionado.nomeCategoria || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-medium">Preço original</td>
                      <td className="fw-bold">R$ {produtoSelecionado.precoOriginal?.toFixed(2) || '0,00'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-medium">Código EAN</td>
                      <td className="fw-bold">{produtoSelecionado.codBarrasEan || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-medium">Status</td>
                      <td>
                        <span className="px-2 py-1 rounded-5 fw-bold"
                          style={{
                            backgroundColor: produtoSelecionado.ativo ? '#e8f5e9' : '#ffebee',
                            color: produtoSelecionado.ativo ? '#2e7d32' : '#c62828',
                            fontSize: '12px'
                          }}>
                          {produtoSelecionado.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                    {produtoSelecionado.descricao && (
                      <tr>
                        <td className="text-muted fw-medium">Descrição</td>
                        <td>{produtoSelecionado.descricao}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer border-0 pt-0 d-flex flex-column gap-2 align-items-stretch">
                <button className="btn btn-success rounded-3" onClick={() => {
                  setProdutoSelecionado(null);
                  navigate(`/nova-oferta?produtoId=${produtoSelecionado.id}`);
                }}>
                  ➕ Criar Oferta
                </button>
                <button className="btn btn-danger rounded-3 mb-2" onClick={() => removerProduto(produtoSelecionado.id)} disabled={removendo}>
                  {removendo ? 'Removendo...' : 'Remover Produto'}
                </button>
                <button className="btn btn-light rounded-3" onClick={() => setProdutoSelecionado(null)} disabled={removendo}>Fechar</button>
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