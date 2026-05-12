export default function DashboardPage() {
    return (
      <div className="container mt-5">
        <h1 className="text-primary">Painel da Farmácia</h1>
        <p>Bem-vindo! Aqui você vai cadastrar e gerenciar os produtos próximos ao vencimento.</p>
        <button className="btn btn-danger" onClick={() => { localStorage.removeItem('deadline_token'); window.location.href='/'; }}>Sair</button>
      </div>
    );
  }