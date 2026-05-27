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
  const [imagem, setImagem] = useState(null);
  const [imagemUrl, setImagemUrl] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [uploadandoImagem, setUploadandoImagem] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('deadline_token');
    navigate('/auth');
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchDados = async () => {
      try {
        const token = localStorage.getItem('deadline_token');
        if (!token) { handleLogout(); return; }

        const resCat = await fetch(`${API_URL}/produto/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resCat.ok && isMounted) {
          const catData = await resCat.json();
          setCategorias(catData);
        }

        const resProd = await fetch(`${API_URL}/produto/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resProd.ok && isMounted) {
          const data = await resProd.json();
          setNome(data.tituloProduto || '');
          setCodigoBarrasEan(data.codBarrasEan || '');
          
          if(data.nomeCategoria) {
             fetch(`${API_URL}/produto/categorias`, { headers: { 'Authorization': `Bearer ${token}` }})
             .then(r => r.json())
             .then(cats => {
                 const catEncontrada = cats.find(c => c.nome === data.nomeCategoria);
                 if(catEncontrada && isMounted) setCategoriaSelecionada(catEncontrada.id.toString());
             });
          }

          setPrecoOriginal(data.precoOriginal ? data.precoOriginal.toString() : '');
          setDescricao(data.descricao || '');
          setImagemUrl(data.foto || '');
          setAtivo(data.ativo !== false);
        } else {
           if(resProd.status === 401 || resProd.status === 403) handleLogout();
           else throw new Error("Não foi possível carregar os dados do produto.");
        }

      } catch (error) {
        if(isMounted) setErro(error.message);
      } finally {
        if(isMounted) setCarregandoDados(false);
      }
    };

    fetchDados();
    return () => { isMounted = false; };
  }, [id, navigate]);

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

  async function handleSalvar(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    const token = localStorage.getItem('deadline_token');
    if (!token) { handleLogout(); return; }

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
        ativo: ativo
      };
      
      const response = await fetch(`${API_URL}/produto/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(corpo),
      });

      if (response.ok) {
        setSucesso("Produto atualizado com sucesso!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => navigate(`/produto/${id}`), 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        setErro(data.message || 'Erro ao atualizar produto. Verifique os campos.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErro('Não foi possível conectar ao servidor.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      
      <header className="navbar navbar-dark d-md-none px-3 sticky-top shadow-sm" style={{ backgroundColor: '#52b788' }}>
        <span className="navbar-brand fw-bold text-white">⏱️ Deadline</span>
        <button className="navbar-toggler border-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>

      <nav className={`col-md-3 col-lg-2 p-3 d-md-flex flex-column justify-content-between ${isMenuOpen ? 'd-flex' : 'd-none d-md-flex'}`}
        style={{ backgroundColor: '#3aad77', height: '100vh', position: 'sticky', top: 0, zIndex: 1030, minWidth: '200px' }}>
        <div>
          <div className="text-white my-3 ps-2">
            <h4 className="fw-bold d-flex align-items-center gap-2"><span>⏱️</span> Deadline</h4>
          </div>
          <ul className="nav nav-pills flex-column mb-auto mt-4 gap-1">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2"><span>📊</span> Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/produtos" className="nav-link text-white fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}><span>📦</span> Meus Produtos</Link>
            </li>
            <li className="nav-item">
              <Link to="/ofertas" className="nav-link text-white opacity-75 fw-medium d-flex align-items-center gap-2"><span>📢</span> Minhas Ofertas</Link>
            </li>
          </ul>
        </div>
        <div className="mt-4">
          <button className="btn text-white w-100 text-start p-2 opacity-75 d-flex align-items-center gap-2 border-0" onClick={handleLogout}><span>🚪</span> Sair</button>
        </div>
      </nav>

      <main className="flex-grow-1 p-4" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
        <button onClick={() => navigate(-1)} className="btn btn-link text-muted text-decoration-none mb-3 ps-0 fw-bold">
          ← Voltar
        </button>

        <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '700px' }}>
          
          <div className="d-flex align-items-center justify-content-center mb-3 mx-auto"
            style={{ width: '60px', height: '60px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '1.5rem' }}>✏️</span>
          </div>

          <h2 className="fw-bold text-center text-dark mb-4">Editar Produto</h2>

          {erro && <div className="alert alert-danger rounded-3 border-0 shadow-sm">⚠️ {erro}</div>}
          {sucesso && <div className="alert alert-success rounded-3 border-0 shadow-sm">✓ {sucesso}</div>}

          {carregandoDados ? (
             <div className="text-center py-5">
               <div className="spinner-border text-success" role="status"></div>
             </div>
          ) : (
             <form onSubmit={handleSalvar}>
                
                {/* CONTROLE DE STATUS MELHORADO */}
                <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center shadow-sm" style={{ backgroundColor: ativo ? '#f0fdf4' : '#fee2e2', border: `1px solid ${ativo ? '#bbf7d0' : '#fecaca'}`, transition: 'all 0.3s ease' }}>
                   <div>
                      <h6 className={`fw-bold mb-1 ${ativo ? 'text-success' : 'text-danger'}`}>
                         Status: {ativo ? 'Produto Ativo' : 'Produto Inativo'}
                      </h6>
                      <p className="small text-muted mb-0">
                         {ativo ? 'O produto está visível e pode receber ofertas.' : 'O produto está oculto e não aparecerá para os clientes.'}
                      </p>
                   </div>
                   <div className="form-check form-switch fs-4 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" id="statusSwitch" 
                         checked={ativo} onChange={(e) => setAtivo(e.target.checked)} style={{ cursor: 'pointer' }} />
                   </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Nome do Produto</label>
                    <input type="text" className="form-control bg-light border-0" value={nome} onChange={e => setNome(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Código de Barras (EAN)</label>
                    <input type="text" className="form-control bg-light border-0" value={codigoBarrasEan} onChange={e => setCodigoBarrasEan(e.target.value)} maxLength={13} />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Categoria</label>
                    <select className="form-select bg-light border-0 text-dark" 
                      value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} required>
                      <option value="">Selecione uma Categoria</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Preço Original (Base)</label>
                    <div className="input-group">
                       <span className="input-group-text border-0 bg-light text-muted">R$</span>
                       <input type="number" className="form-control border-0 bg-light" value={precoOriginal} onChange={e => setPrecoOriginal(e.target.value)} required min="0.01" step="0.01" />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Descrição Detalhada</label>
                  <textarea className="form-control bg-light border-0" value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-medium">Imagem do Produto</label>
                  <label className="d-flex flex-column align-items-center justify-content-center rounded-3 p-4 shadow-sm"
                    style={{ border: '2px dashed #d1d5db', cursor: 'pointer', backgroundColor: '#ffffff', transition: 'all 0.3s ease' }}>
                    <input type="file" accept="image/*" onChange={handleImagemChange} style={{ display: 'none' }} disabled={uploadandoImagem} />
                    {uploadandoImagem ? (
                      <span className="text-info fw-medium">⏳ Fazendo upload para a nuvem...</span>
                    ) : imagemUrl ? (
                      <>
                        <img src={imagemUrl} alt="Preview" className="rounded shadow-sm" style={{ maxWidth: '120px', maxHeight: '120px', marginBottom: '15px' }} />
                        <span className="text-success fw-medium">✓ Clique para alterar a imagem</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '2rem', opacity: 0.4, marginBottom: '10px' }}>📷</span>
                        <span className="text-muted small fw-medium">Clique para enviar uma nova imagem</span>
                      </>
                    )}
                  </label>
                </div>

                <button type="submit" disabled={loading || uploadandoImagem} className="btn w-100 fw-bold py-3 text-white mt-2 shadow-sm"
                  style={{ backgroundColor: '#3aad77', borderRadius: '10px', opacity: loading || uploadandoImagem ? 0.65 : 1 }}>
                  {loading ? 'Salvando alterações...' : 'Salvar Alterações'}
                </button>
             </form>
          )}
        </div>
      </main>
    </div>
  );
}