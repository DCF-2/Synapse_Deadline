import { Link } from 'react-router-dom';

export default function IndexPage() {
  return (
    <div className="container vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Deadline</h1>
        <p className="lead text-muted">A ponte entre economia e sustentabilidade.</p>
      </div>

      <div className="row w-100 max-w-75 justify-content-center gap-4">
        {/* Card do Cliente */}
        <div className="col-md-5">
          <div className="card h-100 shadow-sm border-0 text-center p-4">
            <h3 className="fw-bold mb-3">Para Clientes</h3>
            <p className="text-muted mb-4">Encontre produtos próximos ao vencimento com descontos imperdíveis.</p>
            <Link to="/vitrine" className="btn btn-outline-primary btn-lg mt-auto">
              Ver Produtos
            </Link>
          </div>
        </div>

        {/* Card da Empresa */}
        <div className="col-md-5">
          <div className="card h-100 shadow-sm border-0 text-center p-4 bg-primary text-white">
            <h3 className="fw-bold mb-3">Para Farmácias</h3>
            <p className="mb-4 text-white-50">Gerencie seu estoque, reduza o desperdício e alcance mais clientes.</p>
            <Link to="/login" className="btn btn-light btn-lg mt-auto fw-bold text-primary">
              Acesso Parceiro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}