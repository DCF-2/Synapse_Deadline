/**
 * Códigos de erro da Geolocation API:
 * 1 = PERMISSION_DENIED
 * 2 = POSITION_UNAVAILABLE
 * 3 = TIMEOUT
 */

const ESTRATEGIAS = [
  // Desktop / rede Wi‑Fi — funciona melhor no Chromium/Linux
  { enableHighAccuracy: false, timeout: 25000, maximumAge: 600000 },
  // GPS preciso — celular ou notebook com GPS
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 120000 },
];

function tentarPosicao(opcoes) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, opcoes);
  });
}

export function contextoGeolocalizacaoSuportado() {
  if (typeof window === 'undefined') return { ok: false, motivo: 'Ambiente sem navegador.' };
  if (!window.isSecureContext) {
    return {
      ok: false,
      motivo: 'Acesse via http://localhost:5173 (não use IP da rede). O navegador bloqueia GPS em HTTP externo.',
      codigo: 'inseguro',
    };
  }
  if (!navigator.geolocation) {
    return { ok: false, motivo: 'Geolocalização não suportada neste navegador.', codigo: 'indisponivel' };
  }
  return { ok: true };
}

/**
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export async function obterLocalizacaoConsumidor() {
  const ctx = contextoGeolocalizacaoSuportado();
  if (!ctx.ok) {
    const err = new Error(ctx.motivo);
    err.code = ctx.codigo === 'inseguro' ? 'INSECURE' : 0;
    throw err;
  }

  let ultimoErro = null;

  for (const opcoes of ESTRATEGIAS) {
    try {
      const pos = await tentarPosicao(opcoes);
      if (pos?.coords?.latitude != null && pos?.coords?.longitude != null) {
        return {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      }
    } catch (err) {
      ultimoErro = err;
      // Permissão negada — não adianta tentar de novo com outra estratégia
      if (err?.code === 1) throw err;
    }
  }

  throw ultimoErro || new Error('Não foi possível obter a localização.');
}

/**
 * Mensagem amigável para exibir na UI.
 */
export function mensagemErroGeolocalizacao(err) {
  if (err?.code === 'INSECURE' || err?.code === 'inseguro') {
    return 'Use http://localhost:5173 para permitir localização. Acesso por IP (ex.: 192.168.x.x) é bloqueado pelo navegador.';
  }
  switch (err?.code) {
    case 1:
      return 'Permissão negada. Clique no cadeado na barra de endereço e permita "Localização" para este site.';
    case 2:
      return 'Localização indisponível neste dispositivo. Verifique se o serviço de localização do sistema está ativo.';
    case 3:
      return 'Tempo esgotado ao obter GPS. Clique em "Tentar novamente" — usaremos localização por rede (Wi‑Fi).';
    default:
      return 'Não foi possível obter sua localização. Tente novamente ou use http://localhost:5173.';
  }
}

export function statusDeErroGeolocalizacao(err) {
  if (err?.code === 'INSECURE' || err?.code === 'inseguro') return 'inseguro';
  if (err?.code === 1) return 'negado';
  if (err?.code === 3) return 'timeout';
  return 'indisponivel';
}

/**
 * Formata distância em km para exibição amigável.
 */
export function formatarDistancia(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}
