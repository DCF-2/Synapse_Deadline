# **🕒 Projeto Deadline**

## **🎯 Sobre o Projeto**

No setor farmacêutico, o desperdício de produtos por vencimento é um problema financeiro e regulatório grave, gerando o custo da perda do produto e a taxa de descarte especializado.

O **Deadline** atua como uma vitrine inteligente para resolver este problema. A plataforma transforma um passivo (produto a ser descartado) em fluxo de caixa, atraindo clientes para a loja física e promovendo o acesso mais barato a itens de saúde, dermocosméticos e higiene para a população.

## **🚀 O Core do MVP**

Para garantir o sucesso do nosso Produto Mínimo Viável, focamos em um fluxo simples e sem atrito. **Se isso funcionar, o projeto funciona:**

1. 🏪 **A Empresa cadastra o produto facilmente.**  
2. 👤 **O Cliente encontra o produto perto dele.**  
3. 📍 **O Cliente vai até a loja física retirar.** *(Sem delivery ou pagamentos online nesta versão)*.

## **⚙️ Funcionalidades Principais**

### **👤 Para o Consumidor (Acesso Livre, Sem Login)**

* **Vitrine Inteligente**: Visualizar lista de produtos próximos ao vencimento.  
* **Busca e Filtros**: Filtrar por raio de distância, faixa de preço, tipo de produto e data de validade.  
* **Ordenação**: Priorizar resultados por menor distância, menor preço ou validade mais curta.  
* **Detalhes da Oferta**: Visualizar o nome do produto, preço original, preço promocional (% de desconto), validade, nome/endereço da farmácia e instruções de retirada.

### **🏪 Para a Empresa (Farmácia / Drogaria)**

* **Gestão de Conta**: Cadastro da farmácia (nome, ramo, localização, contato, instruções) e login seguro.  
* **Cadastro Ágil de Produtos**: Inserção rápida de produtos informando apenas preço original e desconto (ou preço final) — *o sistema calcula o restante automaticamente*.  
* **Painel de Controle (Dashboard)**: Listagem de produtos ativos, visualização de histórico de produtos vencidos e opção de exclusão manual (caso o item seja vendido fora do app).

## **🛠️ Stack Tecnológico e Arquitetura**

O sistema foi desenhado visando escalabilidade futura, mantendo a simplicidade para a versão 1.0 (MVP).

* **Backend / API**: Java com Spring Boot \- Responsável pelo motor de regras de negócio, cálculos automáticos de descontos e inativação de produtos.  
* **Banco de Dados**: PostgreSQL \- Para integridade e relacionamento sólido entre estabelecimentos e estoque.  
* **Frontend Empresa**: React.js \- Painel web intuitivo focado na velocidade do lojista.  
* **Frontend Consumidor (PWA)**: Ionic Framework \- Interface focada no mobile (Progressive Web App), rodando no navegador com aparência de aplicativo nativo.  
* **Testes Automatizados**: JUnit \- Garantia de qualidade nas lógicas de precificação e validação de datas.

## **🧠 Regras de Negócio Fundamentais**

1. **Vínculo Obrigatório**: Todo produto existe apenas se atrelado a uma Farmácia válida.  
2. **Ocultação Automática**: Produtos cuja validade atual seja menor ou igual à data de hoje somem imediatamente da visão do consumidor.  
3. **Cálculo Matemático na API**: O backend garante a consistência do Desconto x Preço Final na hora do cadastro, prevenindo fraudes de interface.  
4. **Exclusividade Presencial**: Transação e pagamento ocorrem balcão a balcão. O Deadline age apenas como o gerador do tráfego (Lead).

## **🔮 Roadmap / Diferenciais Futuros**

Embora não façam parte do MVP inicial, estas "features" compõem a visão de longo prazo do Deadline:

* 🚨 **Filtro por Urgência**: Etiquetas visuais de *"Vence Hoje\!"* ou *"Vence em 2 dias"*, criando senso de escassez (modelo iFood promo).  
* 🗺️ **Mapa de Ofertas**: Visualização estilo Google Maps para encontrar promoções passeando pelo bairro.  
* ♻️ **Métricas de Impacto**: Mostrar ao usuário e à farmácia quantos KGs de desperdício/descarte foram evitados.  
* 🤖 **Sugestão Automática de Preço**: Inteligência para sugerir % de desconto ideal baseado nos dias restantes para o vencimento.

## **🎓 Equipe e Instituição**

Este é um projeto acadêmico de **Projeto e Desenvolvimento de Software** desenvolvido no **Instituto Federal de Pernambuco (IFPE) \- Campus Recife**.

**Orientadores:** Prof. Vilmar Santos Nepomuceno e Prof. Eduardo de Melo.

**Desenvolvedores:**

* Davi Freitas  
* Marcos André  
* Gustavo Medeiros  
* Vitor Lucas  
* Niviane Cas  
* Maria Alane