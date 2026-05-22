import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

// Configuração da URL da API, utilizando variável de ambiente para flexibilidade entre ambientes de desenvolvimento e produção
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [success, setSuccess] = useState(null);

  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  const [step, setStep] = useState(1);
  const [showNovoRamo, setShowNovoRamo] = useState(false);
  
  const [cad, setCad] = useState({
    nomeFantasia: '', razaoSocial: '', cnpj: '', logotipo: '', idRamo: '', novoRamo: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    horarioFuncionamento: '', instrucoesRetirada: '', contatoWhatsapp: '', contato1: '', contato2: '', emailContato: '',
    emailLogin: '', senha: '', confirmarSenha: ''
  });

  const maskCNPJ = (v) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
  const maskCEP = (v) => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
  const maskPhone = (v) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2').slice(0, 15);

  const isValidCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj === '' || cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2; let numeros = cnpj.substring(0, tamanho); let digitos = cnpj.substring(tamanho);
    let soma = 0; let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    tamanho = tamanho + 1; numeros = cnpj.substring(0, tamanho); soma = 0; pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    return true;
  };

  const isSenhaForte = (senha) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(senha);

  const toggleView = (loginMode) => { 
    setIsLogin(loginMode); setErro(null); 
    setStep(1); 
    setShowNovoRamo(false); 
    setSuccess(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setErro(null); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailLogin, senha: senhaLogin })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('deadline_token', data.token);
        navigate('/dashboard');
      } else { setErro(data.message || 'E-mail ou senha incorretos.'); }
    } catch (err) { setErro('Servidor indisponível no momento.'); } finally { setLoading(false); }
  };

  const handleCepBlur = async () => {
    const cepLimpo = cad.cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) { setCad(prev => ({ ...prev, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf })); } 
        else { setErro('CEP não encontrado.'); }
      } catch (e) { console.error(e); }
    }
  };

  const validarEAvancar = (e, proximoStep) => {
    e.preventDefault();
    setErro(null);

    if (step === 1) {
      if (!isValidCNPJ(cad.cnpj)) { setErro('CNPJ inválido.'); return; }
      if (!cad.idRamo && !showNovoRamo) { setErro('Selecione um ramo de atuação.'); return; }
    }

    if (step === 2) {
      if (!cad.numero || cad.numero.trim() === '') {
        setErro('O número do endereço é obrigatório.');
        return;
      }
    }

    if (step === 4) {
      if (cad.senha !== cad.confirmarSenha) { setErro('As senhas não coincidem.'); return; }
      if (!isSenhaForte(cad.senha)) { setErro('Senha muito fraca.'); return; }
    }
    
    setStep(proximoStep);
  };

  const realizarCadastro = async () => {
    setErro(null); setLoading(true);

    const payload = {
      nomeFantasia: cad.nomeFantasia,
      razaoSocial: cad.razaoSocial,
      cnpj: cad.cnpj.replace(/\D/g, ''),
      logotipo: cad.logotipo || "default_logo.png",
      idRamo: showNovoRamo ? 1 : (parseInt(cad.idRamo) || 1),
      novoRamo: showNovoRamo ? cad.novoRamo : null,
      endereco: {
        logradouro: cad.logradouro,
        numero: cad.numero,
        complemento: cad.complemento || "",
        bairro: cad.bairro,
        cep: cad.cep.replace(/\D/g, ''),
        cidade: cad.cidade,
        uf: cad.uf
      },
      contatoWhatsapp: cad.contatoWhatsapp.replace(/\D/g, ''),
      contato1: cad.contato1.replace(/\D/g, ''),
      contato2: cad.contato2.replace(/\D/g, ''),
      emailContato: cad.emailContato || cad.emailLogin,
      emailLogin: cad.emailLogin,
      senha: cad.senha,
      instrucoesRetirada: cad.instrucoesRetirada,
      horarioFuncionamento: cad.horarioFuncionamento
    };

    try {
      const res = await fetch(`${API_URL}/empresa/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        //setSuccess('Cadastro efetuado com sucesso! Faça login para acessar o painel.');
        // Alert chato da porra
        //alert("Cadastro efetuado com sucesso!");
        toggleView(true);
      } else {
        const data = await res.json();
        setErro(data.message || 'Erro ao processar o cadastro.');
      }
    } catch (err) {
      setErro('Erro na comunicação com o servidor.');
    } finally { setLoading(false); }
  };

  const stepNames = ["Empresa", "Endereço", "Contatos", "Acesso", "Revisão"];

  return (
    <div className="ds-page-container">
      <Link to="/" className="ds-back-btn">&larr; Voltar para a Vitrine</Link>

      <div className={`ds-container ${!isLogin ? 'right-panel-active' : ''}`}>
        
        {/* ======================= PAINEL DE CADASTRO ======================= */}
        <div className="ds-form-container ds-sign-up-container">
          <div className="ds-form">
            
            <div className="ds-logo-wrapper">
              <img src="/logo_deadline.png" alt="Deadline Logo" className="ds-logo" />
            </div>

            <h1 className="ds-title">Crie a sua Loja</h1>
            
            <div className="ds-progress-row">
              <div className="ds-step-line-bg" />
              <div className="ds-step-line-active" style={{ width: `${((step - 1) / 4) * 100}%` }} />
              {[1, 2, 3, 4, 5].map((num, index) => (
                <div key={num} className="ds-step-item">
                  <div className={`ds-step-circle ${step >= num ? 'active' : ''}`}>{num}</div>
                  <span className={`ds-step-label ${step >= num ? 'active' : ''}`}>{stepNames[index]}</span>
                </div>
              ))}
            </div>

            {erro && !isLogin && <div className="ds-alert-error">{erro}</div>}

            <div className="ds-form-scroll-area">
              {step === 1 && (
                <form onSubmit={(e) => validarEAvancar(e, 2)} className="dl-animate-in">
                  <div className="ds-input-group"><label className="ds-label">Nome Fantasia *</label><input className="ds-input" type="text" placeholder="Ex: Drogaria Popular" value={cad.nomeFantasia} onChange={e => setCad({...cad, nomeFantasia: e.target.value})} required /></div>
                  <div className="ds-input-group"><label className="ds-label">Razão Social *</label><input className="ds-input" type="text" placeholder="Ex: Comercial LTDA" value={cad.razaoSocial} onChange={e => setCad({...cad, razaoSocial: e.target.value})} required /></div>
                  <div className="ds-input-group"><label className="ds-label">CNPJ *</label><input className="ds-input" type="text" placeholder="00.000.000/0000-00" value={cad.cnpj} onChange={e => setCad({...cad, cnpj: maskCNPJ(e.target.value)})} required /></div>
                  <div className="ds-input-group">
                    <label className="ds-label">Ramo de Atuação *</label>
                    <div className="ds-row">
                      <select className="ds-input" value={cad.idRamo} onChange={e => setCad({...cad, idRamo: e.target.value})} required={!showNovoRamo} disabled={showNovoRamo} style={{ opacity: showNovoRamo ? 0.6 : 1, marginBottom: 0 }}>
                        <option value="" disabled>Selecione da lista...</option>
                        <option value="1">Farmácia / Medicamentos</option>
                        <option value="2">Cosméticos / Perfumaria</option>
                        <option value="3">Alimentos</option>
                      </select>
                      <button type="button" onClick={() => { setShowNovoRamo(!showNovoRamo); setCad({...cad, idRamo: '', novoRamo: ''}); }} className="ds-add-btn" style={{ background: showNovoRamo ? '#E2E8F0' : 'var(--dl-primary)', color: showNovoRamo ? '#475569' : '#FFF' }}>
                        {showNovoRamo ? '✕' : '+'}
                      </button>
                    </div>
                    {showNovoRamo && (
                      <div className="dl-animate-in" style={{ marginTop: '10px' }}>
                        <input className="ds-input" type="text" placeholder="Digite o novo ramo *" value={cad.novoRamo} onChange={e => setCad({...cad, novoRamo: e.target.value})} required autoFocus />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="ds-btn ds-btn-primary">Avançar para Endereço</button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={(e) => validarEAvancar(e, 3)} className="dl-animate-in">
                  <div className="ds-row">
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">CEP *</label><input className="ds-input" type="text" placeholder="00000-000" value={cad.cep} onChange={e => setCad({...cad, cep: maskCEP(e.target.value)})} onBlur={handleCepBlur} required /></div>
                    <div className="ds-input-group" style={{ width: '90px' }}><label className="ds-label">Número *</label><input className="ds-input" type="text" placeholder="123" value={cad.numero} onChange={e => setCad({...cad, numero: e.target.value})} required /></div>
                  </div>
                  <div className="ds-input-group"><label className="ds-label">Logradouro *</label><input className="ds-input" type="text" placeholder="Rua das Flores" value={cad.logradouro} onChange={e => setCad({...cad, logradouro: e.target.value})} required /></div>
                  <div className="ds-input-group"><label className="ds-label">Complemento</label><input className="ds-input" type="text" placeholder="Ex: Loja 1" value={cad.complemento} onChange={e => setCad({...cad, complemento: e.target.value})} /></div>
                  <div className="ds-row">
                    <div className="ds-input-group ds-flex-2"><label className="ds-label">Bairro *</label><input className="ds-input" type="text" value={cad.bairro} onChange={e => setCad({...cad, bairro: e.target.value})} required /></div>
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">UF *</label><input className="ds-input" type="text" maxLength="2" value={cad.uf} onChange={e => setCad({...cad, uf: e.target.value})} required /></div>
                  </div>
                  <div className="ds-input-group"><label className="ds-label">Cidade *</label><input className="ds-input" type="text" value={cad.cidade} onChange={e => setCad({...cad, cidade: e.target.value})} required /></div>
                  <div className="ds-row">
                    <button type="button" onClick={() => setStep(1)} className="ds-btn ds-btn-secondary">Voltar</button>
                    <button type="submit" className="ds-btn ds-btn-primary">Avançar</button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={(e) => validarEAvancar(e, 4)} className="dl-animate-in">
                  <div className="ds-input-group"><label className="ds-label">Horário de Funcionamento *</label><input className="ds-input" type="text" placeholder="Ex: Seg a Sex das 07:00 às 22:00" value={cad.horarioFuncionamento} onChange={e => setCad({...cad, horarioFuncionamento: e.target.value})} required /></div>
                  <div className="ds-input-group"><label className="ds-label">Instruções para Retirada *</label><input className="ds-input" type="text" placeholder="Ex: Apresentar RG no balcão." value={cad.instrucoesRetirada} onChange={e => setCad({...cad, instrucoesRetirada: e.target.value})} required /></div>
                  <div className="ds-row">
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">WhatsApp *</label><input className="ds-input" type="text" placeholder="(00) 90000-0000" value={cad.contatoWhatsapp} onChange={e => setCad({...cad, contatoWhatsapp: maskPhone(e.target.value)})} required /></div>
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">Fixo 1</label><input className="ds-input" type="text" placeholder="(00) 3000-0000" value={cad.contato1} onChange={e => setCad({...cad, contato1: maskPhone(e.target.value)})} /></div>
                  </div>
                  <div className="ds-row">
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">Fixo 2</label><input className="ds-input" type="text" value={cad.contato2} onChange={e => setCad({...cad, contato2: maskPhone(e.target.value)})} /></div>
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">E-mail Público</label><input className="ds-input" type="email" value={cad.emailContato} onChange={e => setCad({...cad, emailContato: e.target.value})} /></div>
                  </div>
                  <div className="ds-row">
                    <button type="button" onClick={() => setStep(2)} className="ds-btn ds-btn-secondary">Voltar</button>
                    <button type="submit" className="ds-btn ds-btn-primary">Avançar</button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <form onSubmit={(e) => validarEAvancar(e, 5)} className="dl-animate-in">
                  <div className="ds-input-group"><label className="ds-label">E-mail de Login *</label><input className="ds-input" type="email" placeholder="admin@loja.com" value={cad.emailLogin} onChange={e => setCad({...cad, emailLogin: e.target.value})} required /></div>
                  <div className="ds-row">
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">Criar Senha *</label><input className="ds-input" type="password" placeholder="••••••••" value={cad.senha} onChange={e => setCad({...cad, senha: e.target.value})} required /></div>
                    <div className="ds-input-group ds-flex-1"><label className="ds-label">Confirmar Senha *</label><input className="ds-input" type="password" placeholder="••••••••" value={cad.confirmarSenha} onChange={e => setCad({...cad, confirmarSenha: e.target.value})} required /></div>
                  </div>
                  <p className="ds-helper-text" style={{ marginTop: '-10px', marginBottom: '16px' }}>Min. 8 caracteres, com Maiúscula, Número e Símbolo (@!$).</p>
                  <div className="ds-row">
                    <button type="button" onClick={() => setStep(3)} className="ds-btn ds-btn-secondary">Voltar</button>
                    <button type="submit" className="ds-btn ds-btn-primary">Revisão Final</button>
                  </div>
                </form>
              )}

              {step === 5 && (
                <div className="dl-animate-in">
                  <div className="ds-review-box">
                    <div className="ds-review-section">
                      <div className="ds-review-title">1. Identificação</div>
                      <div><strong>Nome:</strong> {cad.nomeFantasia}</div>
                      <div><strong>CNPJ:</strong> {cad.cnpj}</div>
                      <div><strong>Ramo:</strong> {showNovoRamo ? `(Novo) ${cad.novoRamo}` : `Opção ID ${cad.idRamo}`}</div>
                    </div>
                    <div className="ds-review-section">
                      <div className="ds-review-title">2. Endereço</div>
                      <div>{cad.logradouro}, {cad.numero} - {cad.bairro}, {cad.cidade}/{cad.uf}</div>
                    </div>
                    <div className="ds-review-section">
                      <div className="ds-review-title">3. Operação</div>
                      <div><strong>Horário:</strong> {cad.horarioFuncionamento}</div>
                      <div><strong>WhatsApp:</strong> {cad.contatoWhatsapp}</div>
                    </div>
                    <div>
                      <div className="ds-review-title">4. Acesso</div>
                      <div><strong>Login:</strong> {cad.emailLogin}</div>
                    </div>
                  </div>
                  <div className="ds-row">
                    <button type="button" onClick={() => setStep(4)} className="ds-btn ds-btn-secondary">Voltar</button>
                    <button type="button" onClick={realizarCadastro} disabled={loading} className="ds-btn ds-btn-primary">
                      {loading ? 'Submetendo...' : 'Confirmar Registo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="ds-mobile-toggle">Já possui uma loja? <button type="button" onClick={() => toggleView(true)}>Faça Login</button></div>
          </div>
        </div>

        {/* ======================= PAINEL DE LOGIN ======================= */}
        <div className="ds-form-container ds-sign-in-container">
          <div className="ds-form">
            
            <div className="ds-logo-wrapper">
              <img src="/logo_deadline.png" alt="Deadline Logo" className="ds-logo" />
            </div>

            <h1 className="ds-title">Bem-vindo de volta</h1>
            <p className="ds-subtitle">Faça o login para gerir as suas ofertas</p>
            
            {/* Mensagem de Erro */}
            {erro && isLogin && <div className="ds-alert-error">{erro}</div>}

            {/* Mensagem de Sucesso */}
            {success && isLogin && <div className="ds-alert-success" style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{success}</div>}

            <form onSubmit={handleLogin}>
              <div className="ds-input-group">
                <label className="ds-label">E-mail Corporativo</label>
                <input className="ds-input" type="email" placeholder="admin@loja.com" value={emailLogin} onChange={e => setEmailLogin(e.target.value)} required />
              </div>
              <div className="ds-input-group">
                <label className="ds-label">Senha</label>
                <input className="ds-input" type="password" placeholder="••••••••" value={senhaLogin} onChange={e => setSenhaLogin(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="ds-btn ds-btn-primary" style={{ marginTop: '20px' }}>
                {loading ? 'Autenticando...' : 'Entrar no Painel'}
              </button>
            </form>
            <div className="ds-mobile-toggle">Ainda não é parceiro? <button type="button" onClick={() => toggleView(false)}>Cadastre-se</button></div>
          </div>
        </div>

        {/* ======================= PAINÉIS DESLIZANTES OVERLAY ======================= */}
        <div className="ds-overlay-container">
          <div className="ds-overlay">
            
            <div className="ds-overlay-panel ds-overlay-left">
              <h1>Já é Parceiro?</h1>
              <p>Mantenha-se conectado e gira o seu catálogo de produtos próximos ao vencimento.</p>
              <button className="ds-btn ds-btn-ghost" onClick={() => toggleView(true)}>Fazer Login</button>
            </div>
            
            <div className="ds-overlay-panel ds-overlay-right">
              <h1>Olá, Lojista!</h1>
              <p>Evite o desperdício e alcance novos clientes. Registe o seu estabelecimento agora mesmo.</p>
              <button className="ds-btn ds-btn-ghost" onClick={() => toggleView(false)}>Cadastre sua Loja</button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}