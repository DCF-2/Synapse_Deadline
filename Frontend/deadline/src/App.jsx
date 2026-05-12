import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IndexPage from './pages/Index'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import ClienteHomePage from './pages/ClienteHome'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal: Onde o usuário escolhe quem ele é */}
        <Route path="/" element={<IndexPage />} />
        
        {/* Rotas da Farmácia (Empresa) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Rota do Cliente Final */}
        <Route path="/vitrine" element={<ClienteHomePage />} />
      </Routes>
    </BrowserRouter>
  )
}