import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ClienteHome() {
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados para Filtros
  const [termoBusca, setTermoBusca] = useState(''); // O que o utilizador digita
  const [nomeProduto, setNomeProduto] = useState(''); // O que vai para a API
  const [categoriaId, setCategoriaId] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [diasMaxValidade, setDiasMaxValidade] = useState('');

  // Estado de Ordenação
  const [ordenacao, setOrdenacao] = useState('validadeProduto,asc');

  // Estado do Modal de Detalhes
  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const debounceTimer = useRef(null);

  const abrirMapa = (oferta) => {
    const end = oferta.enderecoEmpresa;
    const query = encodeURIComponent(`${end.logradouro}, ${end.numero} - ${end.bairro}, ${end.cidade} - ${end.uf}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const abrirWhatsApp = (oferta) => {
    // 1. Registra o engajamento silenciosamente no backend
    fetch(`${API_URL}/oferta/publico/${oferta.id}/engajamento`, { method: 'POST' }).catch(console.error);
    
    // 2. Abre o WhatsApp com texto pronto
    const fone = oferta.contatoWhatsapp?.replace(/\D/g, ''); // Limpa formatação
    const mensagem = encodeURIComponent(`Olá! Vi a oferta do produto "${oferta.tituloProduto}" por R$ ${oferta.precoPromocional.toFixed(2)} no Deadline. Ainda está disponível?`);
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  const abrirEmail = (oferta) => {
    // Regista o clique também para o lojista saber que houve interesse!
    fetch(`${API_URL}/oferta/publico/${oferta.id}/engajamento`, { method: 'POST' }).catch(console.error);
    
    if (!oferta.emailContato) {
      alert("Este lojista não disponibilizou um e-mail de contacto.");
      return;
    }
    
    const assunto = encodeURIComponent(`Interesse na oferta: ${oferta.tituloProduto}`);
    const corpo = encodeURIComponent(`Olá, vi a oferta do produto "${oferta.tituloProduto}" por R$ ${oferta.precoPromocional?.toFixed(2)} no Deadline e gostaria de mais informações ou reservar a minha unidade.`);
    window.open(`mailto:${oferta.emailContato}?subject=${assunto}&body=${corpo}`, '_blank');
  };
  // Carrega as categorias na inicialização
  useEffect(() => {
    fetch(`${API_URL}/categoria`)
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(console.error);
  }, []);

  // Lógica de Busca Assíncrona (Debounce com regra de 3 caracteres)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      const termo = termoBusca.trim();
      // Dispara a busca apenas se tiver 3+ caracteres ou se estiver vazio (limpar)
      if (termo.length >= 3 || termo.length === 0) {
        setNomeProduto(termo);
      }
    }, 600);
    
    return () => clearTimeout(debounceTimer.current);
  }, [termoBusca]);

  // Carrega os dados filtrados e ordenados
  const carregarVitrine = async () => {
    setCarregando(true);
    try {
      const url = new URL(`${API_URL}/oferta/publico`);
      
      // Aplicando filtros dinâmicos na URL
      if (nomeProduto) url.searchParams.append('nomeProduto', nomeProduto);
      if (categoriaId) url.searchParams.append('categoriaId', categoriaId);
      if (precoMin) url.searchParams.append('precoMin', precoMin);
      if (precoMax) url.searchParams.append('precoMax', precoMax);
      if (diasMaxValidade) url.searchParams.append('diasMaxValidade', diasMaxValidade);
      
      url.searchParams.append('sort', ordenacao);
      url.searchParams.append('size', '50'); // Paginação

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setOfertas(data.content || []);
      }
    } catch (error) {
      console.error("Erro ao carregar vitrine:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Recarrega sempre que os filtros principais, a busca ativa ou a ordenação mudarem
  useEffect(() => {
    carregarVitrine();
  }, [nomeProduto, categoriaId, diasMaxValidade, ordenacao]);

  // Previne que a página recarregue caso o utilizador pressione "Enter" no form
  const aplicarFiltrosTexto = (e) => {
    e.preventDefault();
    setNomeProduto(termoBusca.trim());
  };

  // Buscar detalhes ricos do produto ao clicar
  const abrirDetalhes = async (id) => {
    setCarregandoDetalhes(true);
    try {
      const res = await fetch(`${API_URL}/oferta/publico/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetalhesOferta(data);
      }
    } catch (error) {
      console.error("Erro detalhes:", error);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';

  return (
    <div style={{ backgroundColor: 'var(--dl-background)', minHeight: '100vh' }}>
      
      {/* HEADER PÚBLICO */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src="/logo_deadline.png" alt="Deadline" style={{ height: '35px' }} />
          </Link>
          <div className="d-flex gap-2">
             <Link to="/auth" className="btn btn-outline-success fw-bold rounded-pill px-4">Entrar / Sou Empresa</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-success text-white py-5 text-center" style={{ background: 'linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-secondary) 100%)' }}>
        <div className="container py-4">
          <h1 className="fw-bold display-5 mb-3">Salve produtos, economize muito!</h1>
          <p className="lead opacity-90 mb-0">Encontre ofertas imperdíveis de produtos próximos da validade em farmácias perto de você.</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          
          {/* SIDEBAR DE FILTROS */}
          <div className="col-lg-3">
            <div className="bg-white p-4 rounded-4 shadow-sm position-sticky" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-4 border-bottom pb-2 text-dark">🔍 Filtros</h5>
              
              <form onSubmit={aplicarFiltrosTexto}>
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Buscar Produto</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="Digite no mínimo 3 letras..." 
                         value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Categoria</label>
                  <select className="form-select bg-light border-0" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                    <option value="">Todas as Categorias</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Vence em até:</label>
                  <select className="form-select bg-light border-0" value={diasMaxValidade} onChange={(e) => setDiasMaxValidade(e.target.value)}>
                    <option value="">Qualquer data</option>
                    <option value="7">Próximos 7 dias</option>
                    <option value="15">Próximos 15 dias</option>
                    <option value="30">Próximos 30 dias</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Faixa de Preço (R$)</label>
                  <div className="d-flex gap-2">
                    <input type="number" placeholder="Min" className="form-control bg-light border-0 text-center" 
                           value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />
                    <span className="mt-1 text-muted">-</span>
                    <input type="number" placeholder="Max" className="form-control bg-light border-0 text-center" 
                           value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="btn text-white w-100 fw-bold rounded-3" style={{backgroundColor: 'var(--dl-primary)'}} onClick={() => carregarVitrine()}>
                  Aplicar Faixa de Preço
                </button>
              </form>
            </div>
          </div>

          {/* ÁREA DE PRODUTOS */}
          <div className="col-lg-9">
            
            {/* BARRA DE ORDENAÇÃO */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
              <span className="text-muted fw-bold mb-2 mb-md-0">{ofertas.length} ofertas encontradas</span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap">Ordenar por:</span>
                <select className="form-select form-select-sm bg-light border-0 fw-bold" style={{ width: '200px' }}
                        value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                  <option value="validadeProduto,asc">Vence Mais Cedo</option>
                  <option value="precoPromocional,asc">Menor Preço</option>
                  <option value="percentualDesconto,desc">Maior Desconto (%)</option>
                  <option value="id,desc">Mais Recentes</option>
                </select>
              </div>
            </div>

            {/* GRID DE PRODUTOS */}
            {carregando ? (
               <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : ofertas.length === 0 ? (
               <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                 <span style={{fontSize: '4rem'}}>😕</span>
                 <h5 className="fw-bold mt-3 text-dark">Nenhuma oferta encontrada.</h5>
                 <p className="text-muted">Tente ajustar os seus filtros de busca.</p>
               </div>
            ) : (
              <div className="row g-4">
                {ofertas.map((oferta) => (
                  <div className="col-12 col-md-6 col-xl-4" key={oferta.id}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                      
                      <div className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3 text-white fw-bold shadow-sm" 
                           style={{ backgroundColor: '#e63946', zIndex: 2, fontSize: '0.85rem' }}>
                        -{oferta.percentualDesconto?.toFixed(0)}%
                      </div>

                      <div className="bg-light text-center p-4" style={{ height: '200px' }}>
                        {oferta.foto ? (
                          <img src={oferta.foto} alt={oferta.tituloProduto} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '4rem', opacity: 0.1 }}>📦</span>
                        )}
                      </div>
                      
                      <div className="card-body d-flex flex-column p-4">
                        <span className="text-success small fw-bold mb-1 text-uppercase">{oferta.nomeCategoria}</span>
                        <h6 className="fw-bold text-dark mb-3 text-truncate" title={oferta.tituloProduto}>{oferta.tituloProduto}</h6>
                        
                        <div className="mb-3">
                          <span className="text-muted text-decoration-line-through small d-block">De: {formatarMoeda(oferta.precoOriginal)}</span>
                          <span className="fw-bold text-dark fs-4">Por: {formatarMoeda(oferta.precoPromocional)}</span>
                        </div>
                        
                        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Vence em:</small>
                            <span className="fw-bold text-danger small">{formatarData(oferta.validadeProduto)}</span>
                          </div>
                          <button className="btn btn-sm text-white fw-bold px-3 rounded-pill" style={{backgroundColor: 'var(--dl-primary)'}}
                                  onClick={() => abrirDetalhes(oferta.id)}>
                            {carregandoDetalhes ? '...' : 'Ver Detalhes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHES DA OFERTA */}
      {detalhesOferta && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              
              <div className="modal-header border-0 bg-light p-4">
                <Link to={`/loja/${detalhesOferta.empresaId}`} className="d-flex align-items-center gap-3 text-decoration-none" title="Visitar perfil da loja">
                  <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center overflow-hidden" style={{width: '50px', height: '50px'}}>
                     {detalhesOferta.logotipoEmpresa ? (
                       <img src={detalhesOferta.logotipoEmpresa} alt="Logo" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                     ) : ( <span className="fw-bold text-success">🏢</span> )}
                  </div>
                  <div>
                    <small className="text-muted d-block fw-bold" style={{fontSize: '0.75rem'}}>Vendido e entregue por:</small>
                    <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                       {detalhesOferta.nomeFantasiaEmpresa} <span style={{fontSize: '1rem'}}>↗️</span>
                    </h5>
                  </div>
                </Link>
                <button type="button" className="btn-close" onClick={() => setDetalhesOferta(null)}></button>
              </div>
              
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-5 text-center">
                    <div className="bg-light rounded-4 p-3 mb-3 d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                      {detalhesOferta.foto ? (
                        <img src={detalhesOferta.foto} alt="Produto" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : ( <span style={{ fontSize: '4rem', opacity: 0.1 }}>📦</span> )}
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-25">
                      <div className="text-start">
                        <span className="text-muted text-decoration-line-through small d-block">{formatarMoeda(detalhesOferta.precoOriginal)}</span>
                        <h3 className="fw-bold text-success m-0">{formatarMoeda(detalhesOferta.precoPromocional)}</h3>
                      </div>
                      <div className="badge bg-danger fs-6 rounded-3">-{detalhesOferta.percentualDesconto?.toFixed(0)}%</div>
                    </div>
                  </div>

                  <div className="col-md-7 d-flex flex-column">
                    <h4 className="fw-bold text-dark mb-2">{detalhesOferta.tituloProduto}</h4>
                    <p className="text-muted small mb-4">{detalhesOferta.descricao || "Sem descrição disponível."}</p>

                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>PRODUTO VENCE EM</small>
                          <span className="fw-bold text-danger">{formatarData(detalhesOferta.validadeProduto)}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-light text-center h-100">
                          <small className="text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>OFERTA ENCERRA EM</small>
                          <span className="fw-bold text-dark">{formatarData(detalhesOferta.dataFimOferta)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto border-top pt-4">
                      <h6 className="fw-bold text-dark mb-3"><span className="text-success me-2">📍</span> Informações de Retirada</h6>
                      <p className="small text-muted mb-2">
                        <strong>Endereço: </strong> 
                        {detalhesOferta.enderecoEmpresa?.logradouro}, {detalhesOferta.enderecoEmpresa?.numero} - {detalhesOferta.enderecoEmpresa?.bairro}, {detalhesOferta.enderecoEmpresa?.cidade}/{detalhesOferta.enderecoEmpresa?.uf}
                      </p>
                      <p className="small text-muted mb-2">
                        <strong>Horário: </strong> {detalhesOferta.horarioFuncionamento}
                      </p>
                      <div className="alert alert-warning small py-2 mb-0 d-flex align-items-start gap-2">
                        <span className="mt-1">📋</span>
                        <div>
                          <strong>Instruções do Lojista:</strong><br/>
                          {detalhesOferta.instrucoesRetirada}
                        </div>
                      </div>
                    </div>

                    {/* BOTÕES DE AÇÃO NO FUNDO DO MODAL */}
                  <div className="modal-footer border-top bg-light p-3 d-flex flex-wrap gap-2">
                 
                 {/* BOTÃO COMO CHEGAR */}
                 <button className="btn btn-outline-dark fw-bold rounded-pill px-4 flex-grow-1 d-flex align-items-center justify-content-center gap-2" onClick={() => abrirMapa(detalhesOferta)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                    </svg>
                    Como Chegar
                 </button>
                 
                 <div className="d-flex gap-2 flex-grow-1">
                   {/* BOTÃO WHATSAPP */}
                   <button className="btn text-white fw-bold rounded-pill px-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                           style={{backgroundColor: '#25D366'}} onClick={() => abrirWhatsApp(detalhesOferta)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                      </svg>
                      WhatsApp
                   </button>
                   
                   {/* BOTÃO E-MAIL */}
                   <button className="btn text-white fw-bold rounded-pill px-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                           style={{backgroundColor: '#0d6efd'}} onClick={() => abrirEmail(detalhesOferta)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
                      </svg>
                      E-mail
                   </button>
                 </div>
              </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}