import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deadline_upload';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';

// Componente reutilizável: ícone de ajuda com tooltip
function IconeAjuda({ texto }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <span
      className="position-relative d-inline-flex align-items-center ms-1"
      onMouseEnter={() => setVisivel(true)}
      onMouseLeave={() => setVisivel(false)}
      onFocus={() => setVisivel(true)}
      onBlur={() => setVisivel(false)}
      tabIndex={0}
      role="button"
      aria-label="Ajuda"
      style={{ cursor: 'help' }}
    >
      <span
        className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
        style={{
          width: '16px',
          height: '16px',
          fontSize: '11px',
          backgroundColor: '#d1d5db',
          color: '#4b5563',
          lineHeight: 1,
        }}
      >
        ?
      </span>

      {visivel && (
        <span
          className="position-absolute bg-dark text-white rounded-3 shadow-sm p-2"
          style={{
            bottom: '135%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '220px',
            fontSize: '12px',
            fontWeight: 400,
            zIndex: 20,
            whiteSpace: 'normal',
            lineHeight: 1.4,
          }}
        >
          {texto}
          <span
            className="position-absolute"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#212529 transparent transparent transparent',
            }}
          />
        </span>
      )}
    </span>
  );
}

// Label + ícone de ajuda juntos
function LabelComAjuda({ texto, ajuda }) {
  return (
    <label className="form-label fw-bold text-muted small d-flex align-items-center">
      {texto}
      <IconeAjuda texto={ajuda} />
    </label>
  );
}

export default function CadastroProduto() {
  const [nome, setNome] = useState('');
  const [codigoBarrasEan, setCodigoBarrasEan] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagensUrls, setImagensUrls] = useState([]);
  
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadandoImagem, setUploadandoImagem] = useState(false);

  const [buscaCategoria, setBuscaCategoria] = useState('');
  const [dropdownCatAberto, setDropdownCatAberto] = useState(false);

  const navigate = useNavigate();

  const categoriaObjSelecionada = categorias.find(c => String(c.id) === String(categoriaSelecionada));
  const categoriasFiltradas = categorias.filter(c => c.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));

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
    const arquivos = Array.from(e.target.files);
    if (!arquivos || arquivos.length === 0) return;
    
    setUploadandoImagem(true);
    try {
      const novasUrls = await Promise.all(arquivos.map(arquivo => uploadarImagemCloudinary(arquivo)));
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
        foto: imagensUrls.length > 0 ? imagensUrls[0] : null,
        fotosAdicionais: imagensUrls.length > 1 ? imagensUrls.slice(1) : [],
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
        <Link to="/produtos" className="btn btn-outline-secondary fw-bold rounded-3"><img src="/icons/voltar.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Voltar</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
        
        {erro && <div className="alert alert-danger rounded-3 shadow-sm"><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {erro}</div>}
        {sucesso && <div className="alert alert-success rounded-3 shadow-sm"><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> Produto cadastrado com sucesso!</div>}

        <form onSubmit={handleCadastrar}>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <LabelComAjuda
                texto="Nome do Produto"
                ajuda="Use o nome exatamente como aparece na embalagem, incluindo marca e variação (ex: sabor, tamanho)."
              />
              <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm" placeholder="Ex: Leite Integral" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <LabelComAjuda
                texto="Código de barras (EAN)"
                ajuda="Código numérico de até 13 dígitos que fica sob o código de barras da embalagem. Campo opcional, mas ajuda a evitar produtos duplicados no catálogo."
              />
              <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm" placeholder="Opcional" value={codigoBarrasEan} onChange={e => setCodigoBarrasEan(e.target.value)} maxLength={13} />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6 position-relative">
              <LabelComAjuda
                texto="Categoria"
                ajuda="Escolha o grupo que melhor representa o produto. Isso define onde ele aparece nos filtros de busca dos clientes."
              />
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
              <LabelComAjuda
                texto="Preço Base (R$)"
                ajuda="Preço ORIGINAL do produto, sem desconto. É a partir dele que o percentual de desconto da oferta será calculado depois, na tela de ofertas."
              />
              <input type="number" className="form-control form-control-lg bg-light border-0 shadow-sm fw-bold text-success" placeholder="0.00" value={precoOriginal} onChange={e => setPrecoOriginal(e.target.value)} required min="0.01" step="0.01" />
            </div>
          </div>

          <div className="mb-4">
            <LabelComAjuda
              texto="Descrição Detalhada"
              ajuda="Informações complementares que ajudam o cliente a decidir a compra: composição, peso, validade média ou modo de conservação."
            />
            <textarea className="form-control bg-light border-0 shadow-sm" placeholder="Detalhes do produto..." value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} />
          </div>

          <div className="mb-4">
            <LabelComAjuda
              texto="Imagens do Produto"
              ajuda="Envie fotos reais do produto. A primeira foto será a principal (capa). Formatos aceitos: JPG e PNG. Você pode enviar várias fotos de uma vez."
            />
            
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

            <label className="d-flex flex-column align-items-center justify-content-center rounded-4 p-4 shadow-sm bg-light" style={{ border: '2px dashed #d1d5db', cursor: 'pointer', transition: 'all 0.3s' }}>
              <input type="file" accept="image/*" multiple onChange={handleImagemChange} style={{ display: 'none' }} disabled={uploadandoImagem} />
              {uploadandoImagem ? (
                <span className="text-info fw-bold">⏳ Enviando...</span>
              ) : (
                <>
                  <span style={{ fontSize: '2rem', opacity: 0.4 }}><img src="/icons/pacote.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /></span>
                  <span className="text-muted small fw-bold mt-2">Clique para enviar fotos</span>
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
