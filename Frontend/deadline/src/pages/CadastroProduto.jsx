import React, { useState, useEffect } from 'react'; // IMPORT CORRIGIDO
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deadline_upload';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';

export default function CadastroProduto() {
  const [nome, setNome] = useState('');
  const [codigoBarrasEan, setCodigoBarrasEan] = useState('');
  
  // ESTADOS DE CATEGORIA CORRIGIDOS
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemUrl, setImagemUrl] = useState('');
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadandoImagem, setUploadandoImagem] = useState(false);

  const navigate = useNavigate();

  // O USE EFFECT DEVE FICAR DENTRO DO COMPONENTE
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;
        
        const res = await fetch(`${API_URL}/produto/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    
    fetchCategorias();
  }, []); // Executa apenas uma vez quando a página carrega

  // Upload de imagem para Cloudinary
  const uploadarImagemCloudinary = async (arquivo) => {
    setUploadandoImagem(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      setErro(`Erro no upload: ${err.message}`);
      return null;
    } finally {
      setUploadandoImagem(false);
    }
  };

  const handleImagemChange = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setImagem(arquivo);
    
    // Upload automático para Cloudinary
    const url = await uploadarImagemCloudinary(arquivo);
    if (url) {
      setImagemUrl(url);
      setErro(null);
    }
  };

  async function handleCadastrar(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    const token = localStorage.getItem('deadline_token');
    if (!token) {
      setErro('Sua sessão expirou. Por favor, faça login novamente.');
      navigate('/auth');
      return;
    }

    const preco = Number.parseFloat(precoOriginal);
    const categoriaId = Number.parseInt(categoriaSelecionada, 10);

    if (!nome.trim()) {
      setErro('Informe o nome do produto.');
      return;
    }

    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      setErro('Selecione uma categoria válida.');
      return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      setErro('Informe um preço original válido.');
      return;
    }

    setLoading(true);
    try {
      const corpo = {
        tituloProduto: nome.trim(),
        codBarrasEan: codigoBarrasEan.trim() ? codigoBarrasEan.trim() : null,
        idCategoria: categoriaId,
        descricao: descricao ? descricao.trim() : null,
        precoOriginal: preco,
        foto: imagemUrl || null,
      };
      
      const response = await fetch(`${API_URL}/produto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(corpo),
      });

      if (response.ok) {
        setSucesso(true);
        setNome('');
        setCodigoBarrasEan('');
        setCategoriaSelecionada('');
        setPrecoOriginal('');
        setDescricao('');
        setImagem(null);
        setImagemUrl('');
        setTimeout(() => navigate('/produtos'), 2000);
      } else {
        if (response.status === 403 || response.status === 401) {
          setErro('Sua sessão expirou. Por favor, faça login novamente.');
          navigate('/auth');
          return;
        }
        const data = await response.json().catch(() => ({}));
        setErro(data.message || 'Erro ao cadastrar produto. Verifique os campos.');
      }
    } catch (err) {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <nav className="col-md-3 col-lg-2 p-3 d-flex flex-column justify-content-between"
        style={{ backgroundColor: '#23a889', height: '100vh', position: 'sticky', top: 0, zIndex: 1030, minWidth: '200px' }}>
        <div>
          <div className="text-white my-3 ps-2">
            <h4 className="fw-bold d-flex align-items-center gap-2">
              <span>⏱️</span> Deadline
            </h4>
          </div>
          <ul className="nav nav-pills flex-column mb-auto mt-4 gap-1">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                <span>📊</span> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/produtos" className="nav-link text-white fw-medium d-flex align-items-center gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                <span>📦</span> Meus Produtos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/ofertas" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2">
                <span>📢</span> Minhas Ofertas
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-4">
          <div className="p-3 mb-3 text-white rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '13px' }}>
            <p className="fw-bold mb-1">Sabia que...</p>
            <p className="m-0 opacity-90" style={{ lineHeight: '1.4' }}>
              Vender com 50% de desconto ainda é melhor do que descartar e ter prejuízo total?
            </p>
          </div>
          <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-2 border-0"
            onClick={() => { localStorage.removeItem('deadline_token'); navigate('/auth'); }}>
            <span>🚪</span> Sair
          </button>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-grow-1 p-4" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
        <button onClick={() => navigate('/produtos')}
          className="btn btn-link text-muted text-decoration-none mb-3 ps-0">
          ← Voltar para produtos
        </button>

        <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '700px' }}>
          <div className="d-flex align-items-center justify-content-center mb-3"
            style={{ width: '60px', height: '60px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', margin: '0 auto 16px auto' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#23a889" strokeWidth="2">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
          </div>

          <h2 className="fw-bold text-center text-dark mb-2">Cadastro do Produto</h2>
          <p className="text-muted text-center small mb-4">
            Cadastre o produto aqui e, depois, use “Minhas Ofertas” para criar a promoção quando quiser.
          </p>

          {erro && (
            <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3">
              ⚠️ {erro}
            </div>
          )}
          {sucesso && (
            <div className="alert alert-success rounded-3">
              ✓ Produto cadastrado com sucesso! Você pode criar uma oferta depois na área “Minhas Ofertas”.
            </div>
          )}

          <form onSubmit={handleCadastrar}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Nome</label>
                <input type="text" className="form-control" placeholder="Nome do produto"
                  value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Código de barras</label>
                <input type="text" className="form-control" placeholder="EAN (Opcional)"
                  value={codigoBarrasEan} onChange={e => setCodigoBarrasEan(e.target.value)} maxLength={13} />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Categoria</label>
                <select className="form-select bg-light border-0 text-muted" 
                  value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} required>
                  <option value="">Selecione uma Categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Preço original (R$)</label>
                <input type="number" className="form-control" placeholder="0.00"
                  value={precoOriginal} onChange={e => setPrecoOriginal(e.target.value)}
                  required min="0.01" step="0.01" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Descrição</label>
              <textarea className="form-control" placeholder="Descreva as especificações do produto..."
                value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} />
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Imagem do produto</label>
              <label className="d-flex flex-column align-items-center justify-content-center rounded-3 p-4"
                style={{ border: '2px dashed #d1d5db', cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={handleImagemChange} style={{ display: 'none' }} disabled={uploadandoImagem} />
                {uploadandoImagem ? (
                  <span className="text-info">⏳ Enviando imagem...</span>
                ) : imagemUrl ? (
                  <>
                    <img src={imagemUrl} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px' }} />
                    <span className="text-success">✓ {imagem?.name || 'Imagem carregada'}</span>
                  </>
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span className="text-muted small mt-2">Clique para enviar uma imagem</span>
                  </>
                )}
              </label>
            </div>

            <button type="submit" disabled={loading || uploadandoImagem} className="btn w-100 fw-bold py-3 text-white"
              style={{ backgroundColor: '#23a889', borderRadius: '10px', opacity: loading || uploadandoImagem ? 0.65 : 1 }}>
              {loading ? 'Salvando no catálogo...' : 'Cadastrar Produto'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}