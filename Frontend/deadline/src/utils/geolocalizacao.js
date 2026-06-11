/**
 * Obtém a localização do consumidor via API nativa do navegador.
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function obterLocalizacaoConsumidor() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  });
}

/**
 * Formata distância em km para exibição amigável.
 * @param {number|null|undefined} km
 * @returns {string|null}
 */
export function formatarDistancia(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}
