import { Routes, Route, Navigate } from 'react-router-dom';
import ClienteHome from './pages/ClienteHome';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Dashboard from './pages/Produtos';


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

      <Route path="/produtos" element={<Produtos />} />
    </Routes>
  );
}