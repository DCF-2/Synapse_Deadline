
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/theme.css';
import { obterLocalizacaoConsumidor, formatarDistancia } from '../utils/geolocalizacao';
import OfertaCard from '../components/OfertaCard';
import OfertaDetalhesModal from '../components/OfertaDetalhesModal';
import Footer from '../components/Footer';
import { useModal } from '../contexts/ModalContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function LojaPerfil() {
  const { id } = useParams();
  const { showAlert } = useModal();
  const [loja, setLoja] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [localizacao, setLocalizacao] = useState(null);

  // Estados do Modal de Detalhes
  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  useEffect(() => {
    obterLocalizacaoConsumidor()
      .then(setLocalizacao)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const carregarLoja = async () => {
      try {
        const resLoja = await fetch(`${API_URL}/empresa/publico/${id}`);
        if (resLoja.ok) setLoja(await resLoja.json());

        const url = new URL(`${API_URL}/oferta/publico`);
        url.searchParams.append('empresaId', id);
        url.searchParams.append('size', '50');
        url.searchParams.append('sort', 'id,desc');
        if (localizacao) {
          url.searchParams.append('latitude', localizacao.latitude);
          url.searchParams.append('longitude', localizacao.longitude);
        }

        const resOfertas = await fetch(url.toString());
        if (resOfertas.ok) {
           const data = await resOfertas.json();
           setOfertas(data.content || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
      }
    };
    carregarLoja();
  }, [id, localizacao]);

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';

  const formatarCnpj = (cnpj) => {
    if (!cnpj) return '';
    const num = cnpj.replace(/\D/g, '');
    if (num.length === 14) return num.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    return cnpj;
  };

  const formatarTelefone = (tel) => {
    if (!tel) return '';
    const num = tel.replace(/\D/g, '');
    if (num.length === 11) return num.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    if (num.length === 10) return num.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    return tel;
  };

  const abrirDetalhes = async (ofertaId) => {
    setCarregandoDetalhes(true);
    try {
      const url = new URL(`${API_URL}/oferta/publico/${ofertaId}`);
      const res = await fetch(url.toString());
      if (res.ok) {
         const data = await res.json();
         const ofertaListagem = ofertas.find(o => o.id === ofertaId);
         if (ofertaListagem && ofertaListagem.distanciaKm != null) {
            data.distanciaKm = ofertaListagem.distanciaKm;
         }
         setDetalhesOferta(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  // --- FUNÇÕES DE CONTACTO DIRETO DA LOJA (Gera engajamento no Dashboard) ---
  const entrarEmContatoWhatsApp = () => {
    if (!loja?.contatoWhatsapp) {
      showAlert("Indisponível", "Esta loja não disponibilizou um número de WhatsApp.");
      return;
    }
    // Registra a métrica de clique no backend (Usamos a primeira oferta ou ID geral se mapeado)
    if (ofertas.length > 0) {
      fetch(`${API_URL}/oferta/publico/${ofertas[0].id}/engajamento`, { method: 'POST' }).catch(console.error);
    }

    const fone = loja.contatoWhatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá! Vi o perfil da sua loja no Kai Ofertas e gostaria de saber mais sobre as vossas ofertas ativas.`);
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  const enviarEmailLoja = () => {
    if (!loja?.emailContato) {
      showAlert("Indisponível", "Esta loja não disponibilizou um e-mail de contacto.");
      return;
    }
    if (ofertas.length > 0) {
      fetch(`${API_URL}/oferta/publico/${ofertas[0].id}/engajamento`, { method: 'POST' }).catch(console.error);
    }

    const assunto = encodeURIComponent(`Contacto via Plataforma Kai Ofertas`);
    const corpo = encodeURIComponent(`Olá, vi o vosso catálogo de produtos com desconto no aplicativo Kai Ofertas e gostaria de tirar uma dúvida.`);
    window.open(`mailto:${loja.emailContato}?subject=${assunto}&body=${corpo}`, '_blank');
  };

  const abrirMapaExt = (endereco) => {
    if (!endereco) return;
    const query = encodeURIComponent(`${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}`);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  const getEnderecoString = () => {
    if (!loja?.endereco) return '';
    return encodeURIComponent(`${loja.endereco.logradouro}, ${loja.endereco.numero} - ${loja.endereco.bairro}, ${loja.endereco.cidade} - ${loja.endereco.uf}`);
  };

  if (carregando) return <div className="text-center py-5 mt-5"><div className="spinner-border text-success"></div></div>;
  if (!loja) return <div className="text-center py-5 mt-5 fw-bold text-muted">Loja não encontrada.</div>;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
      
      <div className="flex-grow-1">
        {/* NAVBAR */}
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark text-decoration-none" to="/">
            <span className="text-success fs-4"><img src="/icons/voltar.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> Voltar para Vitrine
          </Link>
          <div className="d-flex align-items-center gap-2 fw-bold fs-4 text-success m-0">
            <img src="/logo_deadline.png" alt="Kai Ofertas Logo" style={{ height: '45px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
            Kai Ofertas
          </div>
        </div>
      </nav>

      {/* HEADER / CAPA DA LOJA (Estilo Mercado Livre / Premium) */}
      <div className="bg-white shadow-sm mb-4">
        <div
          style={{
            height: '250px',
            minHeight: '20vh',
            backgroundImage: loja.bannerPerfil ? `url(${loja.bannerPerfil})` : 'none',
            backgroundColor: loja.bannerPerfil ? 'rgba(0, 0, 0, 0.8)' : 'var(--dl-primary)',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            ...(loja.bannerPerfil ? {} : {
              background: 'linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-secondary) 100%)'
            })
          }}
        ></div>
        
        <div className="container position-relative pb-4">
          <div className="bg-white rounded-circle shadow-lg d-flex align-items-center justify-content-center overflow-hidden border border-4 border-white position-absolute" 
               style={{ width: '140px', height: '140px', top: '-70px', left: '15px' }}>
             {loja.logotipo ? (
               <img src={loja.logotipo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = '/icons/companhia.png'; }} />
             ) : ( <img src="/icons/companhia.png" alt="icon" style={{ width: "60px", height: "60px", objectFit: "contain", opacity: 0.6 }} /> )}
          </div>
          
          <div style={{ paddingTop: '80px', paddingLeft: '15px' }}>
             <div className="d-flex align-items-center gap-2 mb-1">
               <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small rounded-pill">
                 <img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Loja Oficial Parceira
               </span>
             </div>
             
             <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
               <div>
                 <h1 className="fw-bold text-dark m-0">{loja.nomeFantasia}</h1>
                 <div className="d-flex flex-wrap gap-4 mt-2 text-muted small">
                    <span><img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {loja.endereco?.cidade} - {loja.endereco?.uf}</span>
                    {ofertas[0]?.distanciaKm != null && (
                      <span className="fw-bold text-primary">↔ {formatarDistancia(ofertas[0].distanciaKm)} de você</span>
                    )}
                    <span><img src="/icons/lista-de-controle.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {loja.horarioFuncionamento}</span>
                    {loja.cnpj && <span><strong className="text-dark">CNPJ:</strong> {formatarCnpj(loja.cnpj)}</span>}
                    {loja.contato1 && <span><strong className="text-dark">Tel 1:</strong> {formatarTelefone(loja.contato1)}</span>}
                    {loja.contato2 && <span><strong className="text-dark">Tel 2:</strong> {formatarTelefone(loja.contato2)}</span>}
                    {loja.razaoSocial && <span><strong className="text-dark">Razão Social:</strong> {loja.razaoSocial}</span>}
                 </div>
               </div>

               {/* ========================================================================= */}
               {/* ADIÇÃO: BOTÕES MODERNOS DE CONTACTO DIRETO NO PERFIL DA LOJA              */}
               {/* ========================================================================= */}
               <div className="d-flex gap-2 w-100 w-md-auto mt-2">
                 <button className="btn text-white fw-bold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" 
                         style={{ backgroundColor: '#25D366', fontSize: '0.9rem' }} onClick={entrarEmContatoWhatsApp}>
                    <img src="/icons/whatsapp.png" alt="WhatsApp" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    WhatsApp da Loja
                 </button>
                 <button className="btn text-white fw-bold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" 
                         style={{ backgroundColor: '#0d6efd', fontSize: '0.9rem' }} onClick={enviarEmailLoja}>
                    <img src="/icons/e-mail.png" alt="E-mail" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    E-mail
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* GRID DE OFERTAS DA LOJA */}
      <div className="container py-4">
         <h4 className="fw-bold mb-4 text-dark border-bottom pb-2">Produtos em Destaque</h4>
         
         {ofertas.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
               <span style={{fontSize: '3rem'}}><img src="/icons/oferta.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
               <p className="text-muted mt-3 mb-0">Esta loja não tem ofertas ativas no momento.</p>
            </div>
         ) : (
            <div className="row g-4">
              {ofertas.map((oferta) => (
                <div className="col-12 col-md-6 col-xl-3" key={oferta.id}>
                  <OfertaCard 
                    oferta={oferta} 
                    onClickCard={abrirDetalhes} 
                  />
                </div>
              ))}
            </div>
         )}
      </div>

      {/* SECÇÃO DO MAPA (NO FINAL) */}
      <div id="mapa" className="container py-5 mt-4 border-top">
         <div className="bg-white rounded-4 shadow-sm p-4">
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
               <img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Como chegar à {loja.nomeFantasia}
            </h5>
            <div className="row g-4 align-items-center">
               <div className="col-lg-4">
                  <div className="p-3 bg-light rounded-3 border">
                     <p className="fw-bold mb-1">Endereço Completo:</p>
                     <p className="text-muted small mb-3">
                        {loja.endereco?.logradouro}, {loja.endereco?.numero}<br/>
                        {loja.endereco?.bairro}<br/>
                        {loja.endereco?.cidade} - {loja.endereco?.uf}<br/>
                        CEP: {loja.endereco?.cep}
                     </p>
                     <p className="fw-bold mb-1">Retirada:</p>
                     <p className="text-muted small m-0">{loja.instrucoesRetirada || "Apresente o código da oferta no balcão."}</p>
                     <button className="btn btn-sm btn-outline-dark w-100 fw-bold rounded-pill mt-3" onClick={() => abrirMapaExt(loja.endereco)}>
                       Abrir no Google Maps ↗
                     </button>
                  </div>
               </div>
               <div className="col-lg-8">
                  <div className="rounded-3 overflow-hidden shadow-sm border" style={{ height: '300px', backgroundColor: '#e9ecef' }}>
                     {loja.endereco ? (
                       <iframe 
                         width="100%" 
                         height="100%" 
                         style={{ border: 0 }} 
                         loading="lazy" 
                         allowFullScreen 
                         src={`https://maps.google.com/maps?q=${getEnderecoString()}&t=&z=15&ie=UTF8&iwloc=&output=embed`}>
                       </iframe>
                     ) : (
                       <div className="d-flex h-100 align-items-center justify-content-center text-muted">Endereço não disponível</div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
      </div>

      {/* MODAL DE DETALHES INTEGRADO (Permite comprar direto do perfil) */}
      <OfertaDetalhesModal 
        detalhesOferta={detalhesOferta} 
        onClose={() => setDetalhesOferta(null)} 
      />

      <Footer />
    </div>
  );
}