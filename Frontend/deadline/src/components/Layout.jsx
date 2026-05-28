import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../styles/theme.css'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dicaAtual, setDicaAtual] = useState('');
  const [empresaInfo, setEmpresaInfo] = useState(null); // Estado para guardar os dados reais do perfil
  const location = useLocation();
  const navigate = useNavigate();

  const dicasDeadline = [
    "Promover itens com data de validade próxima reduz perdas e aumenta o giro do estoque.",
    "Ao vender produtos com desconto antes do vencimento, você recupera custos que seriam perdidos.",
    "A sustentabilidade atrai clientes! Reduzir o desperdício melhora a imagem da sua empresa.",
    "Faça auditorias frequentes no estoque para identificar produtos parados há muito tempo.",
    "Organize seus produtos pelo método PEPS (Primeiro a Entrar, Primeiro a Sair) para evitar perdas.",
    "Ofertas com tempo limitado criam senso de urgência, acelerando a decisão de compra do cliente.",
    "O sistema Deadline ajuda você a monitorar prazos de validade de forma automática e eficiente.",
    "Consumidores estão cada vez mais abertos a comprar produtos próximos do vencimento com desconto.",
    "Utilize fotos claras e descrições detalhadas para tornar suas ofertas mais atrativas no aplicativo."
  ];

  // 1. Busca as informações do perfil da empresa autenticada
  useEffect(() => {
    const buscarDadosPerfil = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;

        const res = await fetch(`${API_URL}/empresa/perfil`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setEmpresaInfo(data);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do perfil para o layout:", err);
      }
    };

    buscarDadosPerfil();
  }, []);

  // 2. Muda a dica aleatória de forma dinâmica
  useEffect(() => {
    const indiceAleatorio = Math.floor(Math.random() * dicasDeadline.length);
    setDicaAtual(dicasDeadline[indiceAleatorio]);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Função auxiliar para pegar as duas primeiras letras do nome fantasia (caso não haja logo)
  const getIniciais = (nome) => {
    if (!nome) return 'EP';
    return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* HEADER MOBILE UNIFICADO */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }}>
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2">
          <img src="/logo_deadline.png" alt="Deadline" style={{ height: '30px' }} />
        </Link>
        
        {/* Informações rápidas da Empresa no mobile */}
        {empresaInfo && (
          <div className="d-flex align-items-center gap-2 ms-auto me-3 text-white">
            <small className="fw-bold" style={{ fontSize: '0.8rem' }}>{empresaInfo.nomeFantasia}</small>
            {empresaInfo.logotipo ? (
              <img src={empresaInfo.logotipo} alt="Logo Empresa" className="rounded-circle bg-white border" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            ) : (
              <div className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                {getIniciais(empresaInfo.nomeFantasia)}
              </div>
            )}
          </div>
        )}

        <button className="navbar-toggler border-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>
        
        {/* MENU LATERAL UNIFICADO */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ backgroundColor: 'var(--dl-primary)', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
          
          <div>
            {/* ÁREA DO LOGOTIPO DA PLATAFORMA */}
            <div className="d-none d-md-block my-3 text-center border-bottom pb-3" style={{ borderColor: 'rgba(255,255,255,0.15) !important' }}>
              <Link to="/dashboard">
                <img src="/logo_deadline.png" alt="Deadline Logo" style={{ height: '42px', maxWidth: '100%', objectFit: 'contain' }} />
              </Link>
            </div>

            {/* WIDGET DE PERFIL MODERNO (EMPRESA LOGADA) */}
            {empresaInfo && (
              <div className="d-none d-md-flex align-items-center p-2 mb-4 bg-white bg-opacity-10 rounded-4 border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex-shrink-0 bg-white rounded-3 d-flex align-items-center justify-content-center border shadow-sm p-1 overflow-hidden" style={{ width: '48px', height: '48px' }}>
                  {empresaInfo.logotipo ? (
                    <img src={empresaInfo.logotipo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>{getIniciais(empresaInfo.nomeFantasia)}</span>
                  )}
                </div>
                <div className="flex-grow-1 ms-3 overflow-hidden">
                  <h6 className="text-white fw-bold m-0 text-truncate" style={{ fontSize: '0.85rem' }} title={empresaInfo.nomeFantasia}>
                    {empresaInfo.nomeFantasia}
                  </h6>
                  <span className="text-white opacity-75 d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                    {empresaInfo.emailContato || empresaInfo.emailLogin}
                  </span>
                </div>
              </div>
            )}

            {/* ITENS DE NAVEGAÇÃO */}
            <ul className="nav nav-pills flex-column mb-auto gap-1">
              <li className="nav-item">
                <Link to="/dashboard" className={`nav-link text-white fw-medium d-flex align-items-center gap-3 ${isActive('/dashboard') ? 'active' : 'opacity-75'}`}
                      style={isActive('/dashboard') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}>📊</span> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/produtos" className={`nav-link text-white fw-medium d-flex align-items-center gap-3 ${isActive('/produto') || isActive('/cadastro-produto') || isActive('/editar-produto') ? 'active' : 'opacity-75'}`}
                      style={isActive('/produto') || isActive('/cadastro-produto') || isActive('/editar-produto') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}>📦</span> Meus Produtos
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ofertas" className={`nav-link text-white fw-medium d-flex align-items-center gap-3 ${isActive('/oferta') || isActive('/nova-oferta') || isActive('/editar-oferta') ? 'active' : 'opacity-75'}`}
                      style={isActive('/oferta') || isActive('/nova-oferta') || isActive('/editar-oferta') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}>📢</span> Minhas Ofertas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/configuracoes" className={`nav-link text-white fw-medium d-flex align-items-center gap-3 ${isActive('/configuracoes') ? 'active' : 'opacity-75'}`}
                      style={isActive('/configuracoes') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}>⚙️</span> Configurações
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-4">
             {/* CARD SABIA QUE... */}
             <div className="p-3 mb-3 text-white rounded-4 shadow-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div className="d-flex align-items-center gap-2 mb-2">
                 <span style={{ fontSize: '1.1rem' }}>💡</span>
                 <p className="fw-bold m-0" style={{ fontSize: '0.85rem' }}>Sabia que...</p>
               </div>
               <p className="m-0 opacity-90" style={{ lineHeight: '1.4', fontSize: '0.8rem' }}>
                 {dicaAtual}
               </p>
             </div>

            <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-3 border-0" 
                    onClick={handleLogout} style={{ transition: 'var(--dl-transition)' }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.75'}>
              <span style={{ fontSize: '1.1rem' }}>🚪</span> Sair
            </button>
          </div>
        </nav>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: 'var(--dl-background)' }}>
            <Outlet /> 
        </main>

      </div>
    </div>
  );
}