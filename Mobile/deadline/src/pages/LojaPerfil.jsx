import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/react';
import OfertaCard from '../components/OfertaCard';
import OfertaDetalhesModal from '../components/OfertaDetalhesModal';
import '../styles/theme.css';
import { obterFavoritos, alternarFavorito, obterLocalizacaoConsumidor, calcularDistanciaHaversine } from '../utils/storage_mobile';

const API_URL = import.meta.env.VITE_API_URL;

export default function LojaPerfil() {
  const { id } = useParams();
  const [loja, setLoja] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Detalhes
  const [detalhesOferta, setDetalhesOferta] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  
  const [mostrarDetalhesLoja, setMostrarDetalhesLoja] = useState(false);
  const [favoritosIds, setFavoritosIds] = useState(obterFavoritos());

  const carregarLoja = async () => {
    try {
      const resLoja = await fetch(`${API_URL}/empresa/publico/${id}`);
      if (!resLoja.ok) throw new Error("Loja não encontrada");
      const dataLoja = await resLoja.json();
      setLoja(dataLoja);

      let urlOfertas = `${API_URL}/oferta/publico?empresaId=${id}&size=50&sort=id,desc`;
      try {
        const loc = await obterLocalizacaoConsumidor();
        if (loc) {
          urlOfertas += `&latitude=${loc.latitude}&longitude=${loc.longitude}`;
        }
      } catch(e) { console.error("Sem permissão gps"); }

      const resOfertas = await fetch(urlOfertas);
      if (resOfertas.ok) {
        const dataOfertas = await resOfertas.json();
        setOfertas(dataOfertas.content || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarLoja();
  }, [id]);

  const handleRefresh = async (event) => {
    await carregarLoja();
    event.detail.complete();
  };

  const handleToggleFavorito = (ofertaId, e) => {
    e.stopPropagation();
    alternarFavorito(ofertaId);
    setFavoritosIds(obterFavoritos());
  };

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';
  const getEnderecoString = () => {
    if (!loja?.endereco) return '';
    const end = loja.endereco;
    return encodeURIComponent(`${end.logradouro}, ${end.numero} - ${end.bairro}, ${end.cidade} - ${end.uf}, Brasil`);
  };

  const abrirDetalhes = async (ofertaId) => {
    setCarregandoDetalhes(true);
    try {
      let queryParams = "";
      try {
        const loc = await obterLocalizacaoConsumidor();
        if (loc) {
          queryParams = `?latitude=${loc.latitude}&longitude=${loc.longitude}`;
        }
      } catch(e) { console.error("Sem permissão gps"); }

      const res = await fetch(`${API_URL}/oferta/publico/${ofertaId}${queryParams}`);
      if (res.ok) setDetalhesOferta(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const entrarEmContatoWhatsApp = () => {
    if (!loja?.contatoWhatsapp) {
      alert("Esta loja não disponibilizou um número de WhatsApp.");
      return;
    }
    if (ofertas.length > 0) {
      fetch(`${API_URL}/oferta/publico/${ofertas[0].id}/engajamento`, { method: 'POST' }).catch(console.error);
    }
    const fone = loja.contatoWhatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá! Vi o perfil da sua loja no Deadline e gostaria de saber mais sobre as vossas ofertas ativas.`);
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  if (carregando) return (
    <IonPage><IonContent fullscreen><div className="text-center py-5 mt-5"><div className="spinner-border text-success"></div></div></IonContent></IonPage>
  );
  if (!loja) return (
    <IonPage><IonContent fullscreen><div className="text-center py-5 mt-5 fw-bold text-muted">Loja não encontrada.</div></IonContent></IonPage>
  );

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon="lines" refreshingSpinner="circles" />
        </IonRefresher>

        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '40px' }}>
          
          <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
            <div className="container px-3 d-flex justify-content-between align-items-center">
              <Link className="navbar-brand d-flex align-items-center gap-1 fw-bold text-dark text-decoration-none" to="/" style={{ fontSize: '0.9rem' }}>
                <span className="text-success fs-5">←</span> Vitrine
              </Link>
              <img src="/logo_deadline.png" alt="Deadline" style={{ height: '26px' }} />
            </div>
          </nav>

          {/* BANNER E PERFIL COMPACTADOS */}
          <div className="bg-white shadow-sm mb-3">
            <div style={{ 
              height: '110px', 
              backgroundImage: loja.bannerPerfil ? `url(${loja.bannerPerfil})` : 'none',
              backgroundColor: loja.bannerPerfil ? '#f3f4f6' : 'var(--dl-primary)',
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}></div>
            <div className="container position-relative pb-3 px-3">
              <div className="bg-white rounded-circle shadow d-flex align-items-center justify-content-center overflow-hidden border border-3 border-white position-absolute" 
                   style={{ width: '90px', height: '90px', top: '-45px', left: '15px' }}>
                 {loja.logotipo ? (
                   <img src={loja.logotipo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                 ) : ( <span style={{ fontSize: '2.5rem' }}><img src="/icons/loja.png" alt="icon" style={{ width: "40px", height: "40px", objectFit: "contain" }} /></span> )}
              </div>
              
              <div style={{ paddingTop: '50px' }}>
                 <h4 className="fw-bold text-dark m-0">{loja.nomeFantasia}</h4>
                 <div className="d-flex flex-wrap gap-2 mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                    <span><img src="/icons/mapa.png" alt="icon" style={{ width: "16px", height: "16px", objectFit: "contain", marginRight: "4px" }} /> {loja.endereco?.cidade} - {loja.endereco?.uf}</span>
                 </div>
                 
                 <div className="d-flex gap-2 mt-2">
                   <button className="btn btn-sm text-white fw-bold rounded-pill px-3 flex-grow-1 d-flex justify-content-center align-items-center gap-1" 
                           style={{ backgroundColor: '#25D366', fontSize: '0.75rem' }} onClick={entrarEmContatoWhatsApp}>
                      <img src="/icons/whatsapp.png" alt="WhatsApp" style={{ width: '16px', height: '16px' }} /> Contatar
                   </button>
                   <button className="btn btn-sm text-primary fw-bold rounded-pill px-3 border border-primary bg-white d-flex justify-content-center align-items-center gap-1" 
                           style={{ fontSize: '0.75rem' }} onClick={() => setMostrarDetalhesLoja(!mostrarDetalhesLoja)}>
                      {mostrarDetalhesLoja ? 'Ocultar Info' : 'Ver Mais Info'}
                   </button>
                 </div>

                 {/* ACORDEÃO (Sanfona) DE DETALHES DA LOJA */}
                 {mostrarDetalhesLoja && (
                   <div className="mt-3 p-3 bg-light rounded-4 border shadow-sm">
                     <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.8rem' }}>Informações da Loja</h6>
                     <div className="d-flex flex-column gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
                       <div><strong><img src="/icons/lista-de-controle.png" alt="icon" style={{ width: "14px", height: "14px", objectFit: "contain", marginRight: "4px" }} /> Horários:</strong> <br/> {loja.horarioFuncionamento}</div>
                       {loja.cnpj && <div><strong>CNPJ:</strong> {loja.cnpj}</div>}
                       {loja.razaoSocial && <div><strong>Razão Social:</strong> {loja.razaoSocial}</div>}
                       {loja.contato1 && <div><strong>Telefone Principal:</strong> {loja.contato1}</div>}
                       {loja.contato2 && <div><strong>Telefone Secundário:</strong> {loja.contato2}</div>}
                       {loja.emailContato && <div><strong>E-mail:</strong> {loja.emailContato}</div>}
                       <div className="mt-1 pt-2 border-top">
                         <strong>Endereço Completo:</strong><br/>
                         {loja.endereco?.logradouro}, {loja.endereco?.numero}<br/>
                         {loja.endereco?.bairro}, {loja.endereco?.cidade} - {loja.endereco?.uf}<br/>
                         {loja.endereco?.cep}
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>

          <div className="container px-3">
            <h6 className="fw-bold text-muted mb-2 small">Ofertas desta Farmácia ({ofertas.length})</h6>
            
            {ofertas.length === 0 ? (
              <div className="text-center py-4 bg-white rounded-4 shadow-sm">
                <p className="text-muted small mb-0">Nenhum produto em oferta no momento.</p>
              </div>
            ) : (
              /* GRID DE MINIATURAS DA LOJA - OTIMIZADO PARA MOBILE */
              <div className="row g-2">
                {ofertas.map((oferta) => (
                  <div className="col-6 col-md-4 col-xl-3" key={oferta.id}>
                    <OfertaCard 
                      oferta={oferta} 
                      favoritosIds={favoritosIds} 
                      handleToggleFavorito={handleToggleFavorito} 
                      abrirDetalhes={abrirDetalhes}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MAPA DA EMPRESA NO FINAL DA PÁGINA */}
          {loja.endereco && (
            <div className="container px-3 mt-4 mb-3">
              <h6 className="fw-bold text-dark mb-2">Localização da Farmácia</h6>
              <div className="rounded-4 overflow-hidden border shadow-sm" style={{ height: '220px', backgroundColor: '#e9ecef' }}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${getEnderecoString()}&t=&z=15&ie=UTF8&iwloc=&output=embed`}>
                </iframe>
              </div>
            </div>
          )}

          {/* DETALHES DA OFERTA (PERMANECE COM FORMATO MODAL DO ORIGINAL CASO SEJA ACIONADO) */}
          <OfertaDetalhesModal 
            detalhesOferta={detalhesOferta} 
            setDetalhesOferta={setDetalhesOferta} 
            formatarMoeda={formatarMoeda} 
            formatarData={formatarData} 
          />

        </div>
      </IonContent>
    </IonPage>
  );
}