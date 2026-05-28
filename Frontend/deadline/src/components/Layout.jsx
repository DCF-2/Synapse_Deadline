import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../styles/theme.css'; 

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dicaAtual, setDicaAtual] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Array com mais de 15 dicas estratégicas
  const dicasDeadline = [
    "Promover itens com data de validade próxima reduz perdas e aumenta o giro do estoque.",
    "Ao vender produtos com desconto antes do vencimento, você recupera custos que seriam perdidos.",
    "A sustentabilidade atrai clientes! Reduzir o desperdício melhora a imagem da sua empresa.",
    "Faça auditorias frequentes no estoque para identificar produtos parados há muito tempo.",
    "Supermercados perdem milhões anualmente com produtos vencidos. Não seja parte dessa estatística!",
    "Organize seus produtos pelo método PEPS (Primeiro a Entrar, Primeiro a Sair) para evitar perdas.",
    "Ofertas com tempo limitado criam senso de urgência, acelerando a decisão de compra do cliente.",
    "O sistema Deadline ajuda você a monitorar prazos de validade de forma automática e eficiente.",
    "Consumidores estão cada vez mais abertos a comprar produtos próximos do vencimento com desconto.",
    "Diminuir o desperdício de alimentos é uma meta global (ODS 12 da ONU). Faça a sua parte!",
    "Crie uma seção especial na sua loja física para os produtos anunciados no Deadline.",
    "Mais de 30% dos alimentos produzidos no mundo são desperdiçados. Salve seus produtos!",
    "Mantenha os dados dos seus produtos atualizados para garantir que os clientes vejam as ofertas ativas.",
    "Além de produtos alimentícios, cosméticos e remédios também podem ser salvos antes do descarte.",
    "Uma boa gestão de validade aumenta a sua margem de lucro operacional no fim do mês.",
    "Utilize fotos claras e descrições detalhadas para tornar suas ofertas mais atrativas no aplicativo."
  ];

  // Muda a dica sempre que a rota (página) muda, ou ao carregar
  useEffect(() => {
    const indiceAleatorio = Math.floor(Math.random() * dicasDeadline.length);
    setDicaAtual(dicasDeadline[indiceAleatorio]);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* HEADER MOBILE UNIFICADO */}
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }}>
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2">
          <img src="/logo_deadline.png" alt="Deadline Logo" style={{ height: '30px' }} />
        </Link>
        <button className="navbar-toggler border-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <div className="row g-0 flex-grow-1" style={{ overflow: 'hidden' }}>
        
        {/* MENU LATERAL UNIFICADO (Agora em Verde vibrante!) */}
        <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
          style={{ backgroundColor: 'var(--dl-primary)', height: '100vh', position: 'sticky', top: 0, zIndex: 1030 }}>
          
          <div>
            {/* ÁREA DO LOGOTIPO NO DESKTOP */}
            <div className="d-none d-md-block my-4 ps-2 text-center">
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <img src="/logo_deadline.png" alt="Deadline Logo" style={{ height: '45px', maxWidth: '100%', objectFit: 'contain' }} />
              </Link>
            </div>

            <ul className="nav nav-pills flex-column mb-auto mt-4 gap-2">
              <li className="nav-item">
                <Link to="/dashboard" className={`nav-link text-white fw-medium d-flex align-items-center gap-3 ${isActive('/dashboard') ? 'active' : 'opacity-75'}`}
                      style={isActive('/dashboard') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : { transition: 'var(--dl-transition)' }}>
                  <span style={{ fontSize: '1.2rem' }}>📊</span> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/produtos" className={`nav-link text-white fw-medium d-flex align-items-center gap-3 ${isActive('/produto') || isActive('/cadastro-produto') || isActive('/editar-produto') ? 'active' : 'opacity-75'}`}
                      style={isActive('/produto') || isActive('/cadastro-produto') || isActive('/editar-produto') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : { transition: 'var(--dl-transition)' }}>
                  <span style={{ fontSize: '1.2rem' }}>📦</span> Meus Produtos
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ofertas" className={`nav-link text-white fw-medium d-flex align-items-center gap-3 ${isActive('/oferta') || isActive('/nova-oferta') || isActive('/editar-oferta') ? 'active' : 'opacity-75'}`}
                      style={isActive('/oferta') || isActive('/nova-oferta') || isActive('/editar-oferta') ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--dl-radius-md)' } : { transition: 'var(--dl-transition)' }}>
                  <span style={{ fontSize: '1.2rem' }}>📢</span> Minhas Ofertas
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-4">
             <div className="p-3 mb-3 text-white rounded-4 shadow-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div className="d-flex align-items-center gap-2 mb-2">
                 <span style={{ fontSize: '1.2rem' }}>💡</span>
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
              <span style={{ fontSize: '1.2rem' }}>🚪</span> Sair
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