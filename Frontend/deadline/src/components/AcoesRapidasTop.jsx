import React from 'react';
import { Link } from 'react-router-dom';

export default function AcoesRapidasTop() {
  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
      <span className="fw-bold text-muted me-2" style={{fontSize: '0.85rem'}}>Ações Rápidas:</span>
      <Link to="/cadastro-produto" className="btn btn-sm btn-outline-primary fw-bold px-3 rounded-pill d-flex align-items-center gap-1">
        <span>➕</span> Novo Produto
      </Link>
      <Link to="/nova-oferta" className="btn btn-sm text-white fw-bold px-3 rounded-pill d-flex align-items-center gap-1 shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }}>
        <span>📢</span> Criar Oferta
      </Link>
      <Link to="/produtos" className="btn btn-sm btn-outline-secondary fw-bold px-3 rounded-pill d-flex align-items-center gap-1">
        <span>📦</span> Ver Produtos
      </Link>
      <Link to="/ofertas" className="btn btn-sm btn-outline-dark fw-bold px-3 rounded-pill d-flex align-items-center gap-1">
        <span>📋</span> Ver Ofertas
      </Link>
      <Link to="/dashboard" className="btn btn-sm btn-outline-info fw-bold px-3 rounded-pill d-flex align-items-center gap-1 text-dark border-info">
        <span>📊</span> Dashboard
      </Link>
    </div>
  );
}
