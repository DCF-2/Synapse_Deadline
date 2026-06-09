import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

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
        if (!token) { navigate('/'); return; }

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

  const formatarMoeda = (valor) => valor == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (dataString) => !dataString ? '—' : new Date(`${dataString}T00:00:00`).toLocaleDateString('pt-BR');

  if (carregando) return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="spinner-border text-success" role="status"></div>
      <span className="ms-3 text-muted fw-bold">A processar gráficos e métricas...</span>
    </div>
  );

  if (erro) return <div className="alert alert-danger m-4 shadow-sm rounded-4">⚠️ {erro}</div>;

  // --- DADOS PARA OS GRÁFICOS ---
  // Gráfico 1 (Pie): Produtos com Oferta vs Sem Oferta
  const produtosSemOferta = Math.max(0, (dados?.totalProdutosAtivos || 0) - (dados?.totalOfertasAtivas || 0));
  const dadosPie = [
    { name: 'Com Oferta Ativa', value: dados?.totalOfertasAtivas || 0 },
    { name: 'Sem Oferta', value: produtosSemOferta },
  ];
  const CORES_PIE = ['#23a889', '#e9ecef']; // Verde da marca e Cinza neutro

  // Gráfico 2 (Bar): Top 5 Ofertas com mais cliques
  const dadosBar = dados?.topOfertasEngajamento?.map(oferta => ({
    name: oferta.tituloProduto?.substring(0, 15) + '...', // Trunca nomes muito grandes
    Cliques: oferta.cliquesContato || 0
  })) || [];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Painel de Insights 📊</h2>
          <p className="text-muted small m-0 mt-1">Visão geral do desempenho das suas ofertas e engajamento dos clientes.</p>
        </div>
        <Link to="/nova-oferta" className="btn text-white fw-bold px-4 py-2 shadow-sm rounded-3" style={{ backgroundColor: 'var(--dl-primary)' }}>
          ➕ Nova Oferta
        </Link>
      </div>

      {/* 4 CARDS DE ESTATÍSTICAS (KPIs) */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ borderLeft: '5px solid var(--dl-primary) !important' }}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-light p-3 rounded-circle text-center" style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.5rem' }}>📢</span>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="text-muted mb-1 fw-bold" style={{fontSize: '0.8rem'}}>Ofertas Ativas</h6>
                <h3 className="mb-0 fw-bold text-dark">{dados?.totalOfertasAtivas || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ borderLeft: '5px solid #eeab45 !important' }}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-light p-3 rounded-circle text-center" style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="text-muted mb-1 fw-bold" style={{fontSize: '0.8rem'}}>Vencem em 7 dias</h6>
                <h3 className="mb-0 fw-bold text-warning">{dados?.ofertasExpirandoBrevemente || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ borderLeft: '5px solid #1E3A5F !important' }}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-light p-3 rounded-circle text-center" style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.5rem' }}>📦</span>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="text-muted mb-1 fw-bold" style={{fontSize: '0.8rem'}}>Total de Produtos</h6>
                <h3 className="mb-0 fw-bold text-dark">{dados?.totalProdutosAtivos || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ borderLeft: '5px solid #25D366 !important' }}>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-light p-3 rounded-circle text-center" style={{ width: '60px', height: '60px' }}>
                <span style={{ fontSize: '1.5rem' }}>💬</span>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="text-muted mb-1 fw-bold" style={{fontSize: '0.8rem'}}>Engajamentos (Cliques)</h6>
                <h3 className="mb-0 fw-bold text-success">{dados?.engajamentosTotais || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE GRÁFICOS (DASHBOARDS VISUAIS) */}
      <div className="row g-4 mb-4">
        
        {/* GRÁFICO 1: Engajamento por Produto (Barras) */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 className="fw-bold text-dark mb-4">Top 5 Ofertas com Mais Contactos (WhatsApp/E-mail)</h6>
            {dadosBar.length === 0 ? (
               <div className="d-flex align-items-center justify-content-center h-100 text-muted">Sem dados suficientes para o gráfico.</div>
            ) : (
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer>
                  <BarChart data={dadosBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6c757d'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6c757d'}} allowDecimals={false} />
                    <RechartsTooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="Cliques" fill="#25D366" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: Aproveitamento de Catálogo (Circular) */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 className="fw-bold text-dark mb-4 text-center">Aproveitamento do Catálogo</h6>
            <div style={{ width: '100%', height: '230px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dadosPie}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dadosPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_PIE[index % CORES_PIE.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
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
              <h6 className="fw-bold m-0 text-dark">Ofertas Adicionadas Recentemente</h6>
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
                      <th className="text-muted small border-0">Produto</th>
                      <th className="text-muted small text-center border-0">Desconto</th>
                      <th className="text-muted small border-0">Preço Final</th>
                      <th className="text-muted small border-0">Encerra em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados?.ofertasRecentes?.map((oferta) => (
                      <tr key={oferta.id}>
                        <td className="fw-medium text-dark border-light">{oferta.tituloProduto}</td>
                        <td className="text-center border-light">
                          <span className="badge bg-danger rounded-pill px-2 py-1">-{oferta.percentualDesconto?.toFixed(0)}%</span>
                        </td>
                        <td className="fw-bold text-success border-light">{formatarMoeda(oferta.precoPromocional)}</td>
                        <td className="border-light text-muted small">{formatarData(oferta.dataFimOferta)}</td>
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
            <h6 className="fw-bold mb-4">Ações Rápidas</h6>
            
            <Link to="/cadastro-produto" className="btn btn-light w-100 text-start d-flex align-items-center gap-3 mb-3 p-3 rounded-4 shadow-sm text-decoration-none" style={{ color: 'var(--dl-secondary)' }}>
              <span style={{fontSize: '1.5rem'}}>📦</span>
              <span className="fw-bold">Adicionar Novo Produto</span>
            </Link>
            
            <Link to="/ofertas" className="btn btn-light w-100 text-start d-flex align-items-center gap-3 mb-3 p-3 rounded-4 shadow-sm text-decoration-none" style={{ color: 'var(--dl-secondary)' }}>
              <span style={{fontSize: '1.5rem'}}>🔍</span>
              <span className="fw-bold">Gerir Ofertas Ativas</span>
            </Link>

            <div className="mt-auto pt-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
              <small className="opacity-75 d-block text-center">
                Quanto mais ofertas ativas, maior será a sua barra de engajamento no gráfico!
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}