import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const formatarMoeda = (valor) => {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return '—';
  }

  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
};

const formatarData = (valor) => {
  if (!valor) {
    return 'Aguardando oferta';
  }

  return new Date(`${valor}T00:00:00`).toLocaleDateString('pt-BR');
};

export default function ProdutoDetalhes() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    const carregarProduto = async () => {
      try {
        setLoading(true);
        setErro(null);
        const response = await fetch(`${API_URL}/produto/publico/${id}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: não foi possível carregar os detalhes.`);
        }

        const data = await response.json();

        if (ativo) {
          setProduto(data);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    carregarProduto();

    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="container py-4 py-md-5">
        <div className="mb-4">
          <Link to="/" className="btn btn-link text-decoration-none ps-0">
            ← Voltar para a vitrine
          </Link>
        </div>

        {loading && (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <p className="mb-0">Carregando detalhes do produto...</p>
          </div>
        )}

        {erro && (
          <div className="alert alert-danger rounded-4 shadow-sm">
            ⚠️ {erro}
          </div>
        )}

        {!loading && !erro && produto && (
          <div className="row g-4 align-items-start">
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {produto.foto ? (
                  <img src={produto.foto} alt={produto.tituloProduto} style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '320px', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
                    <span style={{ fontSize: '5rem' }}>📦</span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <span className="badge bg-success-subtle text-success fw-semibold mb-3" style={{ width: 'fit-content' }}>
                  {produto.nomeCategoria || 'Categoria não informada'}
                </span>
                <h1 className="fw-bold text-dark mb-3">{produto.tituloProduto}</h1>
                <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
                  {produto.descricao || 'Nenhuma descrição detalhada foi enviada para esta oferta.'}
                </p>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="text-muted small">Preço original</div>
                      <div className="fw-bold h5 mb-0">{formatarMoeda(produto.precoOriginal)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-4" style={{ backgroundColor: '#f0fdf4' }}>
                      <div className="text-muted small">Preço promocional</div>
                      <div className="fw-bold h5 text-success mb-0">
                        {produto.precoPromocional ? formatarMoeda(produto.precoPromocional) : 'Aguardando oferta'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 rounded-4" style={{ backgroundColor: '#fff7ed' }}>
                      <div className="text-muted small">Percentual de desconto</div>
                      <div className="fw-bold h5 mb-0">
                        {produto.percentualDesconto ? `${produto.percentualDesconto.toFixed(0)}%` : 'Aguardando oferta'}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-4" style={{ backgroundColor: '#f8fafc' }}>
                      <div className="text-muted small">Data de validade</div>
                      <div className="fw-bold h5 mb-0">{formatarData(produto.validadeProduto)}</div>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-4">
                  <h2 className="h5 fw-bold text-dark mb-3">Informações da farmácia</h2>
                  <div className="mb-3">
                    <div className="text-muted small">Nome da farmácia</div>
                    <div className="fw-semibold">{produto.nomeEmpresa || 'Aguardando integração'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted small">Endereço</div>
                    <div className="fw-semibold">{produto.enderecoEmpresa || 'Aguardando integração'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted small">Instruções de retirada</div>
                    <div className="fw-semibold">{produto.instrucoesRetirada || 'Aguardando integração'}</div>
                  </div>
                  <div>
                    <div className="text-muted small">Horário de funcionamento</div>
                    <div className="fw-semibold">{produto.horarioFuncionamento || 'Aguardando integração'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
