import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-4 mt-auto border-top border-dark" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', backdropFilter: 'blur(15px)' }}>
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-md-4 text-center text-md-start">
            <Link to="/" className="text-decoration-none d-inline-block mb-3 hover-lift" style={{ transition: 'transform 0.2s' }}>
              <img src="/synapse.png" alt="Synapse" style={{ height: '100px', objectFit: 'contain' }} />
            </Link>
            <p className="small text-white-50 mb-0">
              Transformando desperdício em oportunidade.<br/>
              A vitrine inteligente contra o vencimento de produtos.
            </p>
          </div>
          
          <div className="col-12 col-md-4 text-center">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Desenvolvedores</h6>
            <div className="d-flex flex-wrap justify-content-center gap-2 small text-white-50">
              <a href="https://github.com/DCF-2" target="_blank" rel="noopener noreferrer" className="badge bg-light bg-opacity-10 fw-normal px-2 py-1 text-decoration-none text-white-50">Davi Freitas</a>
              <a href="https://github.com/Marcos-0215" target="_blank" rel="noopener noreferrer" className="badge bg-light bg-opacity-10 fw-normal px-2 py-1 text-decoration-none text-white-50">Marcos André</a>
              <a href="https://github.com/gustavo-mdrs" target="_blank" rel="noopener noreferrer" className="badge bg-light bg-opacity-10 fw-normal px-2 py-1 text-decoration-none text-white-50">Gustavo Medeiros</a>
              <a href="https://github.com/0xffff08" target="_blank" rel="noopener noreferrer" className="badge bg-light bg-opacity-10 fw-normal px-2 py-1 text-decoration-none text-white-50">Vitor Lucas</a>
              <a href="https://github.com/NivianeCas" target="_blank" rel="noopener noreferrer" className="badge bg-light bg-opacity-10 fw-normal px-2 py-1 text-decoration-none text-white-50">Niviane Cas</a>
              <a href="https://github.com/AlaneOliveira" target="_blank" rel="noopener noreferrer" className="badge bg-light bg-opacity-10 fw-normal px-2 py-1 text-decoration-none text-white-50">Maria Alane</a>
            </div>
          </div>
          
          <div className="col-12 col-md-4 text-center text-md-end">
            <h6 className="fw-bold text-white mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Projeto Acadêmico</h6>
            <div className="bg-white p-2 rounded-3 d-inline-block hover-lift" style={{ transition: 'transform 0.2s' }}>
              <a href="https://portal.ifpe.edu.br/" target="_blank" rel="noopener noreferrer">
                <img src="/ilogo-ifpe.png" alt="IFPE" style={{ height: '60px', objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
        
        <hr className="border-secondary my-4" />
        
        <div className="text-center small text-white-50">
          &copy; {new Date().getFullYear()} Synapse. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
