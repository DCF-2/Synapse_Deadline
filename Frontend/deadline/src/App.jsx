import { Routes, Route, Navigate } from 'react-router-dom';
import ClienteHome from './pages/ClienteHome';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import CadastroProduto from './pages/CadastroProduto';

export default function App() {
  return (
    <Routes>
      // Rota para a página inicial do cliente
      <Route path='/' element={<ClienteHome />} />
      // Rota para a página de autenticação (login/cadastro)
      <Route path='/auth' element={<AuthPage />} />
      // Redirecionamento para a página de autenticação caso o usuário tente acessar login ou cadastro diretamente
      <Route path='/login' element={<Navigate to='/auth' replace />} />
      // Redirecionamento para a página de autenticação caso o usuário tente acessar login ou cadastro diretamente
      <Route path='/cadastro' element={<Navigate to='/auth' replace />} />
      // Rota para a página de dashboard do cliente
      <Route path='/dashboard' element={<Dashboard />} />
      // Rota para a página de produtos e cadastro de produtos
      <Route path='/produtos' element={<Produtos />} />
      <Route path='/cadastro-produto' element={<CadastroProduto />} />
      // Rota para a página de ofertas e criação de novas ofertas
    </Routes>
  );
}
