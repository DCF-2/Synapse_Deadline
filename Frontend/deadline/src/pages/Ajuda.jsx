import React from 'react';
import { Link } from 'react-router-dom';

export default function Ajuda() {
  return (
    <>
      {/* CABEÇALHO DA PÁGINA */}
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Guia Básico de Ajuda ao Usuário</h2>
          <p className="text-muted small m-0 mt-1">Como funciona o nosso sistema?</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-10 mx-auto">
          
          {/* INTRODUÇÃO */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-center" style={{ backgroundColor: 'var(--dl-primary)', color: 'white' }}>
            <h4 className="fw-bold mb-3">Bem-vindo à nossa página de ajuda! 👋</h4>
            <p className="mb-4 opacity-90">
              Criamos este guia simples para que você entenda como navegar pelo sistema e aproveitar todas as suas ferramentas. O funcionamento básico do site é dividido em duas etapas principais:
            </p>
            <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
              <div className="bg-white text-dark p-3 rounded-3 shadow-sm flex-grow-1 text-start">
                <h6 className="fw-bold text-success mb-1">1. Cadastrar o Produto</h6>
                <p className="small m-0 text-muted">Você adiciona os itens que vende (ex: Dipirona 30 comprimidos).</p>
              </div>
              <div className="bg-white text-dark p-3 rounded-3 shadow-sm flex-grow-1 text-start">
                <h6 className="fw-bold text-success mb-1">2. Criar a Oferta</h6>
                <p className="small m-0 text-muted">Usando o produto que já cadastrou, você cria a promoção visível no site.</p>
              </div>
            </div>
          </div>

          <h5 className="fw-bold text-dark mb-4 text-center mt-5">Abaixo, explicamos o que você encontra em cada página do menu:</h5>

          {/* SESSÃO 1: DASHBOARD */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: '5px solid #52b788' }}>
            <h5 className="fw-bold text-dark mb-3">📊 1. Dashboard (Painel Inicial)</h5>
            <p className="text-muted mb-3">
              Essa é a primeira página que você vê assim que entra com seu login e senha. É o "resumo" do seu negócio.
            </p>
            <ul className="text-muted small mb-0">
              <li className="mb-2"><strong>O que tem aqui:</strong> Você acompanha os números e estatísticas das suas vendas.</li>
              <li><strong>Facilidade:</strong> Existem botões rápidos para as ações que você mais usa no dia a dia, como criar uma oferta nova direto por ali ou ver as últimas ofertas criadas.</li>
            </ul>
          </div>

          {/* SESSÃO 2: MEUS PRODUTOS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: '5px solid #1E3A5F' }}>
            <h5 className="fw-bold text-dark mb-3">📦 2. Meus Produtos</h5>
            <p className="text-muted mb-3">
              Aqui é onde você gerencia tudo o que a sua empresa vende. É o seu estoque no sistema.
            </p>
            
            <h6 className="fw-bold text-dark small mt-3">Como cadastrar um produto? Cada item precisa de:</h6>
            <div className="bg-light p-3 rounded-3 mb-3">
              <ul className="text-muted small mb-0 row">
                <li className="col-md-6 mb-1"><strong>Nome:</strong> Que será o título do anúncio.</li>
                <li className="col-md-6 mb-1"><strong>Código de barras</strong></li>
                <li className="col-md-6 mb-1"><strong>Categoria</strong></li>
                <li className="col-md-6 mb-1"><strong>Foto do produto</strong></li>
                <li className="col-md-6 mb-1"><strong>Preço original:</strong> o preço normal, sem desconto.</li>
                <li className="col-md-12 mb-1"><strong>Descrição:</strong> detalhes sobre o item, que o cliente verá ao clicar.</li>
              </ul>
            </div>

            <ul className="text-muted small mb-0">
              <li className="mb-2"><strong>Ativar e Desativar:</strong> Se você parou de vender um produto temporariamente, você pode mudar o status dele para "Inativo". Assim, ele fica guardado no sistema, mas não aparece na lista principal.</li>
              <li><strong>Organização:</strong> Você pode usar a barra de busca (pesquisando pelo nome ou código de barras) e usar filtros por categoria ou status para achar qualquer item em segundos.</li>
            </ul>
          </div>

          {/* SESSÃO 3: MINHAS OFERTAS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: '5px solid #e63946' }}>
            <h5 className="fw-bold text-dark mb-3">🏷️ 3. Minhas Ofertas</h5>
            <p className="text-muted mb-3">
              Nesta página é onde a mágica acontece! É aqui que você cria as promoções que os clientes finais vão enxergar no site.
            </p>

            <h6 className="fw-bold text-dark small mt-3">Como criar uma oferta:</h6>
            <ul className="text-muted small mb-3">
              <li className="mb-2"><strong>Escolha o produto base:</strong> Escolha um item que você já cadastrou antes na aba "Meus Produtos".</li>
              <li><strong>Defina o preço:</strong> Você pode digitar o novo preço com desconto OU a porcentagem de desconto. O sistema é inteligente: quando você preenche um campo, o outro é calculado de forma automática!</li>
            </ul>

            <div className="alert alert-warning border-warning-subtle rounded-3 small text-dark mb-3">
              <h6 className="fw-bold text-danger mb-2">⚠️ Atenção às Datas (Muito Importante):</h6>
              <p className="mb-2">Para evitar confusões, existem dois campos de data diferentes:</p>
              <ul className="mb-0">
                <li className="mb-1"><strong>"Produto vence em":</strong> É a data de validade real que está impressa na embalagem do produto.</li>
                <li><strong>"Retirar oferta do ar em":</strong> É o dia em que a promoção deve sumir do site. <em>Dica: Isso é ótimo para produtos (como remédios) que o cliente precisa de um tempo para usar antes de vencer. Se um remédio dura 30 dias, tire a oferta do ar 30 dias antes do vencimento real.</em></li>
              </ul>
            </div>

            <p className="text-muted small mb-0">
              <strong>Organização:</strong> Assim como na página de produtos, aqui você também pode buscar e filtrar suas ofertas facilmente.
            </p>
          </div>

          {/* SESSÃO 4: CONFIGURAÇÕES */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ borderLeft: '5px solid #eeab45' }}>
            <h5 className="fw-bold text-dark mb-3">⚙️ 4. Configurações (Dados da Empresa)</h5>
            <p className="text-muted mb-3">
              Nesta aba você confere e atualiza todas as informações do seu negócio. Ela é dividida em três partes:
            </p>
            <ul className="text-muted small mb-0">
              <li className="mb-2"><strong>Empresa:</strong> Onde ficam o Nome, Razão Social, Ramo de atividade e o CNPJ.</li>
              <li className="mb-2"><strong>Contatos:</strong> Onde você insere os telefones e e-mails para que possamos falar com você.</li>
              <li><strong>Localização:</strong> O endereço físico da sua loja. É muito importante manter o endereço correto para que os clientes saibam exatamente onde buscar os produtos comprados!</li>
            </ul>
          </div>

          {/* FOOTER DE SUPORTE */}
          <div className="bg-light border rounded-4 p-4 text-center mt-5">
            <h5 className="fw-bold text-dark mb-2">💡 Ainda tem dúvidas?</h5>
            <p className="text-muted small mb-4">
              Se precisar de ajuda com algum passo, nossa equipe de suporte está sempre à disposição!
            </p>
            <div className="d-flex justify-content-center gap-3">
              <a href="mailto:suporte@deadline.com" className="btn btn-outline-dark fw-bold rounded-pill px-4">
                ✉️ Enviar E-mail
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}