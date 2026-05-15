import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    
    try {
      const response = await fetch('https://synapse-deadline.onrender.com/auth/login', {
      //const response = await fetch('http://localhost:8080/auth/login', { // Use esta linha para testes locais
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: senha })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('deadline_token', data.token);
        navigate('/dashboard'); 
      } else {
        setErro(data.message || 'E-mail ou senha inválidos.');
      }
    } catch (err) {
      setErro('Servidor offline. Verifique se a API está rodando.');
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo e Header */}
        <div style={styles.header}>
          <img 
            src="/logo_deadline.png" 
            alt="Deadline Logo" 
            style={styles.logo}
          />
          <h1 style={styles.title}>Bem-vindo de volta</h1>
          <p style={styles.subtitle}>Acesso exclusivo para parceiros</p>
        </div>

        {/* Alerta de erro */}
        {erro && (
          <div style={styles.alertError}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail corporativo</label>
            <input 
              type="email" 
              placeholder="nome@empresa.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input 
              type="password" 
              placeholder="Digite sua senha" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.btnPrimary,
              ...(loading ? styles.btnDisabled : {})
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Autenticando...
              </>
            ) : 'Entrar na Plataforma'}
          </button>
        </form>

        <div style={styles.linksRow}>
          <button 
            style={styles.linkButton}
            onClick={() => alert('Funcionalidade de recuperação em breve!')}
          >
            Esqueceu a senha?
          </button>
          
          <Link to="/" style={styles.link}>
            Voltar ao Início
          </Link>
        </div>

        {/* Footer - Link para cadastro */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Ainda não é parceiro?</span>
          <Link to="/cadastro" style={styles.linkPrimary}>
            Cadastre sua loja
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F5F9FC 0%, #E8F4F2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(30, 58, 95, 0.12)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #E2E8F0'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logo: {
    height: '80px',
    marginBottom: '16px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1E3A5F',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    margin: 0
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#EF4444',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '24px',
    fontSize: '14px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #E2E8F0',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#1E3A5F',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FFFFFF'
  },
  btnPrimary: {
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #2D9B83 0%, #238069 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px'
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  linksRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.2s ease'
  },
  link: {
    color: '#1E3A5F',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'color 0.2s ease'
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #E2E8F0'
  },
  footerText: {
    color: '#64748B',
    fontSize: '14px'
  },
  linkPrimary: {
    color: '#2D9B83',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '6px',
    transition: 'color 0.2s ease'
  }
};
