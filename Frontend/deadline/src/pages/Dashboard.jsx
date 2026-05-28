import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarDashboard = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) {
          navigate('/');
          return;
        }

        const res = await fetch(`${API_URL}/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('deadline_token');
          navigate('/');
          return;
        }

        if (!res.ok) throw new Error('Não foi possível carregar as estatísticas.');

        const data = await res.json();
        setDados(data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarDashboard();
  }, [navigate]);

  const formatarMoeda = (valor) => {
    if (valor == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  const formatarData = (dataString) => {
    if (!dataString) return '—';
    return new Date(`${dataString}T00:00:00`).toLocaleDateString('pt-BR');
  };

  if (carregando) return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="spinner-border text-success" role="status"></div>
      <span className="ms-3 text-muted fw-bold">A preparar o seu resumo...</span>
    </div>
  );

  if (erro) return (
    <div className="alert alert-danger m-4 shadow-sm rounded-4">⚠️ {erro}</div>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Bem-vindo ao Deadline! 👋</h2>
          <p className="text-muted small m-0 mt-1">Acompanhe o desempenho das suas ofertas em tempo real.</p>
        </div>
        <Link to="/nova-oferta" className="btn text-white fw-bold px-4 py-2 shadow-sm rounded-3" style={{ backgroundColor: 'var(--dl-primary)' }}>
          ➕ Criar Oferta
        </Link>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ borderLeft: '5px solid var(--dl-primary) !important' }}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-light p-3 rounded-circle text-center" style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.5rem' }}>📢</span>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="text-muted mb-1 fw-bold">Ofertas Ativas</h6>
                <h2 className="mb-0 fw-bold text-dark">{dados?.totalOfertasAtivas || 0}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ borderLeft: '5px solid #eeab45 !important' }}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-light p-3 rounded-circle text-center" style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="text-muted mb-1 fw-bold">Vencem nos próximos 7 dias</h6>
                <h2 className="mb-0 fw-bold text-warning">{dados?.ofertasExpirandoBrevemente || 0}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ borderLeft: '5px solid #1E3A5F !important' }}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-light p-3 rounded-circle text-center" style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.5rem' }}>📦</span>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="text-muted mb-1 fw-bold">Produtos no Catálogo</h6>
                <h2 className="mb-0 fw-bold text-dark">{dados?.totalProdutosAtivos || 0}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE ÚLTIMAS OFERTAS E DICAS */}
      <div className="row g-4">
        {/* TABELA DE ÚLTIMAS OFERTAS */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0 text-dark">Ofertas Adicionadas Recentemente</h5>
              <Link to="/ofertas" className="btn btn-sm btn-outline-secondary rounded-3 fw-bold">Ver Todas</Link>
            </div>
            
            {dados?.ofertasRecentes?.length === 0 ? (
              <div className="text-center text-muted my-4">
                <span style={{fontSize: '2rem'}}>📋</span>
                <p className="mt-2">Ainda não criou nenhuma oferta.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-muted small">Produto</th>
                      <th className="text-muted small text-center">Desconto</th>
                      <th className="text-muted small">Preço Final</th>
                      <th className="text-muted small">Encerra em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados?.ofertasRecentes?.map((oferta) => (
                      <tr key={oferta.id}>
                        <td className="fw-medium text-dark">{oferta.tituloProduto}</td>
                        <td className="text-center">
                          <span className="badge bg-danger rounded-pill px-2 py-1">-{oferta.percentualDesconto?.toFixed(0)}%</span>
                        </td>
                        <td className="fw-bold text-success">{formatarMoeda(oferta.precoPromocional)}</td>
                        <td>{formatarData(oferta.dataFimOferta)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ATALHOS RÁPIDOS */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: 'var(--dl-secondary)', color: 'white' }}>
            <h5 className="fw-bold mb-4">Ações Rápidas</h5>
            
            <Link to="/cadastro-produto" className="btn btn-light w-100 text-start d-flex align-items-center gap-3 mb-3 p-3 rounded-4 shadow-sm" style={{ color: 'var(--dl-secondary)' }}>
              <span style={{fontSize: '1.5rem'}}>📦</span>
              <span className="fw-bold">Adicionar Novo Produto</span>
            </Link>
            
            <Link to="/ofertas" className="btn btn-light w-100 text-start d-flex align-items-center gap-3 mb-3 p-3 rounded-4 shadow-sm" style={{ color: 'var(--dl-secondary)' }}>
              <span style={{fontSize: '1.5rem'}}>🔍</span>
              <span className="fw-bold">Gerir Ofertas Ativas</span>
            </Link>

            <div className="mt-auto pt-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
              <small className="opacity-75 d-block text-center">
                Mantenha o seu catálogo sempre atualizado para obter os melhores resultados!
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}