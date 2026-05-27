import { Routes, Route, Navigate } from 'react-router-dom';
import ClienteHome from './pages/ClienteHome';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import OfertasPage from './pages/Ofertas'; // 1. Corrigido o nome do arquivo para Ofertas (plural) e a função para OfertasPage
import NovaOferta from './pages/NovaOferta';
import CadastroProduto from './pages/CadastroProduto';
import EditarProduto from './pages/EditarProduto';
import ProdutoDetalhes from './pages/ProdutoDetalhes';

export default function App() {
  return (
    <Routes>
      {/* Rota principal (Vitrine) */}
      <Route path="/" element={<ClienteHome />} />

      {/* Rota unificada de Autenticação (Double Slider) */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Redirecionamentos de segurança para links antigos */}
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/cadastro" element={<Navigate to="/auth" replace />} />

      {/* Painel Administrativo da Empresa */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Rota para Meus Produtos */}
      <Route path="/produtos" element={<Produtos />} />
      <Route path="/cadastro-produto" element={<CadastroProduto />} />
      <Route path="/editar-produto/:id" element={<EditarProduto />} />
      <Route path="/produto/:id" element={<ProdutoDetalhes />} />

      {/* Rota para Minhas Ofertas */}
      <Route path="/ofertas" element={<OfertasPage />} /> {/* 2. Corrigido o componente para <OfertasPage /> */}
      <Route path="/nova-oferta" element={<NovaOferta />} />

    </Routes>
  );
}