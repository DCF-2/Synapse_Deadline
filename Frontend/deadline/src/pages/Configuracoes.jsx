import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deadline_upload';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' é a lista principal (Android style)
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [enviandoBanner, setEnviandoBanner] = useState(false);
  const [excluindoConta, setExcluindoConta] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  // Estados Locais (Aparência, etc)
  const [tema, setTema] = useState(localStorage.getItem('deadline_theme') || 'light');
  const [idioma, setIdioma] = useState(localStorage.getItem('deadline_lang') || 'pt-BR');
  
  // Lista dinâmica de Ramos
  const [ramos, setRamos] = useState([]);

  // Estados dos Campos do Perfil
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [logotipo, setLogotipo] = useState(''); 
  const [bannerPerfil, setBannerPerfil] = useState(''); 
  const [idRamo, setIdRamo] = useState('');
  const [emailLogin, setEmailLogin] = useState('');
  
  const [contatoWhatsapp, setContatoWhatsapp] = useState('');
  const [contato1, setContato1] = useState('');
  const [contato2, setContato2] = useState('');
  const [emailContato, setEmailContato] = useState('');
  
  const [horarioFuncionamento, setHorarioFuncionamento] = useState('');
  const [instrucoesRetirada, setInstrucoesRetirada] = useState('');

  // Estados do Endereço
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  // Estados Segurança (Excluir Conta)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;

        const resRamos = await fetch(`${API_URL}/empresa/ramos`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resRamos.ok) {
          const dadosRamos = await resRamos.json();
          setRamos(dadosRamos);
        }

        const resPerfil = await fetch(`${API_URL}/empresa/perfil`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!resPerfil.ok) throw new Error('Não foi possível carregar o perfil da empresa.');

        const data = await resPerfil.json();
        
        setNomeFantasia(data.nomeFantasia || '');
        setRazaoSocial(data.razaoSocial || '');
        setCnpj(data.cnpj || '');
        setLogotipo(data.logotipo || '');
        setBannerPerfil(data.bannerPerfil || '');
        setIdRamo(data.idRamo || '');
        setEmailLogin(data.emailLogin || '');
        
        setContatoWhatsapp(data.contatoWhatsapp || '');
        setContato1(data.contato1 || '');
        setContato2(data.contato2 || '');
        setEmailContato(data.emailContato || '');
        
        setHorarioFuncionamento(data.horarioFuncionamento || '');
        setInstrucoesRetirada(data.instrucoesRetirada || '');

        if (data.endereco) {
          setLogradouro(data.endereco.logradouro || '');
          setNumero(data.endereco.numero || '');
          setComplemento(data.endereco.complemento || '');
          setBairro(data.endereco.bairro || '');
          setCep(data.endereco.cep || '');
          setCidade(data.endereco.cidade || '');
          setUf(data.endereco.uf || '');
        }
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosIniciais();
  }, []);

  const changeTheme = (newTheme) => {
    setTema(newTheme);
    localStorage.setItem('deadline_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleLanguageChange = (newLang) => {
    setIdioma(newLang);
    localStorage.setItem('deadline_lang', newLang);
  };

  const handleCepChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, ''); 
    let formatado = rawValue;
    if (rawValue.length > 5) {
      formatado = rawValue.replace(/^(\d{5})(\d)/, '$1-$2'); 
    }
    setCep(formatado);

    if (rawValue.length === 8) {
      buscarCepNosCorreios(rawValue);
    }
  };

  const buscarCepNosCorreios = async (cepBuscado) => {
    const apenasNumeros = (typeof cepBuscado === 'string' ? cepBuscado : cep).replace(/\D/g, '');
    if (apenasNumeros.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || ''); 
        setUf(data.uf || '');
        document.getElementById('inputNumero')?.focus();
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEnviandoLogo(true);
    setErro(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Falha no upload para o Cloudinary');
      const data = await res.json();
      setLogotipo(data.secure_url); 
      setSucesso(true);
      setTimeout(() => setSucesso(false), 2000);
    } catch (err) {
      setErro("Erro no Upload: " + err.message);
    } finally {
      setEnviandoLogo(false);
    }
  };

  const handleUploadBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEnviandoBanner(true);
    setErro(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Falha no upload para o Cloudinary');
      const data = await res.json();
      setBannerPerfil(data.secure_url);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 2000);
    } catch (err) {
      setErro("Erro no Upload do Banner: " + err.message);
    } finally {
      setEnviandoBanner(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    try {
      const token = localStorage.getItem('deadline_token');
      const payload = {
        nomeFantasia, razaoSocial, cnpj, logotipo, bannerPerfil,
        idRamo: idRamo ? parseInt(idRamo, 10) : null,
        emailLogin, contatoWhatsapp, contato1, contato2,
        emailContato, horarioFuncionamento, instrucoesRetirada,
        endereco: { logradouro, numero, complemento, bairro, cep, cidade, uf }
      };

      const res = await fetch(`${API_URL}/empresa/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar. Verifique se os campos estão corretos.');
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setExcluindoConta(true);
    setErro(null);

    try {
      const token = localStorage.getItem('deadline_token');
      const payload = { email: deleteEmail, senha: deletePassword };

      const res = await fetch(`${API_URL}/empresa/perfil`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let msg = "Erro ao excluir conta.";
        try { const errData = await res.json(); msg = errData.message || msg; } catch(e) {}
        throw new Error(msg);
      }

      alert("Conta e dados excluídos com sucesso. Você será desconectado.");
      localStorage.removeItem('deadline_token');
      localStorage.removeItem('deadline_empresa');
      window.location.href = '/login'; // Força recarregamento limpo

    } catch (err) {
      alert(err.message);
    } finally {
      setExcluindoConta(false);
      setShowDeleteModal(false);
    }
  };

  if (carregando) return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="spinner-border text-success"></div>
      <span className="ms-3 text-muted fw-bold">Carregando configurações...</span>
    </div>
  );

  return (
    <div className="pb-5">
      {/* HEADER DA PÁGINA (Se estiver na lista, mostra o título. Se estiver num sub-item, mostra voltar) */}
      <div className="d-flex align-items-center pt-3 pb-3 mb-4 border-bottom">
        {activeTab === 'menu' ? (
          <div>
            <h2 className="fw-bold m-0" style={{ color: 'var(--dl-text-primary)' }}>Configurações do Sistema</h2>
            <p className="small m-0 mt-1" style={{ color: 'var(--dl-text-secondary)' }}>
              Gerencie preferências, aparência e dados vitais do seu negócio.
            </p>
          </div>
        ) : (
          <button className="btn btn-light d-flex align-items-center gap-2 px-3 py-2 fw-bold shadow-sm rounded-pill border" onClick={() => { setActiveTab('menu'); setErro(null); setSucesso(false); }}>
            <span style={{ fontSize: '1.2rem' }}><img src="/icons/voltar.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> Voltar para Configurações
          </button>
        )}
      </div>

      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        
        {/* ======================= MENU PRINCIPAL EM LISTA (ANDROID STYLE) ======================= */}
        {activeTab === 'menu' && (
          <div className="d-flex flex-column gap-3">
            
            <h6 className="fw-bold mt-2 mb-2 ps-2 text-uppercase" style={{ color: 'var(--dl-text-secondary)', fontSize: '0.8rem', letterSpacing: '1px' }}>Sistema e Preferências</h6>
            
            <div className="list-group rounded-4 shadow-sm border-0 mb-3 bg-white">
              <button disabled className="list-group-item list-group-item-action d-flex align-items-center py-4 border-0 border-bottom" style={{opacity: 0.6}}>
                <span className="fs-3 me-3"><img src="/icons/paleta-de-cores.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: 'var(--dl-text-primary)' }}>Aparência e Idioma <span className="badge bg-warning text-dark ms-2" style={{fontSize: '0.65rem'}}>Em desenvolvimento</span></h6>
                  <small style={{ color: 'var(--dl-text-secondary)' }}>Modo escuro, fuso horário, linguagem global</small>
                </div>
                <span className="ms-auto fs-4 text-muted">›</span>
              </button>

              <button onClick={() => setActiveTab('notificacoes')} className="list-group-item list-group-item-action d-flex align-items-center py-4 border-0">
                <span className="fs-3 me-3"><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: 'var(--dl-text-primary)' }}>Notificações e Alertas</h6>
                  <small style={{ color: 'var(--dl-text-secondary)' }}>Emails semanais, vencimento de ofertas</small>
                </div>
                <span className="ms-auto fs-4 text-muted">›</span>
              </button>
            </div>

            <h6 className="fw-bold mt-4 mb-2 ps-2 text-uppercase" style={{ color: 'var(--dl-text-secondary)', fontSize: '0.8rem', letterSpacing: '1px' }}>Perfil da Loja Física</h6>
            
            <div className="list-group rounded-4 shadow-sm border-0 mb-3 bg-white">
              <button onClick={() => setActiveTab('identidade')} className="list-group-item list-group-item-action d-flex align-items-center py-4 border-0 border-bottom">
                <span className="fs-3 me-3"><img src="/icons/companhia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: 'var(--dl-text-primary)' }}>Identidade da Empresa</h6>
                  <small style={{ color: 'var(--dl-text-secondary)' }}>Logo, nome fantasia, ramo de atividade</small>
                </div>
                <span className="ms-auto fs-4 text-muted">›</span>
              </button>

              <button onClick={() => setActiveTab('contato')} className="list-group-item list-group-item-action d-flex align-items-center py-4 border-0 border-bottom">
                <span className="fs-3 me-3"><img src="/icons/chamada-telefonica.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: 'var(--dl-text-primary)' }}>Canais de Atendimento</h6>
                  <small style={{ color: 'var(--dl-text-secondary)' }}>WhatsApp, telefone fixo, horário de funcionamento</small>
                </div>
                <span className="ms-auto fs-4 text-muted">›</span>
              </button>

              <button onClick={() => setActiveTab('endereco')} className="list-group-item list-group-item-action d-flex align-items-center py-4 border-0">
                <span className="fs-3 me-3"><img src="/icons/mapa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: 'var(--dl-text-primary)' }}>Endereço de Retirada</h6>
                  <small style={{ color: 'var(--dl-text-secondary)' }}>Localização física, CEP, cidade e bairro</small>
                </div>
                <span className="ms-auto fs-4 text-muted">›</span>
              </button>
            </div>

            <h6 className="fw-bold mt-4 mb-2 ps-2 text-uppercase" style={{ color: 'var(--dl-text-secondary)', fontSize: '0.8rem', letterSpacing: '1px' }}>Gerenciamento de Conta</h6>
            
            <div className="list-group rounded-4 shadow-sm border-0 mb-5 bg-white">
              <button onClick={() => setActiveTab('seguranca')} className="list-group-item list-group-item-action d-flex align-items-center py-4 border-0">
                <span className="fs-3 me-3"><img src="/icons/cadeado.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                <div>
                  <h6 className="fw-bold mb-1 text-danger">Segurança e Exclusão</h6>
                  <small className="text-danger opacity-75">Alteração de senha, encerramento de conta</small>
                </div>
                <span className="ms-auto fs-4 text-danger">›</span>
              </button>
            </div>
            
          </div>
        )}

        {/* ======================= MENSAGENS GLOBAIS DE SUBMIT ======================= */}
        {activeTab !== 'menu' && (
          <>
            {erro && <div className="alert alert-danger rounded-4 shadow-sm mb-4"><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {erro}</div>}
            {sucesso && <div className="alert alert-success rounded-4 shadow-sm mb-4"><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Alterações salvas com sucesso!</div>}
          </>
        )}

        {/* ======================= GERAL E PREFERÊNCIAS ======================= */}
        {activeTab === 'geral' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4" style={{ backgroundColor: 'var(--dl-surface)' }}>
            <h4 className="fw-bold mb-4" style={{ color: 'var(--dl-text-primary)' }}>Aparência e Idioma</h4>
            
            <h6 className="fw-bold mb-3 mt-2" style={{ color: 'var(--dl-text-primary)' }}>TEMA DA INTERFACE</h6>
            <div className="row g-3 mb-5">
              <div className="col-12 col-sm-6">
                <div className={`p-4 rounded-4 border text-center transition-all ${tema === 'light' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`} onClick={() => changeTheme('light')} style={{ cursor: 'pointer' }}>
                  <span style={{fontSize: '2rem'}}><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                  <h6 className="fw-bold mt-2 text-dark">Modo Claro</h6>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className={`p-4 rounded-4 border text-center transition-all ${tema === 'dark' ? 'border-primary bg-dark' : 'border-light bg-light'}`} onClick={() => changeTheme('dark')} style={{ cursor: 'pointer' }}>
                  <span style={{fontSize: '2rem'}}><img src="/icons/pausa.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                  <h6 className="fw-bold mt-2" style={tema === 'dark' ? {color: 'white'} : {color: '#333'}}>Modo Escuro</h6>
                </div>
              </div>
            </div>

            <h6 className="fw-bold mb-3" style={{ color: 'var(--dl-text-primary)' }}>LOCALIZAÇÃO GLOBAL</h6>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Idioma Principal</label>
                <select className="form-select bg-light border-0 py-2" value={idioma} onChange={(e) => handleLanguageChange(e.target.value)}>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="ja">日本語 (Japonês)</option>
                  <option value="zh">中文 (Mandarim)</option>
                  <option value="ru">Русский (Russo)</option>
                  <option value="ko">한국어 (Coreano)</option>
                </select>
                <small className="text-muted mt-2 d-block">Nota: O idioma só afeta a formatação de dados nesta versão.</small>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Fuso Horário</label>
                <select className="form-select bg-light border-0 py-2">
                  <option value="America/Sao_Paulo">(GMT-03:00) Horário de Brasília</option>
                  <option value="America/New_York">(GMT-05:00) Eastern Time (US)</option>
                  <option value="Europe/London">(GMT+00:00) London</option>
                  <option value="Asia/Tokyo">(GMT+09:00) Tokyo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ======================= NOTIFICAÇÕES ======================= */}
        {activeTab === 'notificacoes' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4" style={{ backgroundColor: 'var(--dl-surface)' }}>
            <h4 className="fw-bold mb-4" style={{ color: 'var(--dl-text-primary)' }}>Notificações e Alertas</h4>
            <div className="alert bg-light border-0 text-muted rounded-4 mb-4">
               Funcionalidade em desenvolvimento. As preferências cadastradas aqui não terão efeito imediato.
            </div>

            <div className="form-check form-switch mb-4 d-flex align-items-center px-0">
              <div className="flex-grow-1">
                <label className="fw-bold d-block" style={{ color: 'var(--dl-text-primary)' }} htmlFor="notif-email">Alertas de Ofertas Expirando</label>
                <small style={{ color: 'var(--dl-text-secondary)' }}>Receber e-mail diário com ofertas próximas do vencimento.</small>
              </div>
              <input className="form-check-input fs-4 m-0 ms-3" type="checkbox" id="notif-email" disabled />
            </div>
            <hr className="border-light opacity-50" />
            <div className="form-check form-switch mt-4 d-flex align-items-center px-0">
              <div className="flex-grow-1">
                <label className="fw-bold d-block" style={{ color: 'var(--dl-text-primary)' }} htmlFor="notif-relatorio">Relatório Semanal de Engajamento</label>
                <small style={{ color: 'var(--dl-text-secondary)' }}>Receber somatório semanal de todos os cliques e acessos.</small>
              </div>
              <input className="form-check-input fs-4 m-0 ms-3" type="checkbox" id="notif-relatorio" disabled />
            </div>
          </div>
        )}

        {/* ======================= IDENTIDADE E MARCA ======================= */}
        {activeTab === 'identidade' && (
          <form onSubmit={handleSalvar} className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4" style={{ backgroundColor: 'var(--dl-surface)' }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h4 className="fw-bold m-0" style={{ color: 'var(--dl-text-primary)' }}>Identidade da Empresa</h4>
              <button type="submit" className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Etapa'}
              </button>
            </div>

            <div className="rounded-4 border overflow-hidden bg-light shadow-sm mb-5">
              <div className="position-relative" style={{ height: '180px' }}>
                {bannerPerfil ? (
                  <img src={bannerPerfil} alt="Banner da empresa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center" style={{ background: 'linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-secondary) 100%)' }}>
                    <span style={{ fontSize: '2.3rem' }}><img src="/icons/companhia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                    <p className="mb-0 mt-2 fw-bold text-white">Adicionar banner do perfil</p>
                  </div>
                )}
                <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-25 d-flex justify-content-between align-items-center">
                  <div className="text-white">
                    <div className="fw-bold">Banner do Perfil</div>
                    <small className="opacity-75">Recomendado: 1600x500px</small>
                  </div>
                  <label className="btn btn-light btn-sm fw-bold rounded-pill mb-0" style={{ cursor: 'pointer' }}>
                    {enviandoBanner ? 'Enviando...' : 'Escolher imagem'}
                    <input type="file" accept="image/*" hidden onChange={handleUploadBanner} disabled={enviandoBanner} />
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-center bg-light p-4 rounded-4 mb-5 border">
               <div className="mb-3 mb-sm-0 me-sm-4 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center border overflow-hidden flex-shrink-0" style={{ width: '120px', height: '120px' }}>
                  {logotipo ? ( <img src={logotipo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> ) : ( <span style={{ fontSize: '3rem', opacity: 0.3 }}><img src="/icons/companhia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span> )}
               </div>
               <div className="text-center text-sm-start w-100">
                  <label className="form-label text-dark fw-bold mb-2">Logotipo da Empresa</label>
                  <input type="file" accept="image/*" className="form-control border-0 bg-white shadow-sm" onChange={handleUploadLogo} disabled={enviandoLogo} />
                  <small className="text-muted d-block mt-2">{enviandoLogo ? "Enviando arquivo ao servidor..." : "Recomendado: Imagem quadrada em formato PNG ou JPG (Max 5MB)."}</small>
               </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Nome Fantasia</label>
                <input type="text" className="form-control bg-light border-0 py-2" required value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Razão Social</label>
                <input type="text" className="form-control bg-light border-0 py-2" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Ramo de Atividade</label>
                <select className="form-select bg-light border-0 py-2" required value={idRamo} onChange={(e) => setIdRamo(e.target.value)}>
                   <option value="">Selecione o ramo...</option>
                   {ramos.map(r => ( <option key={r.id} value={r.id}>{r.nome}</option> ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">CNPJ (Apenas leitura)</label>
                <input type="text" className="form-control border-0 bg-light text-muted py-2 opacity-75" value={cnpj} disabled />
              </div>
            </div>
          </form>
        )}

        {/* ======================= MEIOS DE CONTATO ======================= */}
        {activeTab === 'contato' && (
          <form onSubmit={handleSalvar} className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4" style={{ backgroundColor: 'var(--dl-surface)' }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h4 className="fw-bold m-0" style={{ color: 'var(--dl-text-primary)' }}>Canais de Atendimento</h4>
              <button type="submit" className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Etapa'}
              </button>
            </div>
            
            <h6 className="fw-bold mb-3 text-muted text-uppercase small" style={{ letterSpacing: '1px' }}>Vias Diretas</h6>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">WhatsApp Principal</label>
                <input type="text" className="form-control bg-light border-0 py-2" required value={contatoWhatsapp} onChange={(e) => setContatoWhatsapp(e.target.value)} placeholder="(XX) 9XXXX-XXXX" />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">E-mail de Suporte / Comercial</label>
                <input type="email" className="form-control bg-light border-0 py-2" value={emailContato} onChange={(e) => setEmailContato(e.target.value)} placeholder="contato@suaempresa.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Telefone Fixo / Alternativo 1</label>
                <input type="text" className="form-control bg-light border-0 py-2" value={contato1} onChange={(e) => setContato1(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Telefone Fixo / Alternativo 2</label>
                <input type="text" className="form-control bg-light border-0 py-2" value={contato2} onChange={(e) => setContato2(e.target.value)} />
              </div>
            </div>

            <hr className="border-light opacity-50 my-4" />
            
            <h6 className="fw-bold mb-3 text-muted text-uppercase small" style={{ letterSpacing: '1px' }}>Informações de Funcionamento</h6>
            <div className="row g-4">
              <div className="col-12">
                <label className="form-label text-muted small fw-bold">Horário de Funcionamento</label>
                <input type="text" className="form-control bg-light border-0 py-2" required value={horarioFuncionamento} onChange={(e) => setHorarioFuncionamento(e.target.value)} placeholder="Ex: Seg a Sex: 08:00 - 18:00 | Sábado até as 14:00" />
              </div>
              <div className="col-12">
                <label className="form-label text-muted small fw-bold">Instruções de Retirada para o Cliente</label>
                <textarea rows="3" className="form-control bg-light border-0 py-2" required value={instrucoesRetirada} onChange={(e) => setInstrucoesRetirada(e.target.value)} placeholder="Ex: Vá ao caixa central informando o código da oferta para realizar a retirada do item."></textarea>
              </div>
            </div>
          </form>
        )}

        {/* ======================= LOCALIZAÇÃO ======================= */}
        {activeTab === 'endereco' && (
          <form onSubmit={handleSalvar} className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4" style={{ backgroundColor: 'var(--dl-surface)' }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h4 className="fw-bold m-0" style={{ color: 'var(--dl-text-primary)' }}>Endereço Físico</h4>
              <button type="submit" className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Etapa'}
              </button>
            </div>

            <div className="alert bg-primary bg-opacity-10 border-0 text-primary rounded-4 mb-5 p-3 d-flex align-items-start gap-3">
              <span className="fs-4"><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
              <p className="mb-0 small">Os clientes utilizarão este endereço para clicar em "Como Chegar" no aplicativo. Certifique-se de preencher dados precisos para que o GPS (Google Maps/Waze) trace a rota corretamente.</p>
            </div>

            <div className="row g-4">
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">CEP</label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                  <input type="text" maxLength="9" placeholder="Ex: 50010-000" className="form-control bg-light border-0 py-2" required value={cep} onChange={handleCepChange} onBlur={buscarCepNosCorreios} />
                  <button className="btn btn-secondary px-3" type="button" onClick={buscarCepNosCorreios}>Buscar</button>
                </div>
              </div>
              <div className="col-md-8">
                <label className="form-label text-muted small fw-bold">Logradouro / Rua</label>
                <input type="text" className="form-control bg-light border-0 py-2" required value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold">Número</label>
                <input id="inputNumero" type="text" className="form-control bg-light border-0 py-2" required value={numero} onChange={(e) => setNumero(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Complemento</label>
                <input type="text" className="form-control bg-light border-0 py-2" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Loja 2, Térreo, etc." />
              </div>
              <div className="col-md-5">
                <label className="form-label text-muted small fw-bold">Bairro</label>
                <input type="text" className="form-control bg-light border-0 py-2" required value={bairro} onChange={(e) => setBairro(e.target.value)} />
              </div>
              <div className="col-md-9">
                <label className="form-label text-muted small fw-bold">Cidade</label>
                <input type="text" className="form-control bg-light border-0 py-2" required value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold">UF</label>
                <input type="text" maxLength="2" className="form-control bg-light border-0 py-2 text-uppercase" required value={uf} onChange={(e) => setUf(e.target.value)} />
              </div>
            </div>
          </form>
        )}

        {/* ======================= SEGURANÇA ======================= */}
        {activeTab === 'seguranca' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4" style={{ backgroundColor: 'var(--dl-surface)' }}>
            <h4 className="fw-bold mb-4 text-danger">Segurança & Exclusão</h4>
            <p className="text-muted mb-5">Área restrita. Realize alterações de senha ou o encerramento da conta do estabelecimento comercial na plataforma.</p>
            
            <div className="bg-light p-4 rounded-4 mb-4 border">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="mb-3 mb-md-0 me-md-4">
                  <h6 className="fw-bold text-dark">Alteração de Senha</h6>
                  <p className="text-muted small mb-0">Por medidas de segurança, a troca de senha deve ser feita através do fluxo de recuperação na tela inicial de login (Esqueceu a senha?).</p>
                </div>
                <button className="btn btn-outline-secondary fw-bold rounded-pill px-4 flex-shrink-0" disabled>Em desenvolvimento</button>
              </div>
            </div>

            <div className="bg-danger bg-opacity-10 p-4 rounded-4 border border-danger border-opacity-25 mt-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="mb-3 mb-md-0 me-md-4">
                  <h6 className="fw-bold text-danger">Encerrar Parceria (Excluir Conta)</h6>
                  <p className="text-danger small opacity-75 mb-0">Ao prosseguir com a exclusão da sua conta, todo o seu catálogo de produtos, histórico de ofertas, métricas de engajamento e dados de faturamento serão permanentemente apagados do sistema Deadline de forma irreversível.</p>
                </div>
                <button className="btn btn-danger fw-bold rounded-pill px-4 flex-shrink-0 shadow-sm" onClick={() => setShowDeleteModal(true)}>
                  Excluir Empresa
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg" style={{ backgroundColor: 'var(--dl-surface)' }}>
              <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
                <h5 className="modal-title fw-bold text-danger"><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Confirmar Exclusão</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <form onSubmit={handleDeleteAccount}>
                <div className="modal-body px-4 py-4">
                  <p className="text-muted mb-4" style={{ color: 'var(--dl-text-primary)' }}>
                    Para confirmar a exclusão <strong>irreversível</strong> da sua empresa, digite suas credenciais para validar a operação.
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">E-mail de Login Corporativo</label>
                    <input type="email" className="form-control bg-light border-0 py-2" required value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted">Senha Atual</label>
                    <div className="input-group">
                      <input 
                        type={showDeletePassword ? "text" : "password"} 
                        className="form-control bg-light border-0 py-2" 
                        required 
                        value={deletePassword} 
                        onChange={(e) => setDeletePassword(e.target.value)} 
                      />
                      <button 
                        type="button" 
                        className="btn btn-light bg-light border-0" 
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        style={{ padding: '0 15px' }}
                      >
                        {showDeletePassword ? <img src="/icons/olho.png" alt="Ocultar" style={{ width: "20px" }} /> : <img src="/icons/olho_aberto.png" alt="Mostrar" style={{ width: "20px" }} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-light fw-bold rounded-pill px-4" onClick={() => setShowDeleteModal(false)} disabled={excluindoConta}>Cancelar</button>
                  <button type="submit" className="btn btn-danger fw-bold rounded-pill px-4 shadow-sm" disabled={excluindoConta}>
                    {excluindoConta ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}