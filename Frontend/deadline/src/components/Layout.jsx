import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AcoesRapidasTop from './AcoesRapidasTop';
import '../styles/theme.css'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dicaAtual, setDicaAtual] = useState('');
  const [empresaInfo, setEmpresaInfo] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
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

        const resDash = await fetch(`${API_URL}/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resDash.ok) {
          const dashData = await resDash.json();
          setDashboardStats(dashData);
        }
      } catch (err) {
        console.error("Erro ao buscar dados para o layout:", err);
      }
    };

    buscarDadosPerfil();
  }, [location.pathname]);

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
        <nav className={`d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex col-12' : 'd-none d-md-flex'} ${isCollapsed ? 'col-md-auto p-2 align-items-center' : 'col-md-3 col-lg-2 p-3'}`}
          style={{ backgroundColor: 'var(--dl-primary)', height: '100vh', position: 'sticky', top: 0, zIndex: 1030, transition: 'width 0.3s ease' }}>
          
          <div className="w-100">
            {/* ÁREA DO LOGOTIPO DA PLATAFORMA E TOGGLE */}
            <div className={`d-none d-md-flex my-3 pb-3 border-bottom align-items-center ${isCollapsed ? 'justify-content-center' : 'justify-content-between'}`} style={{ borderColor: 'rgba(255,255,255,0.15) !important' }}>
              {!isCollapsed && (
                <Link to="/dashboard">
                  <img src="/logo_deadline.png" alt="Deadline Logo" style={{ height: '36px', maxWidth: '100%', objectFit: 'contain' }} />
                </Link>
              )}
              <button className="btn btn-sm text-white" onClick={() => setIsCollapsed(!isCollapsed)} style={{ padding: '0.25rem' }}>
                <img src="/icons/menu-aberto.png" alt="toggle" style={{ width: '20px' }} />
              </button>
            </div>

            {/* WIDGET DE PERFIL MODERNO (EMPRESA LOGADA) */}
            {empresaInfo && (
              <div className={`d-none d-md-flex align-items-center p-2 mb-4 bg-white bg-opacity-10 rounded-4 border ${isCollapsed ? 'justify-content-center border-0 bg-transparent' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex-shrink-0 bg-white rounded-3 d-flex align-items-center justify-content-center border shadow-sm p-1 overflow-hidden" style={{ width: isCollapsed ? '36px' : '48px', height: isCollapsed ? '36px' : '48px' }}>
                  {empresaInfo.logotipo ? (
                    <img src={empresaInfo.logotipo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span className="fw-bold text-success" style={{ fontSize: isCollapsed ? '0.8rem' : '1.1rem' }}>{getIniciais(empresaInfo.nomeFantasia)}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-grow-1 ms-3 overflow-hidden">
                    <h6 className="text-white fw-bold m-0 text-truncate" style={{ fontSize: '0.85rem' }} title={empresaInfo.nomeFantasia}>
                      {empresaInfo.nomeFantasia}
                    </h6>
                    <span className="text-white opacity-75 d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                      {empresaInfo.emailContato || empresaInfo.emailLogin}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ITENS DE NAVEGAÇÃO */}
            <ul className="nav nav-pills flex-column mb-auto gap-1 w-100">
              <li className="nav-item">
                <Link to="/dashboard" title="Dashboard" className={`nav-link text-white fw-medium d-flex align-items-center ${isCollapsed ? 'justify-content-center px-0' : 'gap-3'} ${isActive('/dashboard') ? 'active' : 'opacity-75'}`}
                      style={isActive('/dashboard') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}><img src="/icons/painel-de-controle.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: isCollapsed ? '0' : '4px' }} /></span> {!isCollapsed && "Dashboard"}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/produtos" title="Meus Produtos" className={`nav-link text-white fw-medium d-flex align-items-center ${isCollapsed ? 'justify-content-center px-0' : 'gap-3'} ${isActive('/produto') || isActive('/cadastro-produto') || isActive('/editar-produto') ? 'active' : 'opacity-75'}`}
                      style={isActive('/produto') || isActive('/cadastro-produto') || isActive('/editar-produto') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: isCollapsed ? '0' : '4px' }} /></span> {!isCollapsed && "Meus Produtos"}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ofertas" title="Minhas Ofertas" className={`nav-link text-white fw-medium d-flex align-items-center ${isCollapsed ? 'justify-content-center px-0' : 'gap-3'} ${isActive('/oferta') || isActive('/nova-oferta') || isActive('/editar-oferta') ? 'active' : 'opacity-75'}`}
                      style={isActive('/oferta') || isActive('/nova-oferta') || isActive('/editar-oferta') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: isCollapsed ? '0' : '4px' }} /></span> {!isCollapsed && "Minhas Ofertas"}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/configuracoes" title="Configurações" className={`nav-link text-white fw-medium d-flex align-items-center ${isCollapsed ? 'justify-content-center px-0' : 'gap-3'} ${isActive('/configuracoes') ? 'active' : 'opacity-75'}`}
                      style={isActive('/configuracoes') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}><img src="/icons/roda-dentada.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: isCollapsed ? '0' : '4px' }} /></span> {!isCollapsed && "Configurações"}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ajuda" title="Ajuda" className={`nav-link text-white fw-medium d-flex align-items-center ${isCollapsed ? 'justify-content-center px-0' : 'gap-3'} ${isActive('/ajuda') ? 'active' : 'opacity-75'}`}
                      style={isActive('/ajuda') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : {}}>
                  <span style={{ fontSize: '1.1rem' }}><img src="/icons/ajudando.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: isCollapsed ? '0' : '4px' }} /></span> {!isCollapsed && "Ajuda"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-4 w-100">
             {/* CARD SABIA QUE... */}
             {!isCollapsed && (
               <div className="p-3 mb-3 text-white rounded-4 shadow-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <div className="d-flex align-items-center gap-2 mb-2">
                   <span style={{ fontSize: '1.1rem' }}><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                   <p className="fw-bold m-0" style={{ fontSize: '0.85rem' }}>Sabia que...</p>
                 </div>
                 <p className="m-0 opacity-90" style={{ lineHeight: '1.4', fontSize: '0.8rem' }}>
                   {dicaAtual}
                 </p>
               </div>
             )}

            <button className={`btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center border-0 ${isCollapsed ? 'justify-content-center' : 'gap-3'}`} 
                    onClick={handleLogout} style={{ transition: 'var(--dl-transition)' }} title="Sair"
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.75'}>
              <span style={{ fontSize: '1.1rem' }}><img src="/icons/sair.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: isCollapsed ? '0' : '4px' }} /></span> {!isCollapsed && "Sair"}
            </button>
          </div>
        </nav>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="col d-flex flex-column px-md-4 p-4" style={{ height: '100vh', overflowY: 'auto', backgroundColor: 'var(--dl-background)' }}>
            
            {/* ALERTA GLOBAL DE ONBOARDING */}
            {dashboardStats && (dashboardStats.totalProdutosAtivos === 0 || (dashboardStats.totalProdutosAtivos > 0 && dashboardStats.totalOfertasAtivas === 0)) && (
              <div className="alert shadow-sm rounded-4 mb-4 d-flex align-items-center justify-content-between p-4" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffe69c' }}>
                <div>
                  <h5 className="fw-bold mb-2 text-dark">
                    {dashboardStats.totalProdutosAtivos === 0 ? 'Bem-vindo ao Deadline! 🎉' : 'Ótimo começo! <img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} />'}
                  </h5>
                  <p className="mb-0 fs-6 text-dark opacity-75">
                    {dashboardStats.totalProdutosAtivos === 0 
                      ? 'O primeiro passo para o sistema funcionar é você cadastrar o seu primeiro Produto.'
                      : 'Produto cadastrado com sucesso! Agora, crie sua primeira Oferta para que os clientes o encontrem e seu Dashboard seja ativado.'}
                  </p>
                </div>
                <div className="d-flex flex-column gap-2 flex-shrink-0 ms-4">
                  {dashboardStats.totalProdutosAtivos === 0 ? (
                    <Link to="/cadastro-produto" className="btn btn-warning fw-bold rounded-pill px-4 shadow-sm text-dark">
                      <img src="/icons/simbolo-de-mais-preto.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Cadastrar Produto
                    </Link>
                  ) : (
                    <Link to="/nova-oferta" className="btn btn-warning fw-bold rounded-pill px-4 shadow-sm text-dark">
                      <img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Criar Oferta
                    </Link>
                  )}
                </div>
              </div>
            )}

            <AcoesRapidasTop />
            <Outlet /> 
        </main>

      </div>
    </div>
  );
}