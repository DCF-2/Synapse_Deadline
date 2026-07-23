const CHAVE = 'deadline_favoritos';

function dispararAtualizacao() {
  window.dispatchEvent(new CustomEvent('favoritos-atualizados'));
}

function lerLista() {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return [];
    
    // Limpeza de itens corrompidos que possam ter sido salvos anteriormente
    const lista = JSON.parse(raw);
    const listaLimpa = lista.filter(item => item && item.id !== undefined && item.tituloProduto !== undefined);
    
    if (listaLimpa.length !== lista.length) {
      localStorage.setItem(CHAVE, JSON.stringify(listaLimpa));
    }
    
    return listaLimpa;
  } catch {
    return [];
  }
}

function salvarLista(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
  dispararAtualizacao();
}

export function obterFavoritos() {
  return lerLista();
}

export function contarFavoritos() {
  return lerLista().length;
}

export function isFavorito(id) {
  return lerLista().some((f) => f.id === id);
}

export function alternarFavorito(oferta) {
  const lista = lerLista();
  const idx = lista.findIndex((f) => f.id === oferta.id);

  if (idx >= 0) {
    lista.splice(idx, 1);
    salvarLista(lista);
    return false;
  }

  lista.push({
    id: oferta.id,
    tituloProduto: oferta.tituloProduto,
    foto: oferta.foto,
    nomeCategoria: oferta.nomeCategoria,
    precoOriginal: oferta.precoOriginal,
    precoPromocional: oferta.precoPromocional,
    percentualDesconto: oferta.percentualDesconto,
    validadeProduto: oferta.validadeProduto,
    nomeFantasiaEmpresa: oferta.nomeFantasiaEmpresa,
    logotipoEmpresa: oferta.logotipoEmpresa,
    empresaId: oferta.empresaId,
    distanciaKm: oferta.distanciaKm,
    favoritadoEm: new Date().toISOString(),
  });
  salvarLista(lista);
  return true;
}

export function removerFavorito(id) {
  const lista = lerLista().filter((f) => f.id !== id);
  salvarLista(lista);
}
