import React from "react";
import { Link } from 'react-router-dom';

export default function NovaOferta() {

  export default function CadastroOferta() {
    const [nome, setNome] = useState('');
    const [codigoBarrasEan, setCodigoBarrasEan] = useState('');
    const [idCategoria, setIdCategoria] = useState('');
    const [precoOriginal, setPrecoOriginal] = useState('');
    const [descricao, setDescricao] = useState('');
    const [imagem, setImagem] = useState(null);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState(false);
    const [loading, setLoading] = useState(false);
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Nova Oferta</h1>
      <Link to="/produtos">Voltar</Link>
    </div>
  );
}
}