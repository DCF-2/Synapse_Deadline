import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// Captura as variáveis de ambiente para o Cloudinary (com fallbacks)
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deadline_upload';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('geral');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  // Lista dinâmica de Ramos
  const [ramos, setRamos] = useState([]);

  // Estados dos Campos do Perfil
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [logotipo, setLogotipo] = useState(''); 
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

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEnviandoLogo(true);
    setErro(null);

    const formData = new FormData();
    formData.append('file', file);
    // Usa a variável de ambiente para o Preset
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 

    try {
      // Usa a variável de ambiente para montar a URL do Cloudinary dinamicamente
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Cloudinary Erro: ${errorData.error?.message || 'Falha na autenticação'}`);
      }

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

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    try {
      const token = localStorage.getItem('deadline_token');
      
      const payload = {
        nomeFantasia,
        razaoSocial,
        cnpj,
        logotipo,
        // Correção de segurança: converte para Integer/Number do JS de forma segura
        idRamo: idRamo ? parseInt(idRamo, 10) : null,
        emailLogin,
        contatoWhatsapp,
        contato1,
        contato2,
        emailContato,
        horarioFuncionamento,
        instrucoesRetirada,
        endereco: {
          logradouro, numero, complemento, bairro, cep, cidade, uf // Ajustado 'city' para 'cidade'
        }
      };

      const res = await fetch(`${API_URL}/empresa/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Erro 500: Verifique se todos os campos obrigatórios estão preenchidos corretamente.');
      }

      setSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="spinner-border text-success"></div>
      <span className="ms-3 text-muted fw-bold">Carregando configurações...</span>
    </div>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Perfil da Empresa</h2>
          <p className="text-muted small m-0 mt-1">Gerencie a identidade, ramo de atividade e dados cadastrais.</p>
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ maxWidth: '900px' }}>
        
        {erro && <div className="alert alert-danger rounded-3">⚠️ {erro}</div>}
        {sucesso && <div className="alert alert-success rounded-3">✅ Operação realizada com sucesso!</div>}

        <ul className="nav nav-tabs mb-4 border-bottom-0">
          <li className="nav-item">
            <button type="button" className={`nav-link fw-bold border-0 px-4 py-2 me-2 rounded-3 ${activeTab === 'geral' ? 'bg-light text-success' : 'text-muted bg-transparent'}`} onClick={() => setActiveTab('geral')}>🏢 Empresa</button>
          </li>
          <li className="nav-item">
            <button type="button" className={`nav-link fw-bold border-0 px-4 py-2 me-2 rounded-3 ${activeTab === 'contato' ? 'bg-light text-success' : 'text-muted bg-transparent'}`} onClick={() => setActiveTab('contato')}>📞 Contatos</button>
          </li>
          <li className="nav-item">
            <button type="button" className={`nav-link fw-bold border-0 px-4 py-2 rounded-3 ${activeTab === 'endereco' ? 'bg-light text-success' : 'text-muted bg-transparent'}`} onClick={() => setActiveTab('endereco')}>📍 Localização</button>
          </li>
        </ul>

        <form onSubmit={handleSalvar}>
          
          {activeTab === 'geral' && (
            <div className="row g-3">
              <div className="col-12 d-flex align-items-center bg-light p-3 rounded-4 mb-3 border">
                 <div className="me-4 bg-white rounded-4 shadow-sm d-flex align-items-center justify-content-center border overflow-hidden" style={{ width: '100px', height: '100px' }}>
                    {logotipo ? (
                      <img src={logotipo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : ( <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>🏢</span> )}
                 </div>
                 <div>
                    <label className="form-label text-dark fw-bold mb-1" style={{fontSize: '14px'}}>Logotipo da Empresa</label>
                    <input type="file" accept="image/*" className="form-control form-control-sm border-0 bg-white shadow-sm" onChange={handleUploadLogo} disabled={enviandoLogo} />
                    <small className="text-muted d-block mt-1">{enviandoLogo ? "Enviando arquivo ao Cloudinary..." : "Selecione um arquivo PNG ou JPG para atualizar."}</small>
                 </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Nome Fantasia</label>
                <input type="text" className="form-control bg-light border-0" required value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Razão Social</label>
                <input type="text" className="form-control bg-light border-0" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-success">Ramo de Atividade</label>
                <select className="form-select bg-light border-0" required value={idRamo} onChange={(e) => setIdRamo(e.target.value)}>
                   <option value="">Selecione o ramo...</option>
                   {ramos.map(r => (
                     <option key={r.id} value={r.id}>{r.nome}</option>
                   ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">CNPJ</label>
                <input type="text" className="form-control bg-light border-0" value={cnpj} disabled />
              </div>
            </div>
          )}

          {activeTab === 'contato' && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">WhatsApp Principal</label>
                <input type="text" className="form-control bg-light border-0" required value={contatoWhatsapp} onChange={(e) => setContatoWhatsapp(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">E-mail Comercial</label>
                <input type="email" className="form-control bg-light border-0" value={emailContato} onChange={(e) => setEmailContato(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Telefone Fixo / Alternativo 1</label>
                <input type="text" className="form-control bg-light border-0" value={contato1} onChange={(e) => setContato1(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Telefone Fixo / Alternativo 2</label>
                <input type="text" className="form-control bg-light border-0" value={contato2} onChange={(e) => setContato2(e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label text-muted small fw-bold">Horário de Funcionamento</label>
                <input type="text" className="form-control bg-light border-0" required value={horarioFuncionamento} onChange={(e) => setHorarioFuncionamento(e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label text-muted small fw-bold text-danger">📋 Instruções de Retirada para o Cliente</label>
                <textarea rows="3" className="form-control bg-light border-0" required value={instrucoesRetirada} onChange={(e) => setInstrucoesRetirada(e.target.value)}></textarea>
              </div>
            </div>
          )}

          {activeTab === 'endereco' && (
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold">CEP</label>
                <input type="text" className="form-control bg-light border-0" required value={cep} onChange={(e) => setCep(e.target.value)} />
              </div>
              <div className="col-md-7">
                <label className="form-label text-muted small fw-bold">Logradouro</label>
                <input type="text" className="form-control bg-light border-0" required value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted small fw-bold">Número</label>
                <input type="text" className="form-control bg-light border-0" required value={numero} onChange={(e) => setNumero(e.target.value)} />
              </div>
              <div className="col-md-5">
                <label className="form-label text-muted small fw-bold">Complemento</label>
                <input type="text" className="form-control bg-light border-0" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Bairro</label>
                <input type="text" className="form-control bg-light border-0" required value={bairro} onChange={(e) => setBairro(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted small fw-bold">Cidade</label>
                <input type="text" className="form-control bg-light border-0" required value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="col-md-1">
                <label className="form-label text-muted small fw-bold">UF</label>
                <input type="text" maxLength="2" className="form-control bg-light border-0 text-uppercase" required value={uf} onChange={(e) => setUf(e.target.value)} />
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
            <button type="submit" className="btn text-white fw-bold px-5 py-2 rounded-3" style={{ backgroundColor: 'var(--dl-primary)' }} disabled={salvando || enviandoLogo}>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}