import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ClienteHome() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    const carregarOfertas = async () => {
      try {
        setLoading(true);
        setErro(null);

        const response = await fetch(`${API_URL}/oferta/publico`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: não foi possível carregar a vitrine.`);
        }

        const data = await response.json();
        const lista = Array.isArray(data) ? data : data?.content ?? [];

        if (ativo) {
          setOfertas(lista);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
          setOfertas([]);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    carregarOfertas(); // CORREÇÃO: "c" minúsculo para chamar a função corretamente

    return () => {
      ativo = false;
    };
  }, []);

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
      return '—';
    }

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  return (
    <div className="dl-vitrine-container dl-animate-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1rem', borderBottom: '1px solid var(--dl-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo_deadline.png" alt="Deadline Logo" style={{ height: '45px' }} />
          <div>
            <h1 style={{ color: 'var(--dl-secondary)', margin: 0, fontSize: '1.4rem' }}>Synapse Deadline</h1>
            <p style={{ color: 'var(--dl-text-secondary)', margin: 0, fontSize: '0.85rem' }}>Ofertas e Vencimentos</p>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
          <input
            type="text"
            placeholder="Buscar por produtos ou categorias..."
            className="dl-input"
            style={{ width: '100%', borderRadius: '20px', padding: '10px 16px' }}
          />
        </div>

        <div>
          <Link to="/auth" className="dl-btn-secondary" style={{ textDecoration: 'none', borderRadius: '20px', padding: '8px 20px', fontSize: '0.9rem' }}>
            Acesso Lojista
          </Link>
        </div>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--dl-secondary)', margin: 0 }}>Promoções em Destaque</h2>
        <p style={{ color: 'var(--dl-text-muted)' }}>Aproveite descontos exclusivos antes que o tempo acabe.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dl-text-muted)' }}>
          A carregar catálogo de ofertas...
        </div>
      ) : erro ? (
        <div className="alert alert-danger rounded-4" role="alert">
          ⚠️ {erro}
        </div>
      ) : (
        <main className="dl-vitrine-grid">
          {ofertas.length === 0 ? (
            <p style={{ color: 'var(--dl-text-muted)' }}>Nenhuma oferta disponível no momento.</p>
          ) : (
            ofertas.map(oferta => {
              const desconto = oferta.percentualDesconto ?? (oferta.precoPromocional && oferta.precoOriginal
                ? Math.round(((Number(oferta.precoOriginal) - Number(oferta.precoPromocional)) / Number(oferta.precoOriginal)) * 100)
                : 0);
              const precoPromocional = oferta.precoPromocional ?? oferta.precoOriginal;

              return (
                <div className="dl-product-card" key={oferta.id}>
                  <div className="dl-product-img-wrapper">
                    <img src={oferta.foto || 'https://via.placeholder.com/300x250?text=Sem+Imagem'} alt={oferta.tituloProduto} className="dl-product-img" />
                    <span className="dl-badge-discount">{desconto > 0 ? `-${desconto}%` : 'Oferta'}</span>
                  </div>
                  <div className="dl-product-info">
                    <span className="dl-product-cat">{oferta.nomeCategoria || 'Categoria'}</span>
                    <h3 className="dl-product-title">{oferta.tituloProduto}</h3>
                    <div className="dl-price-box">
                      <span className="dl-price-old">{formatarMoeda(oferta.precoOriginal)}</span>
                      <span className="dl-price-new">{formatarMoeda(precoPromocional)}</span>
                    </div>
                    {/* Alterado para manter compatibilidade com o fluxo que tínhamos de produto.id */}
                    <Link to={`/produto/${oferta.produtoId}`} state={{ oferta }} className="dl-btn-primary" style={{ marginTop: '1rem', width: '100%', borderRadius: '20px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </main>
      )}
    </div>
  );
}