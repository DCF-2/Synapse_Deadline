import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/react';
import '../styles/theme.css';
import { obterFavoritos, alternarFavorito, obterLocalizacaoConsumidor, calcularDistanciaHaversine } from '../utils/storage_mobile';
import OfertaCard from '../components/OfertaCard';
import OfertaDetalhesModal from '../components/OfertaDetalhesModal';

const API_URL = 'https://synapse-deadline.onrender.com';

export default function Favoritos() {
  const history = useHistory();
  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [favoritosIds, setFavoritosIds] = useState(obterFavoritos());
  const [detalhesOferta, setDetalhesOferta] = useState(null);

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  const formatarData = (data) => data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : '—';

  const carregarFavoritos = async () => {
    setCarregando(true);
    const ids = obterFavoritos();
    setFavoritosIds(ids);
    
    if (ids.length === 0) {
      setOfertas([]);
      setCarregando(false);
      return;
    }

    try {
      let queryParams = "";
      try {
        const loc = await obterLocalizacaoConsumidor();
        if (loc) {
          queryParams = `?latitude=${loc.latitude}&longitude=${loc.longitude}`;
        }
      } catch(e) { console.error("Sem permissão gps"); }

      // Buscar cada oferta favorita individualmente
      const promessas = ids.map(id => fetch(`${API_URL}/oferta/publico/${id}${queryParams}`).then(res => res.ok ? res.json() : null));
      let resultados = await Promise.all(promessas);
      
      resultados = resultados.filter(oferta => oferta !== null);
      setOfertas(resultados);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarFavoritos();
  }, []);

  const handleRefresh = async (event) => {
    await carregarFavoritos();
    event.detail.complete();
  };

  const handleToggleFavorito = (ofertaId, e) => {
    e.stopPropagation();
    alternarFavorito(ofertaId);
    // Atualiza a lista local de favoritos (mas não remove imediatamente da tela para não quebrar a UX até atualizar a página)
    setFavoritosIds(obterFavoritos());
  };

  const abrirDetalhes = async (ofertaId) => {
    try {
      let queryParams = "";
      try {
        const loc = await obterLocalizacaoConsumidor();
        if (loc) {
          queryParams = `?latitude=${loc.latitude}&longitude=${loc.longitude}`;
        }
      } catch(e) { console.error("Sem permissão gps"); }

      const res = await fetch(`${API_URL}/oferta/publico/${ofertaId}${queryParams}`);
      if (res.ok) {
        setDetalhesOferta(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

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
                <span className="text-success fs-5">←</span> Voltar
              </Link>
              <h1 className="m-0 fw-bold text-dark" style={{ fontSize: '1rem' }}>Meus Favoritos</h1>
              <div style={{ width: '60px' }}></div> {/* Espaçador */}
            </div>
          </nav>

          <div className="container px-3 mt-4">
            
            {carregando ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success"></div>
              </div>
            ) : ofertas.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <span style={{ fontSize: '3rem' }}>💔</span>
                <h6 className="fw-bold mt-2 text-dark">Nenhum favorito ainda.</h6>
                <p className="text-muted small mb-0">As ofertas que você favoritar aparecerão aqui.</p>
              </div>
            ) : (
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
