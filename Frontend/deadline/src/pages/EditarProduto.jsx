import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deadline_upload';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';

export default function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [codigoBarrasEan, setCodigoBarrasEan] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [uploadandoImagem, setUploadandoImagem] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDados = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) return;

        const resCat = await fetch(`${API_URL}/categoria`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resCat.ok && isMounted) {
          const catData = await resCat.json();
          setCategorias(catData);
        }

        const resProd = await fetch(`${API_URL}/produto/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resProd.ok && isMounted) {
          const data = await resProd.json();
          setNome(data.tituloProduto || '');
          setCodigoBarrasEan(data.codBarrasEan || '');
          setPrecoOriginal(data.precoOriginal ? data.precoOriginal.toString() : '');
          setDescricao(data.descricao || '');
          setImagemUrl(data.foto || '');
          setAtivo(data.ativo !== false);
          
          if(data.nomeCategoria) {
             fetch(`${API_URL}/categoria`, { headers: { 'Authorization': `Bearer ${token}` }})
             .then(r => r.json())
             .then(cats => {
                 const catEncontrada = cats.find(c => c.nome === data.nomeCategoria);
                 if(catEncontrada && isMounted) setCategoriaSelecionada(catEncontrada.id.toString());
             });
          }
        } else {
           throw new Error("Não foi possível carregar o produto.");
        }
      } catch (error) {
        if(isMounted) setErro(error.message);
      } finally {
        if(isMounted) setCarregandoDados(false);
      }
    };
    fetchDados();
    return () => { isMounted = false; };
  }, [id]);

  const handleImagemChange = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    
    setUploadandoImagem(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Erro no upload');
      const data = await res.json();
      setImagemUrl(data.secure_url);
    } catch (err) {
      setErro(err.message);
    } finally {
      setUploadandoImagem(false);
    }
  };

  async function handleSalvar(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    const token = localStorage.getItem('deadline_token');
    const preco = Number.parseFloat(precoOriginal);
    const categoriaId = Number.parseInt(categoriaSelecionada, 10);

    setLoading(true);
    try {
      const corpo = {
        tituloProduto: nome.trim(),
        codBarrasEan: codigoBarrasEan.trim() || null,
        idCategoria: categoriaId,
        descricao: descricao ? descricao.trim() : null,
        precoOriginal: preco,
        foto: imagemUrl || null,
        ativo: ativo
      };
      
      const response = await fetch(`${API_URL}/produto/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(corpo),
      });

      if (response.ok) {
        setSucesso("Produto atualizado com sucesso!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const data = await response.json().catch(() => ({}));
        setErro(data.message || 'Erro ao atualizar produto.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErro('Falha na conexão.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  if (carregandoDados) return <div className="text-center p-5"><div className="spinner-border text-success"></div></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark m-0">Editar Produto</h2>
          <p className="text-muted small m-0 mt-1">Altere informações da base do seu produto.</p>
        </div>
        <Link to="/produtos" className="btn btn-outline-secondary fw-bold rounded-3">← Voltar</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
        {erro && <div className="alert alert-danger rounded-3 shadow-sm">⚠️ {erro}</div>}
        {sucesso && <div className="alert alert-success rounded-3 shadow-sm">✓ {sucesso}</div>}

        <form onSubmit={handleSalvar}>
          <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center shadow-sm border" style={{ backgroundColor: ativo ? '#f0fdf4' : '#fee2e2', borderColor: ativo ? '#bbf7d0' : '#fecaca' }}>
             <div>
                <h6 className={`fw-bold mb-1 ${ativo ? 'text-success' : 'text-danger'}`}>Status: {ativo ? 'Produto Ativo' : 'Produto Inativo'}</h6>
                <p className="small text-muted mb-0">{ativo ? 'Visível no catálogo.' : 'Oculto do catálogo.'}</p>
             </div>
             <div className="form-check form-switch fs-4 m-0">
                <input className="form-check-input" type="checkbox" role="switch" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
             </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small">Nome do Produto</label>
              <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small">Código de barras (EAN)</label>
              <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm" value={codigoBarrasEan} onChange={e => setCodigoBarrasEan(e.target.value)} maxLength={13} />
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
              <input type="number" className="form-control form-control-lg bg-light border-0 shadow-sm fw-bold text-success" value={precoOriginal} onChange={e => setPrecoOriginal(e.target.value)} required min="0.01" step="0.01" />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-muted small">Descrição Detalhada</label>
            <textarea className="form-control bg-light border-0 shadow-sm" value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-muted small">Imagem do Produto</label>
            <label className="d-flex flex-column align-items-center justify-content-center rounded-4 p-4 shadow-sm bg-light" style={{ border: '2px dashed #d1d5db', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleImagemChange} style={{ display: 'none' }} disabled={uploadandoImagem} />
              {uploadandoImagem ? (
                <span className="text-info fw-bold">⏳ Enviando...</span>
              ) : imagemUrl ? (
                <>
                  <img src={imagemUrl} alt="Preview" className="rounded shadow-sm mb-2" style={{ maxWidth: '120px', maxHeight: '120px' }} />
                  <span className="text-success fw-bold">✓ Clique para alterar a imagem</span>
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
              {loading ? 'A guardar...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}