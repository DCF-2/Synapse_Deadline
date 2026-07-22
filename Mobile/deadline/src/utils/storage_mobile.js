// src/utils/storage_mobile.js
// Utilitários de armazenamento persistente para o Mobile (Capacitor/WebView)

const STORAGE_KEYS = {
  FAVORITOS: '@deadline_favoritos',
  HISTORICO_BUSCA: '@deadline_historico_busca'
};

const LIMITE_BUSCAS = 10;

// ==========================================
// FUNÇÕES DE FAVORITOS
// ==========================================

export const obterFavoritos = () => {
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.FAVORITOS);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error("Erro ao obter favoritos", error);
    return [];
  }
};

export const salvarFavoritos = (favoritos) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITOS, JSON.stringify(favoritos));
  } catch (error) {
    console.error("Erro ao salvar favoritos", error);
  }
};

export const isFavorito = (ofertaId) => {
  const favoritos = obterFavoritos();
  return favoritos.some(id => id === ofertaId);
};

export const alternarFavorito = (ofertaId) => {
  let favoritos = obterFavoritos();
  if (favoritos.includes(ofertaId)) {
    favoritos = favoritos.filter(id => id !== ofertaId);
  } else {
    favoritos.push(ofertaId);
  }
  salvarFavoritos(favoritos);
  return favoritos.includes(ofertaId); // Retorna true se agora for favorito, false se não for
};

export const contarFavoritos = () => {
  return obterFavoritos().length;
};

// ==========================================
// FUNÇÕES DE HISTÓRICO DE BUSCA
// ==========================================

export const obterHistoricoBuscas = () => {
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.HISTORICO_BUSCA);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error("Erro ao obter histórico de buscas", error);
    return [];
  }
};

export const salvarNovaBusca = (termo) => {
  if (!termo || termo.trim() === '') return;
  
  const termoFormatado = termo.trim();
  let historico = obterHistoricoBuscas();
  
  // Remove se já existe para colocar no topo (mais recente)
  historico = historico.filter(b => b.toLowerCase() !== termoFormatado.toLowerCase());
  
  // Adiciona no topo
  historico.unshift(termoFormatado);
  
  // Mantém apenas o limite
  if (historico.length > LIMITE_BUSCAS) {
    historico = historico.slice(0, LIMITE_BUSCAS);
  }
  
  localStorage.setItem(STORAGE_KEYS.HISTORICO_BUSCA, JSON.stringify(historico));
};

export const limparHistoricoBuscas = () => {
  localStorage.removeItem(STORAGE_KEYS.HISTORICO_BUSCA);
};

export const removerBuscaDoHistorico = (termo) => {
    let historico = obterHistoricoBuscas();
    historico = historico.filter(b => b.toLowerCase() !== termo.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.HISTORICO_BUSCA, JSON.stringify(historico));
};

import { Geolocation } from '@capacitor/geolocation';

export const obterLocalizacaoConsumidor = async () => {
  try {
    const hasPermission = await Geolocation.checkPermissions();
    if (hasPermission.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      if (request.location !== 'granted') {
        throw new Error('Permissão de localização negada.');
      }
    }

    const posicao = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });

    return {
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude
    };
  } catch (error) {
    console.error("Erro ao usar Capacitor Geolocation, tentando fallback para Web...", error);
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (err) => {
            console.error("Erro no fallback de geolocalização web:", err);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        resolve(null);
      }
    });
  }
};

export const calcularDistanciaHaversine = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
