import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null); // Estado para controlar as mensagens de erro
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault(); // Evita que a página recarregue
    setErro(null); // Limpa erros anteriores
    setLoading(true);
    
    try {
      // Fazendo a ponte com o seu Spring Boot
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailLogin: email, senha: senha })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Sucesso! Guarda o token no cofre do navegador (localStorage)
        localStorage.setItem('deadline_token', data.token);
        
        // Manda o usuário para a área logada
        navigate('/dashboard'); 
      } else {
        // Erro 401 ou 400 (Credenciais erradas)
        setErro(data.message || 'E-mail ou senha inválidos.');
      }
    } catch (err) {
      // Erro de rede (ex: Spring Boot desligado)
      setErro('Servidor offline. Verifique se a API está rodando.');
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{ width: '100%', maxWidth: '420px' }}>
        
        <div className="text-center mb-4">
          <h2 className="fw-bolder text-primary mb-1">Deadline</h2>
          <p className="text-muted">Acesso Exclusivo para Parceiros</p>
        </div>

        {/* Alerta de erro bonitão do Bootstrap */}
        {erro && (
          <div className="alert alert-danger py-2 text-center" role="alert">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email com Floating Label */}
          <div className="form-floating mb-3">
            <input 
              type="email" 
              className="form-control" 
              id="emailInput" 
              placeholder="nome@farmacia.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <label htmlFor="emailInput">E-mail corporativo</label>
          </div>
          
          {/* Senha com Floating Label */}
          <div className="form-floating mb-4">
            <input 
              type="password" 
              className="form-control" 
              id="senhaInput" 
              placeholder="Senha" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              required 
            />
            <label htmlFor="senhaInput">Senha</label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100 fw-bold mb-3" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Autenticando...
              </>
            ) : 'Entrar na Plataforma'}
          </button>
        </form>

        <div className="d-flex justify-content-between align-items-center mt-2">
          {/* Link falso para o esqueci a senha, já que adiamos a feature */}
          <button 
            className="btn btn-link text-decoration-none text-muted p-0"
            onClick={() => alert('Funcionalidade de e-mail em breve!')}
          >
            Esqueceu a senha?
          </button>
          
          <Link to="/" className="text-decoration-none fw-semibold">
            Voltar ao Início
          </Link>
        </div>

      </div>
    </div>
  );
}