const CHAVE = 'deadline_historico_busca';
const LIMITE_BUSCAS = 10;

function dispararAtualizacao() {
  window.dispatchEvent(new CustomEvent('historico-busca-atualizado'));
}

function lerLista() {
  try {
    const raw = localStorage.getItem(CHAVE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function salvarLista(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
  dispararAtualizacao();
}

export function obterHistoricoBuscas() {
  return lerLista();
}

export function salvarNovaBusca(termo) {
  if (!termo || termo.trim() === '') return;

  const termoFormatado = termo.trim();
  if (termoFormatado.length < 3) return;

  let historico = lerLista();
  historico = historico.filter((b) => b.toLowerCase() !== termoFormatado.toLowerCase());
  historico.unshift(termoFormatado);

  if (historico.length > LIMITE_BUSCAS) {
    historico = historico.slice(0, LIMITE_BUSCAS);
  }

  salvarLista(historico);
}

export function limparHistoricoBuscas() {
  localStorage.removeItem(CHAVE);
  dispararAtualizacao();
}

export function removerBuscaDoHistorico(termo) {
  const historico = lerLista().filter((b) => b.toLowerCase() !== termo.toLowerCase());
  salvarLista(historico);
}
