import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function EditarOferta() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produtoInfo, setProdutoInfo] = useState(null);
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [percentualDesconto, setPercentualDesconto] = useState('');
  const [validadeProduto, setValidadeProduto] = useState('');
  const [dataFimOferta, setDataFimOferta] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const buscarOferta = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) { 
            navigate('/auth'); 
            return; 
        }

        const res = await fetch(`${API_URL}/oferta/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Erro ao carregar os dados da oferta.');

        const data = await res.json();
        
        setProdutoInfo({
          idProduto: data.produtoId,
          tituloProduto: data.tituloProduto,
          foto: data.foto,
          precoOriginal: data.precoOriginal
        });

        setPrecoPromocional(data.precoPromocional);
        setPercentualDesconto(data.percentualDesconto);
        setValidadeProduto(data.validadeProduto);
        setDataFimOferta(data.dataFimOferta);
        setAtivo(data.ativo);

      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarOferta();
  }, [id, navigate]);

  const handleDescontoChange = (e) => {
    const novoDesconto = parseFloat(e.target.value);
    setPercentualDesconto(e.target.value);

    if (produtoInfo && novoDesconto >= 0 && novoDesconto <= 100) {
      const valorDesconto = (produtoInfo.precoOriginal * novoDesconto) / 100;
      const novoPreco = produtoInfo.precoOriginal - valorDesconto;
      setPrecoPromocional(novoPreco.toFixed(2));
    } else {
      setPrecoPromocional('');
    }
  };

  const handlePrecoChange = (e) => {
    const novoPreco = parseFloat(e.target.value);
    setPrecoPromocional(e.target.value);

    if (produtoInfo && novoPreco >= 0 && novoPreco <= produtoInfo.precoOriginal) {
      const calculoDesconto = ((produtoInfo.precoOriginal - novoPreco) / produtoInfo.precoOriginal) * 100;
      setPercentualDesconto(calculoDesconto.toFixed(2));
    } else {
      setPercentualDesconto('');
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    try {
      const token = localStorage.getItem('deadline_token');
      
      const payload = {
        produtoId: produtoInfo.idProduto,
        validadeProduto,
        dataFimOferta: dataFimOferta || validadeProduto, // Fallback caso esteja vazio
        precoPromocional: parseFloat(precoPromocional),
        percentualDesconto: parseFloat(percentualDesconto),
        ativo
      };

      const res = await fetch(`${API_URL}/oferta/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Falha ao atualizar a oferta. Verifique os dados.');

      setSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => navigate('/ofertas'), 2000);

    } catch (error) {
      setErro(error.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return (
    <div className="text-center p-5 mt-5 text-muted">
        <div className="spinner-border text-success mb-2"></div>
        <p className="fw-bold">A carregar dados da oferta...</p>
    </div>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Editar Oferta</h2>
          <p className="text-muted small m-0 mt-1">Atualize as condições promocionais do seu produto.</p>
        </div>
        <Link to="/ofertas" className="btn btn-outline-secondary fw-bold rounded-3">← Voltar</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
        
        {erro && <div className="alert alert-danger rounded-3 shadow-sm">⚠️ {erro}</div>}
        {sucesso && <div className="alert alert-success rounded-3 shadow-sm">✓ Oferta atualizada com sucesso!</div>}

        <form onSubmit={handleSalvar}>
          
          {/* Card Resumo do Produto (ReadOnly) */}
          <div className="d-flex align-items-center bg-light p-3 rounded-4 mb-4 border">
             <div className="me-3 bg-white p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                {produtoInfo?.foto ? (
                  <img src={produtoInfo.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : ( <span style={{ fontSize: '2rem', opacity: 0.3 }}>📦</span> )}
             </div>
             <div>
                <h5 className="fw-bold mb-1">{produtoInfo?.tituloProduto}</h5>
                <span className="badge bg-secondary">Preço Original: R$ {produtoInfo?.precoOriginal?.toFixed(2)}</span>
             </div>
             
             {/* Controle de Status no canto direito */}
             <div className="ms-auto text-end">
                <label className="form-label text-muted small fw-bold mb-1">Status da Oferta</label>
                <div className="form-check form-switch d-flex align-items-center justify-content-end gap-2 m-0 fs-5">
                  <input className="form-check-input m-0" type="checkbox" role="switch" style={{ cursor: 'pointer' }}
                         checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
                  <span className={`badge ${ativo ? 'bg-success' : 'bg-danger'} fs-6`}>{ativo ? 'ATIVA' : 'INATIVA'}</span>
                </div>
             </div>
          </div>

          <div className="row g-4 mb-4">
            {/* PRECIFICAÇÃO */}
            <div className="col-md-6">
              <div className="p-3 border rounded-4 bg-light h-100">
                <h6 className="fw-bold mb-3 text-success">💲 Precificação</h6>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">Porcentagem de Desconto (%)</label>
                  <input type="number" step="0.01" className="form-control form-control-lg border-0 shadow-sm" required
                    value={percentualDesconto} onChange={handleDescontoChange} min="0" max="100" />
                </div>

                <div>
                  <label className="form-label fw-bold text-muted small">Preço Promocional (R$)</label>
                  <input type="number" step="0.01" className="form-control form-control-lg border-0 shadow-sm fw-bold text-success" required
                    value={precoPromocional} onChange={handlePrecoChange} min="0.01" max={produtoInfo?.precoOriginal} />
                  <small className="text-muted d-block mt-1">O preço da oferta deve ser menor que o original.</small>
                </div>
              </div>
            </div>

            {/* DATAS DE VENCIMENTO */}
            <div className="col-md-6">
              <div className="p-3 border rounded-4 bg-light h-100">
                <h6 className="fw-bold mb-3 text-danger">⏳ Vencimento</h6>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-danger">Data de Validade do Produto *</label>
                  <input type="date" className="form-control form-control-lg border-0 shadow-sm border-danger-subtle" required
                    value={validadeProduto} onChange={(e) => setValidadeProduto(e.target.value)} />
                </div>

                <div>
                  <label className="form-label fw-bold text-muted small">Retirar oferta do ar em:</label>
                  <input type="date" className="form-control form-control-lg border-0 shadow-sm"
                    value={dataFimOferta} onChange={(e) => setDataFimOferta(e.target.value)} />
                  <small className="text-muted d-block mt-1">Se vazio, usará a data de validade.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3 pt-3 border-top">
            <button type="button" className="btn btn-light fw-bold px-4 rounded-3" onClick={() => navigate('/ofertas')} disabled={salvando}>Cancelar</button>
            <button type="submit" className="btn text-white fw-bold px-5 py-2 rounded-3 shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }} disabled={salvando}>
              {salvando ? 'A guardar...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}