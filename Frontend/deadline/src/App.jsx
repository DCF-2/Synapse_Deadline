import { Routes, Route, Navigate } from 'react-router-dom';
import ClienteHome from './pages/ClienteHome';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import CadastroProduto from './pages/CadastroProduto';
import Oferta from './pages/Oferta';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<ClienteHome />} />
      <Route path='/auth' element={<AuthPage />} />
      <Route path='/login' element={<Navigate to='/auth' replace />} />
      <Route path='/cadastro' element={<Navigate to='/auth' replace />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/produtos' element={<Produtos />} />
      <Route path='/cadastro-produto' element={<CadastroProduto />} />
      <Route path='/ofertas' element={<Oferta />} />
    </Routes>
  );
}
