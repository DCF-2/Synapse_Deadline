import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    endereco: '',
    emailLogin: '',
    senha: '',
    confirmarSenha: '',
    instrucoesRetirada: '',
    diasFuncionamento: [],
    horarioAbertura: '',
    horarioFechamento: '',
    contatoWhatsapp: '',
    contato1: '',
    contato2: ''
  });

  const [errors, setErrors] = useState({});

  const diasSemana = [
    { id: 'SEG', label: 'Seg' },
    { id: 'TER', label: 'Ter' },
    { id: 'QUA', label: 'Qua' },
    { id: 'QUI', label: 'Qui' },
    { id: 'SEX', label: 'Sex' },
    { id: 'SAB', label: 'Sab' },
    { id: 'DOM', label: 'Dom' }
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }

  function toggleDia(dia) {
    setFormData(prev => ({
      ...prev,
      diasFuncionamento: prev.diasFuncionamento.includes(dia)
        ? prev.diasFuncionamento.filter(d => d !== dia)
        : [...prev.diasFuncionamento, dia]
    }));
  }

  function formatCNPJ(value) {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  }

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }

  function validateStep1() {
    const newErrors = {};
    
    if (!formData.nomeFantasia.trim()) {
      newErrors.nomeFantasia = 'Nome fantasia obrigatório';
    }
    if (!formData.razaoSocial.trim()) {
      newErrors.razaoSocial = 'Razão social obrigatória';
    }
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ obrigatório';
    } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2() {
    const newErrors = {};
    
    if (!formData.emailLogin.trim()) {
      newErrors.emailLogin = 'E-mail obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailLogin)) {
      newErrors.emailLogin = 'E-mail inválido';
    }
    if (!formData.senha) {
      newErrors.senha = 'Senha obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep3() {
    const newErrors = {};
    
    if (formData.diasFuncionamento.length === 0) {
      newErrors.diasFuncionamento = 'Selecione pelo menos um dia';
    }
    if (!formData.horarioAbertura) {
      newErrors.horarioAbertura = 'Horário de abertura obrigatório';
    }
    if (!formData.horarioFechamento) {
      newErrors.horarioFechamento = 'Horário de fechamento obrigatório';
    }
    if (!formData.instrucoesRetirada.trim()) {
      newErrors.instrucoesRetirada = 'Instruções de retirada obrigatórias';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  }

  function prevStep() {
    setStep(prev => Math.max(1, prev - 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const payload = {
      nomeFantasia: formData.nomeFantasia,
      razaoSocial: formData.razaoSocial,
      cnpj: formData.cnpj.replace(/\D/g, ''),
      endereco: formData.endereco,
      emailLogin: formData.emailLogin,
      senha: formData.senha,
      instrucoesRetirada: formData.instrucoesRetirada,
      diasFuncionamento: formData.diasFuncionamento.join(','),
      horarioAbertura: formData.horarioAbertura,
      horarioFechamento: formData.horarioFechamento,
      contatoWhatsapp: formData.contatoWhatsapp.replace(/\D/g, ''),
      contato1: formData.contato1.replace(/\D/g, ''),
      contato2: formData.contato2.replace(/\D/g, '')
    };

    try {
      const response = await fetch('https://synapse-deadline.onrender.com/empresas/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSucesso(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErro(data.message || 'Erro ao cadastrar. Verifique os dados.');
      }
    } catch (err) {
      setErro('Servidor offline. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = [
    'Dados da Empresa',
    'Acesso',
    'Funcionamento',
    'Confirmar'
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card} className="dl-animate-in">
        {/* Logo e Header */}
        <div style={styles.header}>
          <img 
            src="/logo_deadline.png" 
            alt="Deadline Logo" 
            style={styles.logo}
          />
          <h1 style={styles.title}>Cadastre sua Loja</h1>
          <p style={styles.subtitle}>
            Faça parte da nossa rede de parceiros
          </p>
        </div>

        {/* Progress Steps */}
        <div style={styles.progressContainer}>
          {[1, 2, 3, 4].map(num => (
            <div key={num} style={styles.stepWrapper}>
              <div 
                style={{
                  ...styles.stepCircle,
                  ...(step >= num ? styles.stepCircleActive : {}),
                  ...(step > num ? styles.stepCircleCompleted : {})
                }}
              >
                {step > num ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : num}
              </div>
              <span style={{
                ...styles.stepLabel,
                ...(step >= num ? styles.stepLabelActive : {})
              }}>
                {stepTitles[num - 1]}
              </span>
              {num < 4 && <div style={{
                ...styles.stepLine,
                ...(step > num ? styles.stepLineActive : {})
              }} />}
            </div>
          ))}
        </div>

        {/* Alerts */}
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

        {sucesso && (
          <div style={styles.alertSuccess}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Cadastro realizado! Redirecionando para o login...
          </div>
        )}

        {/* Form Steps */}
        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Dados da Empresa */}
          {step === 1 && (
            <div style={styles.stepContent}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome Fantasia *</label>
                <input
                  type="text"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  placeholder="Ex: Farmácia Vida"
                  style={{
                    ...styles.input,
                    ...(errors.nomeFantasia ? styles.inputError : {})
                  }}
                />
                {errors.nomeFantasia && <span style={styles.errorText}>{errors.nomeFantasia}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Razão Social *</label>
                <input
                  type="text"
                  name="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  placeholder="Ex: Farmácia Vida LTDA"
                  style={{
                    ...styles.input,
                    ...(errors.razaoSocial ? styles.inputError : {})
                  }}
                />
                {errors.razaoSocial && <span style={styles.errorText}>{errors.razaoSocial}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>CNPJ *</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleChange({
                    target: { name: 'cnpj', value: formatCNPJ(e.target.value) }
                  })}
                  placeholder="00.000.000/0000-00"
                  style={{
                    ...styles.input,
                    ...(errors.cnpj ? styles.inputError : {})
                  }}
                />
                {errors.cnpj && <span style={styles.errorText}>{errors.cnpj}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Endereço Completo *</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro, cidade - UF"
                  style={{
                    ...styles.input,
                    ...(errors.endereco ? styles.inputError : {})
                  }}
                />
                {errors.endereco && <span style={styles.errorText}>{errors.endereco}</span>}
              </div>
            </div>
          )}

          {/* Step 2: Credenciais de Acesso */}
          {step === 2 && (
            <div style={styles.stepContent}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>E-mail de Acesso *</label>
                <input
                  type="email"
                  name="emailLogin"
                  value={formData.emailLogin}
                  onChange={handleChange}
                  placeholder="contato@suaempresa.com"
                  style={{
                    ...styles.input,
                    ...(errors.emailLogin ? styles.inputError : {})
                  }}
                />
                {errors.emailLogin && <span style={styles.errorText}>{errors.emailLogin}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Senha *</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  style={{
                    ...styles.input,
                    ...(errors.senha ? styles.inputError : {})
                  }}
                />
                {errors.senha && <span style={styles.errorText}>{errors.senha}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmar Senha *</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  style={{
                    ...styles.input,
                    ...(errors.confirmarSenha ? styles.inputError : {})
                  }}
                />
                {errors.confirmarSenha && <span style={styles.errorText}>{errors.confirmarSenha}</span>}
              </div>
            </div>
          )}

          {/* Step 3: Funcionamento */}
          {step === 3 && (
            <div style={styles.stepContent}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Dias de Funcionamento *</label>
                <div style={styles.diasGrid}>
                  {diasSemana.map(dia => (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => toggleDia(dia.id)}
                      style={{
                        ...styles.diaButton,
                        ...(formData.diasFuncionamento.includes(dia.id) ? styles.diaButtonActive : {})
                      }}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
                {errors.diasFuncionamento && <span style={styles.errorText}>{errors.diasFuncionamento}</span>}
              </div>

              <div style={styles.rowGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Abertura *</label>
                  <input
                    type="time"
                    name="horarioAbertura"
                    value={formData.horarioAbertura}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.horarioAbertura ? styles.inputError : {})
                    }}
                  />
                  {errors.horarioAbertura && <span style={styles.errorText}>{errors.horarioAbertura}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fechamento *</label>
                  <input
                    type="time"
                    name="horarioFechamento"
                    value={formData.horarioFechamento}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.horarioFechamento ? styles.inputError : {})
                    }}
                  />
                  {errors.horarioFechamento && <span style={styles.errorText}>{errors.horarioFechamento}</span>}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Instruções de Retirada *</label>
                <textarea
                  name="instrucoesRetirada"
                  value={formData.instrucoesRetirada}
                  onChange={handleChange}
                  placeholder="Ex: Retirar no balcão com documento e comprovante"
                  rows={3}
                  style={{
                    ...styles.input,
                    ...styles.textarea,
                    ...(errors.instrucoesRetirada ? styles.inputError : {})
                  }}
                />
                {errors.instrucoesRetirada && <span style={styles.errorText}>{errors.instrucoesRetirada}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp</label>
                <input
                  type="text"
                  name="contatoWhatsapp"
                  value={formData.contatoWhatsapp}
                  onChange={(e) => handleChange({
                    target: { name: 'contatoWhatsapp', value: formatPhone(e.target.value) }
                  })}
                  placeholder="(00) 00000-0000"
                  style={styles.input}
                />
              </div>

              <div style={styles.rowGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Contato 1</label>
                  <input
                    type="text"
                    name="contato1"
                    value={formData.contato1}
                    onChange={(e) => handleChange({
                      target: { name: 'contato1', value: formatPhone(e.target.value) }
                    })}
                    placeholder="(00) 0000-0000"
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Contato 2</label>
                  <input
                    type="text"
                    name="contato2"
                    value={formData.contato2}
                    onChange={(e) => handleChange({
                      target: { name: 'contato2', value: formatPhone(e.target.value) }
                    })}
                    placeholder="(00) 0000-0000"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmação */}
          {step === 4 && (
            <div style={styles.stepContent}>
              <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>Resumo do Cadastro</h3>
                
                <div style={styles.summarySection}>
                  <h4 style={styles.summarySubtitle}>Dados da Empresa</h4>
                  <p><strong>Nome Fantasia:</strong> {formData.nomeFantasia}</p>
                  <p><strong>Razão Social:</strong> {formData.razaoSocial}</p>
                  <p><strong>CNPJ:</strong> {formData.cnpj}</p>
                  <p><strong>Endereço:</strong> {formData.endereco}</p>
                </div>

                <div style={styles.summarySection}>
                  <h4 style={styles.summarySubtitle}>Acesso</h4>
                  <p><strong>E-mail:</strong> {formData.emailLogin}</p>
                </div>

                <div style={styles.summarySection}>
                  <h4 style={styles.summarySubtitle}>Funcionamento</h4>
                  <p><strong>Dias:</strong> {formData.diasFuncionamento.join(', ')}</p>
                  <p><strong>Horário:</strong> {formData.horarioAbertura} às {formData.horarioFechamento}</p>
                  <p><strong>Instruções:</strong> {formData.instrucoesRetirada}</p>
                </div>

                {(formData.contatoWhatsapp || formData.contato1 || formData.contato2) && (
                  <div style={styles.summarySection}>
                    <h4 style={styles.summarySubtitle}>Contatos</h4>
                    {formData.contatoWhatsapp && <p><strong>WhatsApp:</strong> {formData.contatoWhatsapp}</p>}
                    {formData.contato1 && <p><strong>Contato 1:</strong> {formData.contato1}</p>}
                    {formData.contato2 && <p><strong>Contato 2:</strong> {formData.contato2}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={styles.buttonGroup}>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                style={styles.btnSecondary}
              >
                Voltar
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                style={styles.btnPrimary}
              >
                Continuar
              </button>
            ) : (
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
                    Cadastrando...
                  </>
                ) : 'Finalizar Cadastro'}
              </button>
            )}
          </div>
        </form>

        {/* Footer Link */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Já tem uma conta?</span>
          <Link to="/login" style={styles.link}>
            Fazer login
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
    maxWidth: '520px',
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
    fontSize: '28px',
    fontWeight: '700',
    color: '#1E3A5F',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    margin: 0
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    position: 'relative'
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1
  },
  stepCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#E2E8F0',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    zIndex: 1
  },
  stepCircleActive: {
    background: '#2D9B83',
    color: '#FFFFFF'
  },
  stepCircleCompleted: {
    background: '#2D9B83',
    color: '#FFFFFF'
  },
  stepLabel: {
    fontSize: '11px',
    color: '#94A3B8',
    marginTop: '8px',
    fontWeight: '500',
    textAlign: 'center'
  },
  stepLabelActive: {
    color: '#2D9B83'
  },
  stepLine: {
    position: 'absolute',
    top: '18px',
    left: '60%',
    width: '80%',
    height: '2px',
    background: '#E2E8F0',
    zIndex: 0
  },
  stepLineActive: {
    background: '#2D9B83'
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
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(45, 155, 131, 0.1)',
    border: '1px solid rgba(45, 155, 131, 0.2)',
    color: '#2D9B83',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '24px',
    fontSize: '14px'
  },
  stepContent: {
    marginBottom: '24px'
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
  inputError: {
    borderColor: '#EF4444'
  },
  textarea: {
    resize: 'vertical',
    minHeight: '80px'
  },
  errorText: {
    display: 'block',
    color: '#EF4444',
    fontSize: '12px',
    marginTop: '6px'
  },
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  diasGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  diaButton: {
    padding: '10px 14px',
    border: '2px solid #E2E8F0',
    borderRadius: '10px',
    background: '#FFFFFF',
    color: '#64748B',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  diaButtonActive: {
    background: '#2D9B83',
    borderColor: '#2D9B83',
    color: '#FFFFFF'
  },
  summaryCard: {
    background: '#F8FAFC',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #E2E8F0'
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1E3A5F',
    marginTop: 0,
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #E2E8F0'
  },
  summarySection: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E2E8F0'
  },
  summarySubtitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2D9B83',
    marginTop: 0,
    marginBottom: '10px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  btnPrimary: {
    flex: 1,
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
    gap: '8px'
  },
  btnSecondary: {
    flex: 1,
    padding: '16px 24px',
    background: 'transparent',
    border: '2px solid #2D9B83',
    borderRadius: '12px',
    color: '#2D9B83',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
  link: {
    color: '#2D9B83',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '6px',
    transition: 'color 0.2s ease'
  }
};
