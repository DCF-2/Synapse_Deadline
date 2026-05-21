import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/theme.css';

export default function ClienteHome() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://synapse-deadline.onrender.com/produto') 
      .then(response => {
        const data = response.data.content || response.data;
        setProdutos(data);
      })
      .catch(error => console.error("Erro ao buscar produtos:", error))
      .finally(() => setLoading(false));
  }, []);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="dl-vitrine-container dl-animate-in">
      
      {/* HEADER REFATORADO - Layout Profissional */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1rem', borderBottom: '1px solid var(--dl-border)' }}>
        {/* Esquerda: Logo e Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo_deadline.png" alt="Deadline Logo" style={{ height: '45px' }} />
          <div>
            <h1 style={{ color: 'var(--dl-secondary)', margin: 0, fontSize: '1.4rem' }}>Synapse Deadline</h1>
            <p style={{ color: 'var(--dl-text-secondary)', margin: 0, fontSize: '0.85rem' }}>Ofertas e Vencimentos</p>
          </div>
        </div>

        {/* Centro: Barra de Busca */}
        <div style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
          <input 
            type="text" 
            placeholder="Buscar por produtos ou categorias..." 
            className="dl-input"
            style={{ width: '100%', borderRadius: '20px', padding: '10px 16px' }}
          />
        </div>

        {/* Direita: Acesso Restrito (Botão Sou Lojista Elegante) */}
        <div>
          <Link to="/auth" className="dl-btn-secondary" style={{ textDecoration: 'none', borderRadius: '20px', padding: '8px 20px', fontSize: '0.9rem' }}>
            Acesso Lojista
          </Link>
        </div>
      </header>

      {/* Título da Seção */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--dl-secondary)', margin: 0 }}>Promoções em Destaque</h2>
        <p style={{ color: 'var(--dl-text-muted)' }}>Aproveite descontos exclusivos antes que o tempo acabe.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dl-text-muted)' }}>
          A carregar catálogo de ofertas...
        </div>
      ) : (
        <main className="dl-vitrine-grid">
          {produtos.length === 0 ? (
            <p style={{ color: 'var(--dl-text-muted)' }}>Nenhuma oferta disponível no momento.</p>
          ) : (
            produtos.map(produto => (
              <div className="dl-product-card" key={produto.id}>
                <div className="dl-product-img-wrapper">
                  <img src={produto.foto || "https://via.placeholder.com/300x250?text=Sem+Imagem"} alt={produto.tituloProduto} className="dl-product-img" />
                  <span className="dl-badge-discount">-40%</span>
                </div>
                <div className="dl-product-info">
                  <span className="dl-product-cat">{produto.nomeCategoria || "Categoria"}</span>
                  <h3 className="dl-product-title">{produto.tituloProduto}</h3>
                  <div className="dl-price-box">
                    <span className="dl-price-old">{formatarMoeda(produto.precoOriginal)}</span>
                    <span className="dl-price-new">{formatarMoeda(produto.precoOriginal * 0.6)}</span>
                  </div>
                  <button className="dl-btn-primary" style={{ marginTop: '1rem', width: '100%', borderRadius: '20px' }}>Garantir Oferta</button>
                </div>
              </div>
            ))
          )}
        </main>
      )}
    </div>
  );
}