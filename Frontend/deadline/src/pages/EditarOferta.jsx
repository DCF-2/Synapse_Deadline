import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function EditarOferta() {
  const { id } = useParams(); // Pega o ID da oferta a partir da URL
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estado que guarda as informações de leitura do Produto
  const [produtoInfo, setProdutoInfo] = useState(null);

  // Estados do Formulário (o que vai ser enviado no DTO)
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [percentualDesconto, setPercentualDesconto] = useState('');
  const [validadeProduto, setValidadeProduto] = useState('');
  const [dataFimOferta, setDataFimOferta] = useState('');
  const [ativo, setAtivo] = useState(true);

  // Estados da página
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  // 1. Busca os dados da Oferta quando a página carrega
  useEffect(() => {
    const buscarOferta = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) { handleLogout(); return; }

        const res = await fetch(`${API_URL}/oferta/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Erro ao carregar os dados da oferta.');

        const data = await res.json();
        
        // Preenche as informações do produto (Apenas Leitura)
        setProdutoInfo({
          idProduto: data.produtoId,
          tituloProduto: data.tituloProduto,
          foto: data.foto,
          precoOriginal: data.precoOriginal
        });

        // Preenche os campos do formulário para edição
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
  }, [id]);

  // 2. Lógica de Cálculo Automático: Desconto -> Preço
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

  // 3. Lógica de Cálculo Automático: Preço -> Desconto
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

  // 4. Salvar as alterações (PUT)
  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    try {
      const token = localStorage.getItem('deadline_token');
      
      // Montando o DTO igual ao backend
      const payload = {
        produtoId: produtoInfo.idProduto,
        validadeProduto,
        dataFimOferta,
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
      setTimeout(() => navigate('/ofertas'), 2000); // Redireciona após 2 segundos

    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <div className="p-5 text-center mt-5"><div className="spinner-border text-success"></div><p>A carregar dados...</p></div>;

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Header Mobile */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#23a889' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>
        
        {/* Menu Lateral */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ backgroundColor: '#23a889', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
          <div>
            <div className="d-none d-md-block text-white my-3 ps-2">
              <h4 className="fw-bold d-flex align-items-center gap-2"><span>⏱️</span> Deadline</h4>
            </div>
            <ul className="nav nav-pills flex-column mb-auto mt-4 gap-1">
              <li><Link to="/dashboard" className="nav-link text-white opacity-75"><span>📊</span> Dashboard</Link></li>
              <li><Link to="/produtos" className="nav-link text-white opacity-75"><span>📦</span> Meus Produtos</Link></li>
              <li><Link to="/ofertas" className="nav-link text-white opacity-75"><span>📢</span> Minhas Ofertas</Link></li>
            </ul>
          </div>
          <div className="mt-4">
            <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-2 border-0" onClick={handleLogout}>
              <span>🚪</span> Sair
            </button>
          </div>
        </nav>

        {/* Conteúdo Principal do Formulário */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <div>
              <h2 className="fw-bold text-dark m-0">Editar Oferta</h2>
              <p className="text-muted small m-0 mt-1">Atualize as condições promocionais do seu produto</p>
            </div>
            <button className="btn btn-outline-secondary fw-bold rounded-3" onClick={() => navigate('/ofertas')}>
               Voltar
            </button>
          </div>

          <div className="bg-white p-4 rounded-4 shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
            
            {erro && <div className="alert alert-danger rounded-3">⚠️ {erro}</div>}
            {sucesso && <div className="alert alert-success rounded-3">✅ Oferta atualizada com sucesso! A redirecionar...</div>}

            <form onSubmit={handleSalvar}>
              
              {/* Card Resumo do Produto (ReadOnly) */}
              <div className="d-flex align-items-center bg-light p-3 rounded-4 mb-4 border">
                 <div className="me-3 bg-white p-2 rounded-3 shadow-sm text-center" style={{ width: '80px', height: '80px' }}>
                    {produtoInfo?.foto ? (
                      <img src={produtoInfo.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : ( <span style={{ fontSize: '2rem' }}>📦</span> )}
                 </div>
                 <div>
                    <h5 className="fw-bold mb-1">{produtoInfo?.tituloProduto}</h5>
                    <span className="badge bg-secondary mb-2">Preço Original: R$ {produtoInfo?.precoOriginal?.toFixed(2)}</span>
                 </div>
                 
                 {/* Controle de Status no canto direito */}
                 <div className="ms-auto text-end">
                    <label className="form-label text-muted small fw-bold mb-1">Status da Oferta</label>
                    <div className="form-check form-switch d-flex align-items-center justify-content-end gap-2">
                      <input className="form-check-input" type="checkbox" role="switch" style={{transform: 'scale(1.2)'}}
                             checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
                      <span className={`badge ${ativo ? 'bg-success' : 'bg-danger'}`}>{ativo ? 'ATIVA' : 'INATIVA'}</span>
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
                      <input type="number" step="0.01" className="form-control form-control-lg border-0 shadow-sm text-success fw-bold" required
                        value={precoPromocional} onChange={handlePrecoChange} min="0.01" max={produtoInfo?.precoOriginal} />
                      <small className="text-muted d-block mt-1">O preço da oferta deve ser menor que o preço original.</small>
                    </div>
                  </div>
                </div>

                {/* DATAS DE VENCIMENTO */}
                <div className="col-md-6">
                  <div className="p-3 border rounded-4 bg-light h-100">
                    <h6 className="fw-bold mb-3 text-danger">⏳ Vencimento</h6>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted small">Data de Validade do Produto</label>
                      <input type="date" className="form-control border-0 shadow-sm" required
                        value={validadeProduto} onChange={(e) => setValidadeProduto(e.target.value)} />
                    </div>

                    <div>
                      <label className="form-label fw-bold text-muted small">Data Fim da Oferta</label>
                      <input type="date" className="form-control border-0 shadow-sm" required
                        value={dataFimOferta} onChange={(e) => setDataFimOferta(e.target.value)} />
                      <small className="text-muted d-block mt-1">Data em que a oferta sai do ar (deve ser menor ou igual à validade).</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <button type="button" className="btn btn-light fw-bold px-4 rounded-3" onClick={() => navigate('/ofertas')}>Cancelar</button>
                <button type="submit" className="btn text-white fw-bold px-5 rounded-3" style={{ backgroundColor: '#23a889' }} disabled={salvando}>
                  {salvando ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}