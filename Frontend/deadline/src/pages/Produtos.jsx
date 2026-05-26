import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProdutosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [removendo, setRemovendo] = useState(false);
  const [feedbackRemocao, setFeedbackRemocao] = useState(null);

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

      const url = new URL(`${API_URL}/produto/empresa`);

      if (buscaAtiva) {
        url.searchParams.append('nome', buscaAtiva);
      }

      if (categoriaSelecionada) {
        url.searchParams.append('categoriaId', categoriaSelecionada);
      }

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
  }, [buscaAtiva, categoriaSelecionada, ordenacao]);

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

        {/* SIDEBAR */}
        <nav className={`col-md-3 col-lg-2 p-3 ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'} flex-column justify-content-between`}
          style={{ backgroundColor: '#3aad77', height: '100vh' }}>

          <div>
            <h4 className="text-white fw-bold">⏱️ Deadline</h4>

            <ul className="nav flex-column mt-4">
              <li><Link to="/dashboard" className="nav-link text-white">📊 Dashboard</Link></li>
              <li><Link to="/produtos" className="nav-link text-white fw-bold">📦 Produtos</Link></li>
              <li><Link to="/ofertas" className="nav-link text-white">📢 Ofertas</Link></li>
            </ul>
          </div>

          <button className="btn text-white text-start" onClick={handleLogout}>🚪 Sair</button>
        </nav>

        {/* MAIN */}
        <main className="col-md-9 col-lg-10 p-4" style={{ overflowY: 'auto' }}>

          <div className="d-flex justify-content-between mb-3">
            <h2>Meus Produtos</h2>
            <Link to="/cadastro-produto" className="btn btn-success">Novo Produto</Link>
          </div>

          {/* FILTROS */}
          <form onSubmit={handleBuscar} className="d-flex gap-2 mb-3">
            <input
              className="form-control"
              placeholder="Buscar..."
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
            />
            <button className="btn btn-success">Buscar</button>
            <button type="button" className="btn btn-warning" onClick={limparBusca}>Limpar</button>
          </form>

          {/* STATUS */}
          {carregando && <p>Carregando...</p>}
          {erro && <div className="alert alert-danger">{erro}</div>}

          {/* LISTA */}
          <div className="row">
            {produtos.map((p) => (
              <div key={p.id} className="col-md-3 mb-3">
                <div className="card p-2">
                  <h6>{p.tituloProduto}</h6>
                  <p>R$ {p.precoOriginal?.toFixed(2)}</p>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setProdutoSelecionado(p)}>
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* MODAL */}
      {produtoSelecionado && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>{produtoSelecionado.tituloProduto}</h5>
              <p>Preço: R$ {produtoSelecionado.precoOriginal?.toFixed(2)}</p>

              <button className="btn btn-success mb-2"
                onClick={() => navigate(`/nova-oferta?produtoId=${produtoSelecionado.id}`)}>
                Criar Oferta
              </button>

              <button className="btn btn-danger mb-2"
                onClick={() => removerProduto(produtoSelecionado.id)}>
                Remover
              </button>

              <button className="btn btn-secondary"
                onClick={() => setProdutoSelecionado(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProdutosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [removendo, setRemovendo] = useState(false);
  const [feedbackRemocao, setFeedbackRemocao] = useState(null);

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

      const url = new URL(`${API_URL}/produto/empresa`);

      if (buscaAtiva) {
        url.searchParams.append('nome', buscaAtiva);
      }

      if (categoriaSelecionada) {
        url.searchParams.append('categoriaId', categoriaSelecionada);
      }

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
  }, [buscaAtiva, categoriaSelecionada, ordenacao]);

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

        {/* SIDEBAR */}
        <nav className={`col-md-3 col-lg-2 p-3 ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'} flex-column justify-content-between`}
          style={{ backgroundColor: '#3aad77', height: '100vh' }}>

          <div>
            <h4 className="text-white fw-bold">⏱️ Deadline</h4>

            <ul className="nav flex-column mt-4">
              <li><Link to="/dashboard" className="nav-link text-white">📊 Dashboard</Link></li>
              <li><Link to="/produtos" className="nav-link text-white fw-bold">📦 Produtos</Link></li>
              <li><Link to="/ofertas" className="nav-link text-white">📢 Ofertas</Link></li>
            </ul>
          </div>

          <button className="btn text-white text-start" onClick={handleLogout}>🚪 Sair</button>
        </nav>

        {/* MAIN */}
        <main className="col-md-9 col-lg-10 p-4" style={{ overflowY: 'auto' }}>

          <div className="d-flex justify-content-between mb-3">
            <h2>Meus Produtos</h2>
            <Link to="/cadastro-produto" className="btn btn-success">Novo Produto</Link>
          </div>

          {/* FILTROS */}
          <form onSubmit={handleBuscar} className="d-flex gap-2 mb-3">
            <input
              className="form-control"
              placeholder="Buscar..."
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
            />
            <button className="btn btn-success">Buscar</button>
            <button type="button" className="btn btn-warning" onClick={limparBusca}>Limpar</button>
          </form>

          {/* STATUS */}
          {carregando && <p>Carregando...</p>}
          {erro && <div className="alert alert-danger">{erro}</div>}

          {/* LISTA */}
          <div className="row">
            {produtos.map((p) => (
              <div key={p.id} className="col-md-3 mb-3">
                <div className="card p-2">
                  <h6>{p.tituloProduto}</h6>
                  <p>R$ {p.precoOriginal?.toFixed(2)}</p>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setProdutoSelecionado(p)}>
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* MODAL */}
      {produtoSelecionado && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>{produtoSelecionado.tituloProduto}</h5>
              <p>Preço: R$ {produtoSelecionado.precoOriginal?.toFixed(2)}</p>

              <button className="btn btn-success mb-2"
                onClick={() => navigate(`/nova-oferta?produtoId=${produtoSelecionado.id}`)}>
                Criar Oferta
              </button>

              <button className="btn btn-danger mb-2"
                onClick={() => removerProduto(produtoSelecionado.id)}>
                Remover
              </button>

              <button className="btn btn-secondary"
                onClick={() => setProdutoSelecionado(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}