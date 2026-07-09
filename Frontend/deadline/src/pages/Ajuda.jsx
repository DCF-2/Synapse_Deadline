import React from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Ajuda() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Central de Ajuda</h2>
          <p className="text-muted small m-0 mt-1">Aprenda a utilizar o sistema Deadline e tire suas dúvidas sobre o fluxo de ofertas.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          
          {/* Card: Como Funciona o Sistema */}468605 - 20261.Y6-RC.5M - Computação na Nuvem (67.5H) - MARCO EUGÊNIO 
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Como funciona o fluxo do sistema?</h5>
            <p className="text-muted mb-0">
              O sistema consiste em duas etapas simples: primeiro, você <strong>cadastra um produto</strong> na sua base (por exemplo, uma caixa de Dipirona com 30 comprimidos). Depois, você utiliza esse mesmo produto base para <strong>criar ofertas</strong> direcionadas ao consumidor final.
            </p>
          </div>

          {/* Card: Dashboard */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: '4px solid #52b788' }}>
            <h5 className="fw-bold text-dark mb-2">📊 Dashboard</h5>
            <p className="text-muted mb-0">
              É a tela inicial do sistema. Aqui você encontra as <strong>estatísticas do seu negócio</strong> e botões de atalho para ações recorrentes, como adicionar uma oferta rapidamente ou conferir as últimas ofertas criadas.
            </p>
          </div>

          {/* Card: Meus Produtos */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: '4px solid #1E3A5F' }}>
            <h5 className="fw-bold text-dark mb-3">📦 Meus Produtos</h5>
            <p className="text-muted mb-3">
              Nesta aba, você gerencia a sua base de itens. Cada produto exige informações como: <strong>nome (título do anúncio), código de barras, categoria, preço original (sem promoção), descrição e imagem</strong>.
            </p>
            <div className="alert alert-light border m-0 small text-muted">
              <strong>Dica de Organização:</strong> Você pode usar a barra de pesquisas (por nome ou código de barras) e filtrar por categoria. Caso não esteja mais comercializando um item, você pode <strong>inativá-lo</strong> para que ele pare de aparecer nos seus filtros.
            </div>
          </div>

          {/* Card: Minhas Ofertas */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: '4px solid #e63946' }}>
            <h5 className="fw-bold text-dark mb-3">📢 Minhas Ofertas</h5>
            <p className="text-muted mb-3">
              Aqui é onde a mágica acontece. Você seleciona um produto base e define a promoção que ficará visível para o cliente. Nesta página, você também conta com filtros de status, categoria e ordenação.
            </p>
            
            <h6 className="fw-bold text-dark mt-4 mb-2">💲 Como funciona a Precificação?</h6>
            <p className="text-muted small mb-3">
              Ao criar ou editar uma oferta, basta preencher <strong>ou a porcentagem de desconto ou o preço final</strong>. O sistema preencherá o outro campo automaticamente para facilitar o seu trabalho.
            </p>

            <h6 className="fw-bold text-dark mt-4 mb-2">⏳ Como funcionam as Datas de Validade?</h6>
            <p className="text-muted small mb-0">
              Existem dois campos de data que podem gerar confusão, mas possuem funções diferentes:
            </p>
            <ul className="text-muted small mt-2 mb-0">
              <li className="mb-2"><strong>Produto Vence em:</strong> É a data de validade real impressa na embalagem do produto.</li>
              <li><strong>Retirar oferta do ar em:</strong> É a data em que o anúncio sumirá do aplicativo. Isso é útil para produtos que exigem um tempo mínimo de uso (ex: um remédio de uso diário de 30 comprimidos deve sair do ar 30 dias antes de vencer).</li>
            </ul>
          </div>

          {/* Card: Configurações */}
          <div className="card border-0 shadow-sm rounded-4 p-4" style={{ borderLeft: '4px solid #eeab45' }}>
            <h5 className="fw-bold text-dark mb-2">⚙️ Configurações</h5>
            <p className="text-muted mb-0">
              Nesta aba, você gerencia todas as informações vitais da sua empresa divididas em três seções: <strong>Empresa</strong> (Nome, Razão Social, CNPJ e Ramo), <strong>Contatos</strong> (WhatsApp, e-mail e telefones) e <strong>Localização</strong> (endereço completo, essencial para o cliente saber onde retirar a oferta).
            </p>
          </div>

        </div>
      </div>
    </>
  );
}