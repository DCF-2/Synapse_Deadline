import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IndexPage from './pages/Index'
import LoginPage from './pages/Login'
import CadastroPage from './pages/Cadastro'
import DashboardPage from './pages/Dashboard'
// 1. IMPORTANTE: Importe a nova página aqui no topo
import ProdutosPage from './pages/Produtos' 
import ClienteHomePage from './pages/ClienteHome'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal: Onde o usuário escolhe quem ele é */}
        <Route path="/" element={<IndexPage />} />
        
        {/* Rotas da Farmácia (Empresa) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* 2. OBRIGATÓRIO: Adicione a nova rota aqui */}
        <Route path="/produtos" element={<ProdutosPage />} /> 
        
        {/* Rota do Cliente Final */}
        <Route path="/vitrine" element={<ClienteHomePage />} />
      </Routes>
    </BrowserRouter>
  )
}