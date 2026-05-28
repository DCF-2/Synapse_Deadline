import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deadline_upload';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';

export default function CadastroProduto() {
  const [nome, setNome] = useState('');
  const [codigoBarrasEan, setCodigoBarrasEan] = useState('');
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

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;
        const res = await fetch(`${API_URL}/categoria`, {
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
  }, []);

  const uploadarImagemCloudinary = async (arquivo) => {
    setUploadandoImagem(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST', body: formData
      });

      if (!response.ok) throw new Error('Erro ao fazer upload da imagem');
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
    if (!token) { navigate('/auth'); return; }

    const preco = Number.parseFloat(precoOriginal);
    const categoriaId = Number.parseInt(categoriaSelecionada, 10);

    if (!nome.trim()) { setErro('Informe o nome do produto.'); return; }
    if (!Number.isInteger(categoriaId) || categoriaId <= 0) { setErro('Selecione uma categoria válida.'); return; }
    if (!Number.isFinite(preco) || preco <= 0) { setErro('Informe um preço original válido.'); return; }

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(corpo),
      });

      if (response.ok) {
        setSucesso(true);
        setTimeout(() => navigate('/produtos'), 2000);
      } else {
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
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Novo Produto</h2>
          <p className="text-muted small m-0 mt-1">Adicione um novo item ao seu catálogo.</p>
        </div>
        <Link to="/produtos" className="btn btn-outline-secondary fw-bold rounded-3">← Voltar</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
        
        {erro && <div className="alert alert-danger rounded-3 shadow-sm">⚠️ {erro}</div>}
        {sucesso && <div className="alert alert-success rounded-3 shadow-sm">✓ Produto cadastrado com sucesso!</div>}

        <form onSubmit={handleCadastrar}>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small">Nome do Produto</label>
              <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm" placeholder="Ex: Leite Integral" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small">Código de barras (EAN)</label>
              <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm" placeholder="Opcional" value={codigoBarrasEan} onChange={e => setCodigoBarrasEan(e.target.value)} maxLength={13} />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small">Categoria</label>
              <select className="form-select form-select-lg bg-light border-0 shadow-sm" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} required>
                <option value="">Selecione...</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small">Preço Base (R$)</label>
              <input type="number" className="form-control form-control-lg bg-light border-0 shadow-sm fw-bold text-success" placeholder="0.00" value={precoOriginal} onChange={e => setPrecoOriginal(e.target.value)} required min="0.01" step="0.01" />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-muted small">Descrição Detalhada</label>
            <textarea className="form-control bg-light border-0 shadow-sm" placeholder="Detalhes do produto..." value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-muted small">Imagem do Produto</label>
            <label className="d-flex flex-column align-items-center justify-content-center rounded-4 p-4 shadow-sm bg-light" style={{ border: '2px dashed #d1d5db', cursor: 'pointer', transition: 'all 0.3s' }}>
              <input type="file" accept="image/*" onChange={handleImagemChange} style={{ display: 'none' }} disabled={uploadandoImagem} />
              {uploadandoImagem ? (
                <span className="text-info fw-bold">⏳ Enviando...</span>
              ) : imagemUrl ? (
                <>
                  <img src={imagemUrl} alt="Preview" className="rounded shadow-sm mb-2" style={{ maxWidth: '120px', maxHeight: '120px' }} />
                  <span className="text-success fw-bold">✓ Imagem carregada</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '2rem', opacity: 0.4 }}>📷</span>
                  <span className="text-muted small fw-bold mt-2">Clique para enviar uma foto</span>
                </>
              )}
            </label>
          </div>

          <div className="d-flex justify-content-end pt-3 border-top">
            <button type="submit" disabled={loading || uploadandoImagem} className="btn text-white fw-bold px-5 py-2 rounded-3 shadow-sm" style={{ backgroundColor: 'var(--dl-primary)' }}>
              {loading ? 'Salvando...' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}