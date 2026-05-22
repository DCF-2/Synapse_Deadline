import React from "react";
import { Link } from 'react-router-dom';

export default function NovaOferta() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Nova Oferta</h1>
      <Link to="/produtos">Voltar</Link>
    </div>
  );
}