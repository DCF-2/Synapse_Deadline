import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function NovaOferta() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  
  const [validadeProduto, setValidadeProduto] = useState('');
  const [dataFimOferta, setDataFimOferta] = useState(''); 

  const [precoPromocional, setPrecoPromocional] = useState('');
  const [percentualDesconto, setPercentualDesconto] = useState(''); 
  
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const produtoSelecionado = useMemo(() => {
    return produtos.find((produto) => String(produto.id) === String(produtoId));
  }, [produtos, produtoId]);

  // Se trocar de produto, limpa os inputs numéricos para não dar conflito
  useEffect(() => {
    setPrecoPromocional('');
    setPercentualDesconto('');
  }, [produtoId]);

  // CÁLCULO BIDIRECIONAL: Quando o lojista digita o PREÇO
  const handlePrecoChange = (e) => {
    const novoPreco = e.target.value;
    setPrecoPromocional(novoPreco);

    if (produtoSelecionado && novoPreco) {
      const original = Number(produtoSelecionado.precoOriginal);
      const promocional = Number(novoPreco);

      if (original > 0 && promocional > 0 && promocional <= original) {
        const perc = Math.max(0, Math.round(((original - promocional) / original) * 100));
        setPercentualDesconto(perc.toString());
      } else {
        setPercentualDesconto('');
      }
    } else {
      setPercentualDesconto('');
    }
  };

  // CÁLCULO BIDIRECIONAL: Quando o lojista digita o % DE DESCONTO
  const handleDescontoChange = (e) => {
    const novoDesconto = e.target.value;
    setPercentualDesconto(novoDesconto);

    if (produtoSelecionado && novoDesconto) {
      const original = Number(produtoSelecionado.precoOriginal);
      const perc = Number(novoDesconto);

      if (original > 0 && perc >= 0 && perc <= 100) {
        const precoCalculado = original - (original * (perc / 100));
        // Arredonda para 2 casas decimais
        setPrecoPromocional(precoCalculado.toFixed(2));
      } else {
        setPrecoPromocional('');
      }
    } else {
      setPrecoPromocional('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  const carregarProdutos = async () => {
    try {
      setCarregandoProdutos(true);
      const token = localStorage.getItem('deadline_token');
      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(`${API_URL}/produto/empresa`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) throw new Error(`Erro ${response.status}: não foi possível carregar os produtos.`);

      const data = await response.json();
      setProdutos(data?.content ?? data ?? []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregandoProdutos(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const produtoSelecionadoViaUrl = params.get('produtoId');
    if (produtoSelecionadoViaUrl) setProdutoId(produtoSelecionadoViaUrl);
  }, [location.search, produtos]);

  async function handleCriarOferta(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    const token = localStorage.getItem('deadline_token');
    if (!token) {
      setErro('Sua sessão expirou. Por favor, faça login novamente.');
      navigate('/auth');
      return;
    }

    if (!produtoId) {
      setErro('Selecione um produto para criar a oferta.');
      return;
    }

    if (!validadeProduto) {
      setErro('A data de validade do produto é obrigatória.');
      return;
    }

    // LÓGICA DO FIM DA OFERTA OPCIONAL:
    // Se o usuário não informou, iguala com a validade do produto.
    const dataFimFinal = dataFimOferta ? dataFimOferta : validadeProduto;

    const original = Number(produtoSelecionado?.precoOriginal);
    const promocional = Number(precoPromocional);

    if (!Number.isFinite(original) || original <= 0) {
      setErro('Não foi possível identificar o preço original deste produto.');
      return;
    }

    if (!Number.isFinite(promocional) || promocional <= 0) {
      setErro('Informe um preço promocional válido.');
      return;
    }

    if (promocional >= original) {
      setErro('O preço promocional precisa ser menor que o preço original.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/oferta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produtoId: Number(produtoId),
          validadeProduto,
          dataFimOferta: dataFimFinal,
          precoPromocional: promocional,
          percentualDesconto: Number(percentualDesconto) || 0,
          ativo: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Erro ${response.status}: não foi possível salvar a oferta.`);
      }

      setSucesso(true);
      setTimeout(() => navigate('/ofertas'), 1500);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#52b788' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ backgroundColor: '#3aad77', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
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
                <Link to="/ofertas" className="nav-link active text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}><span>📢</span> Minhas Ofertas</Link>
              </li>
            </ul>
          </div>
          <div className="mt-4">
            <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-2 border-0" onClick={handleLogout}><span>🚪</span> Sair</button>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Criar Oferta</h2>
              <p className="text-muted small m-0 mt-1">Defina a promoção para um produto do seu catálogo.</p>
            </div>
            <Link to="/ofertas" className="btn btn-light rounded-3">← Voltar para ofertas</Link>
          </div>

          {erro && <div className="alert alert-danger rounded-3">⚠️ {erro}</div>}
          {sucesso && <div className="alert alert-success rounded-3">✓ Oferta criada com sucesso! Redirecionando...</div>}

          <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '760px' }}>
            {carregandoProdutos ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-success mb-3" role="status"></div>
                <p className="mb-0">Buscando produtos do seu catálogo...</p>
              </div>
            ) : (
              <form onSubmit={handleCriarOferta}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Produto</label>
                  <select className="form-select" value={produtoId} onChange={(event) => setProdutoId(event.target.value)} required>
                    <option value="">Selecione um produto</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.tituloProduto} — {produto.nomeCategoria || 'Categoria'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium text-danger">Validade do produto *</label>
                    <input type="date" className="form-control border-danger-subtle" value={validadeProduto} onChange={(event) => setValidadeProduto(event.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Fim da oferta <span className="text-muted small fw-normal">(Opcional)</span></label>
                    {/* Note que o required foi removido */}
                    <input type="date" className="form-control" value={dataFimOferta} onChange={(event) => setDataFimOferta(event.target.value)} />
                    <small className="text-muted">Se vazio, usará a data de validade.</small>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Preço promocional (R$)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={precoPromocional} 
                      onChange={handlePrecoChange} 
                      min="0.01" 
                      step="0.01" 
                      placeholder="Ex: 19.90"
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Desconto (%)</label>
                    {/* Input editável bidirecional */}
                    <input 
                      type="number" 
                      className="form-control" 
                      value={percentualDesconto} 
                      onChange={handleDescontoChange}
                      min="0"
                      max="100"
                      step="1"
                      placeholder="Ex: 50"
                      required
                    />
                  </div>
                </div>

                <div className="alert alert-light rounded-3 border">
                  <strong>Resumo:</strong> {produtoSelecionado ? produtoSelecionado.tituloProduto : 'Selecione um produto'}
                  {produtoSelecionado && (
                    <span className="d-block mt-2 text-muted">
                      Preço original atual: <strong>R$ {Number(produtoSelecionado.precoOriginal).toFixed(2)}</strong>
                    </span>
                  )}
                </div>

                <button type="submit" className="btn w-100 fw-bold py-3 text-white mt-2" style={{ backgroundColor: '#3aad77', borderRadius: '10px' }} disabled={loading}>
                  {loading ? 'Salvando oferta...' : 'Criar oferta'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}