import { Link } from 'react-router-dom';

export default function ClienteHomePage() {
    return (
      <div className="container mt-5 text-center">
        <h1 className="text-success">Vitrine de Produtos</h1>
        <p>Aqui o cliente final vai ver os remédios e cosméticos com desconto.</p>
        <Link to="/" className="btn btn-outline-secondary">Voltar ao Início</Link>
      </div>
    );
  }