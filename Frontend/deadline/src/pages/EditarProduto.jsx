import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deadline_upload';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';

export default function EditarProduto() {
  const { id } = useParams();

  const [nome, setNome] = useState('');
  const [codigoBarrasEan, setCodigoBarrasEan] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagensUrls, setImagensUrls] = useState([]);
  const [ativo, setAtivo] = useState(true);

  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [uploadandoImagem, setUploadandoImagem] = useState(false);

  const [buscaCategoria, setBuscaCategoria] = useState('');
  const [dropdownCatAberto, setDropdownCatAberto] = useState(false);

  const categoriaObjSelecionada = categorias.find(c => String(c.id) === String(categoriaSelecionada));
  const categoriasFiltradas = categorias.filter(c => c.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));

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
          if (data.foto) {
            let urls = [data.foto];
            if (data.fotosAdicionais && data.fotosAdicionais.length > 0) {
              urls = [...urls, ...data.fotosAdicionais];
            }
            setImagensUrls(urls);
          }
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
    const arquivos = Array.from(e.target.files);
    if (!arquivos || arquivos.length === 0) return;
    
    setUploadandoImagem(true);
    try {
      const novasUrls = await Promise.all(arquivos.map(arquivo => {
        const formData = new FormData();
        formData.append('file', arquivo);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        return fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
          .then(res => res.ok ? res.json() : null)
          .then(data => data ? data.secure_url : null);
      }));
      
      const urlsValidas = novasUrls.filter(url => url !== null);
      if (urlsValidas.length > 0) {
        setImagensUrls(prev => [...prev, ...urlsValidas]);
        setErro(null);
      }
    } catch (err) {
      setErro(`Erro ao processar imagens: ${err.message}`);
    } finally {
      setUploadandoImagem(false);
    }
  };

  const removerImagem = (index) => {
    setImagensUrls(prev => prev.filter((_, i) => i !== index));
  };

  const definirCapa = (index) => {
    if (index === 0) return;
    setImagensUrls(prev => {
      const novaLista = [...prev];
      const imagemSelecionada = novaLista[index];
      novaLista.splice(index, 1); // Remove from current position
      novaLista.unshift(imagemSelecionada); // Add to the beginning
      return novaLista;
    });
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
        foto: imagensUrls.length > 0 ? imagensUrls[0] : null,
        fotosAdicionais: imagensUrls.length > 1 ? imagensUrls.slice(1) : [],
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
    } catch {
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
        <Link to="/produtos" className="btn btn-outline-secondary fw-bold rounded-3"><img src="/icons/voltar.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Voltar</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
        {erro && <div className="alert alert-danger rounded-3 shadow-sm"><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {erro}</div>}
        {sucesso && <div className="alert alert-success rounded-3 shadow-sm"><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {sucesso}</div>}

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
            <div className="col-md-6 position-relative">
              <label className="form-label fw-bold text-muted small">Categoria</label>
              <div 
                className="form-control form-control-lg bg-light border-0 shadow-sm d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => setDropdownCatAberto(!dropdownCatAberto)}
              >
                <span className={categoriaSelecionada ? "text-dark" : "text-muted"}>
                  {categoriaObjSelecionada ? categoriaObjSelecionada.nome : 'Selecione a categoria...'}
                </span>
                <span style={{ fontSize: '12px' }}>▼</span>
              </div>
              
              {dropdownCatAberto && (
                <div className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-lg z-3" style={{ zIndex: 1000 }}>
                  <div className="p-2 border-bottom">
                    <input 
                      type="text" 
                      className="form-control bg-light" 
                      placeholder="🔎 Buscar categoria..." 
                      value={buscaCategoria}
                      onChange={(e) => setBuscaCategoria(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <ul className="list-unstyled mb-0" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {categoriasFiltradas.length === 0 ? (
                      <li className="p-3 text-muted text-center">Nenhuma categoria encontrada.</li>
                    ) : (
                      categoriasFiltradas.map(c => (
                        <li 
                          key={c.id} 
                          className="p-2 px-3 border-bottom"
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                          onClick={() => {
                            setCategoriaSelecionada(c.id);
                            setDropdownCatAberto(false);
                            setBuscaCategoria('');
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div className="fw-bold text-dark">{c.nome}</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
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
            <label className="form-label fw-bold text-muted small">Imagens do Produto</label>
            
            {imagensUrls.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {imagensUrls.map((url, idx) => (
                  <div key={idx} className="position-relative" style={{ width: '100px', height: '100px' }}>
                    <img src={url} alt={`Preview ${idx + 1}`} className={`rounded shadow-sm ${idx === 0 ? 'border border-primary border-3' : 'border'}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => removerImagem(idx)}
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle" 
                      style={{ transform: 'translate(25%, -25%)', padding: '0.1rem 0.4rem', fontSize: '10px', zIndex: 5 }}
                      title="Remover imagem"
                    >
                      X
                    </button>
                    {idx === 0 ? (
                      <span className="position-absolute bottom-0 start-0 bg-primary text-white text-center w-100 fw-bold" style={{fontSize: '10px', padding: '4px 0'}}>CAPA</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => definirCapa(idx)}
                        className="btn btn-sm btn-dark position-absolute bottom-0 start-0 w-100 opacity-75 fw-bold" 
                        style={{ fontSize: '9px', padding: '2px 0', borderRadius: '0 0 0.25rem 0.25rem' }}
                        title="Tornar imagem principal"
                      >
                        TORNAR CAPA
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <label className="d-flex flex-column align-items-center justify-content-center rounded-4 p-4 shadow-sm bg-light" style={{ border: '2px dashed #d1d5db', cursor: 'pointer' }}>
              <input type="file" accept="image/*" multiple onChange={handleImagemChange} style={{ display: 'none' }} disabled={uploadandoImagem} />
              {uploadandoImagem ? (
                <span className="text-info fw-bold">⏳ Enviando...</span>
              ) : (
                <>
                  <span style={{ fontSize: '2rem', opacity: 0.4 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                  <span className="text-muted small fw-bold mt-2">Clique para adicionar fotos</span>
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