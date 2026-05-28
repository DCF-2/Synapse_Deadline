import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function NovaOferta() {
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
    return produtos.find((p) => String(p.id) === String(produtoId));
  }, [produtos, produtoId]);

  useEffect(() => {
    setPrecoPromocional('');
    setPercentualDesconto('');
  }, [produtoId]);

  const handlePrecoChange = (e) => {
    const novoPreco = e.target.value;
    setPrecoPromocional(novoPreco);
    if (produtoSelecionado && novoPreco) {
      const original = Number(produtoSelecionado.precoOriginal);
      const promocional = Number(novoPreco);
      if (original > 0 && promocional > 0 && promocional <= original) {
        setPercentualDesconto(Math.max(0, Math.round(((original - promocional) / original) * 100)).toString());
      } else { setPercentualDesconto(''); }
    } else { setPercentualDesconto(''); }
  };

  const handleDescontoChange = (e) => {
    const novoDesconto = e.target.value;
    setPercentualDesconto(novoDesconto);
    if (produtoSelecionado && novoDesconto) {
      const original = Number(produtoSelecionado.precoOriginal);
      const perc = Number(novoDesconto);
      if (original > 0 && perc >= 0 && perc <= 100) {
        setPrecoPromocional((original - (original * (perc / 100))).toFixed(2));
      } else { setPrecoPromocional(''); }
    } else { setPrecoPromocional(''); }
  };

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;
        const res = await fetch(`${API_URL}/produto/empresa`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setProdutos(data?.content || []);
        }
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregandoProdutos(false);
      }
    };
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
    const original = Number(produtoSelecionado?.precoOriginal);
    const promocional = Number(precoPromocional);

    if (!produtoId) { setErro('Selecione um produto.'); return; }
    if (promocional >= original) { setErro('O preço promocional deve ser menor que o original.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/oferta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          produtoId: Number(produtoId),
          validadeProduto,
          dataFimOferta: dataFimOferta || validadeProduto,
          precoPromocional: promocional,
          percentualDesconto: Number(percentualDesconto) || 0,
          ativo: true,
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar a oferta.');
      setSucesso(true);
      setTimeout(() => navigate('/ofertas'), 1500);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Nova Oferta</h2>
          <p className="text-muted small m-0 mt-1">Defina a promoção para um produto do seu catálogo.</p>
        </div>
        <Link to="/ofertas" className="btn btn-outline-secondary fw-bold rounded-3">← Voltar</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
        {erro && <div className="alert alert-danger rounded-3 shadow-sm">⚠️ {erro}</div>}
        {sucesso && <div className="alert alert-success rounded-3 shadow-sm">✓ Oferta criada com sucesso!</div>}

        {carregandoProdutos ? (
          <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
        ) : (
          <form onSubmit={handleCriarOferta}>
            
            <div className="mb-4">
              <label className="form-label fw-bold text-muted small">Produto Base</label>
              <select className="form-select form-select-lg bg-light border-0 shadow-sm" value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
                <option value="">Selecione um produto cadastrado...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.tituloProduto} — {p.nomeCategoria || 'Sem categoria'}</option>
                ))}
              </select>
            </div>

            {produtoSelecionado && (
              <div className="d-flex align-items-center bg-light p-3 rounded-4 mb-4 border">
                 <div className="me-3 bg-white p-2 rounded-3 shadow-sm text-center" style={{ width: '60px', height: '60px' }}>
                    {produtoSelecionado.foto ? (
                      <img src={produtoSelecionado.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : ( <span style={{ fontSize: '1.5rem' }}>📦</span> )}
                 </div>
                 <div>
                    <h6 className="fw-bold mb-1">{produtoSelecionado.tituloProduto}</h6>
                    <span className="badge bg-secondary">Preço Original: R$ {produtoSelecionado.precoOriginal?.toFixed(2)}</span>
                 </div>
              </div>
            )}

            <div className="row g-4 mb-4">
              {/* PRECIFICAÇÃO */}
              <div className="col-md-6">
                <div className="p-3 border rounded-4 bg-light h-100">
                  <h6 className="fw-bold mb-3 text-success">💲 Precificação da Oferta</h6>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">Desconto (%)</label>
                    <input type="number" className="form-control form-control-lg border-0 shadow-sm" value={percentualDesconto} onChange={handleDescontoChange} min="0" max="100" required />
                  </div>
                  <div>
                    <label className="form-label fw-bold text-muted small">Preço Promocional (R$)</label>
                    <input type="number" className="form-control form-control-lg border-0 shadow-sm fw-bold text-success" value={precoPromocional} onChange={handlePrecoChange} min="0.01" step="0.01" required />
                  </div>
                </div>
              </div>

              {/* DATAS */}
              <div className="col-md-6">
                <div className="p-3 border rounded-4 bg-light h-100">
                  <h6 className="fw-bold mb-3 text-danger">⏳ Prazos</h6>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">Produto Vence em:</label>
                    <input type="date" className="form-control form-control-lg border-0 shadow-sm" value={validadeProduto} onChange={(e) => setValidadeProduto(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label fw-bold text-muted small">Retirar oferta do ar em:</label>
                    <input type="date" className="form-control form-control-lg border-0 shadow-sm" value={dataFimOferta} onChange={(e) => setDataFimOferta(e.target.value)} />
                    <small className="text-muted d-block mt-1">Deixe vazio para usar a data de validade.</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end pt-3 border-top">
              <button type="submit" disabled={loading} className="btn text-white fw-bold px-5 py-2 rounded-3 shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }}>
                {loading ? 'A criar...' : 'Criar Oferta Pública'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}