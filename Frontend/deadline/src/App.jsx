import { Routes, Route, Navigate } from 'react-router-dom';
import ClienteHome from './pages/ClienteHome';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import OfertasPage from './pages/Ofertas'; 
import NovaOferta from './pages/NovaOferta';
import CadastroProduto from './pages/CadastroProduto';
import EditarProduto from './pages/EditarProduto';
import ProdutoDetalhes from './pages/ProdutoDetalhes';
import EditarOferta from './pages/EditarOferta'; 
import Layout from './components/Layout';
import ConfiguracoesPage from "./pages/Configuracoes";

export default function App() {
  return (
    <Routes>
      {/* Rotas Públicas (Sem o menu lateral) */}
      <Route path="/" element={<ClienteHome />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/cadastro" element={<Navigate to="/auth" replace />} />

      {/* ROTAS ADMINISTRATIVAS  */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Produtos */}
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/cadastro-produto" element={<CadastroProduto />} />
        <Route path="/editar-produto/:id" element={<EditarProduto />} />
        <Route path="/produto/:id" element={<ProdutoDetalhes />} />

        {/* Ofertas */}
        <Route path="/ofertas" element={<OfertasPage />} />
        <Route path="/nova-oferta" element={<NovaOferta />} />
        <Route path="/editar-oferta/:id" element={<EditarOferta />} />

        {/* Configurações */}
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Route>
      
    </Routes>
  );
}