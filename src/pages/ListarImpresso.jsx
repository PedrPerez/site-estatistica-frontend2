import React, { useState, useEffect } from 'react';
import '../css/ListarImpresso.css';

export default function ListarImpresso() {
  const [registos, setRegistos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    unidade: '',
    data: '',
    tipo: ''
  });

  const [expandedId, setExpandedId] = useState(null);

  // Carregar dados da API
  useEffect(() => {
    Promise.all([
      fetch('http://localhost/API/obterImpresso.php').then(res => res.json()),
      fetch('http://localhost/API/obterUnidade.php').then(res => res.json()),
      fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json())
    ]).then(([dataRegistos, dataUnidades, dataTipos]) => {
      setRegistos(dataRegistos);
      setUnidades(dataUnidades);
      setTipos(dataTipos);
      setLoading(false);
    }).catch(err => {
      console.error("Erro ao carregar dados:", err);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFormData({ unidade: '', data: '', tipo: '' });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Lógica de Filtragem Dinâmica
  const resultadosFiltrados = registos.filter(item => {
    const correspondeUnidade = formData.unidade === '' || String(item.unidade_id) === formData.unidade;
    const correspondeTipo = formData.tipo === '' || String(item.tipo_id) === formData.tipo;
    // Ajuste de data para comparar YYYY-MM-DD
    const correspondeData = formData.data === '' || item.data.includes(formData.data);

    return correspondeUnidade && correspondeTipo && correspondeData;
  });

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>A carregar registos...</div>;

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="logo-section">Logo</div>
        <div className="title-section">SANTA CASA DA MISERICÓRDIA DE ESPOSENDE</div>
        <div className="user-section">
          <span>*Utilizador*</span>
          <button className="logout-btn">Terminar Sessão</button>
        </div>
      </header>

      <nav className="nav-links">
        <a href="/" className="nav-link">← Pagina Principal</a>
        <a href="/inserir" className="nav-link">Inserir Impresso →</a>
      </nav>

      <hr className="divider" />

      <div className="main-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '95%', maxWidth: '1200px' }}>

          {/* FILTROS DINÂMICOS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5px' }}>
            <span style={{ fontSize: '1.8rem' }}>Filtros:</span>
            <button onClick={limparFiltros} className="logout-btn" style={{ textDecoration: 'underline' }}>
              Limpar Filtros
            </button>
          </div>

          <section className="section-box" style={{ padding: '10px', marginBottom: '20px' }}>
            <div className="row">
              <div className="input-group">
                <label>Unidade :</label>
                <select name="unidade" value={formData.unidade} onChange={handleChange}>
                  <option value="">Todas as Unidades</option>
                  {unidades.map(u => (
                    <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Data:</label>
                <input type="date" name="data" value={formData.data} onChange={handleChange} />
              </div>
            </div>

            <div className="row" style={{ paddingTop: 0 }}>
              <div className="input-group">
                <label>Tipo :</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="">Todos os Tipos</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.descricao}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 'normal', marginBottom: '20px' }}>
            Total de Resultados: {resultadosFiltrados.length}
          </h2>

          {/* LISTA DE RESULTADOS REAIS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {resultadosFiltrados.length > 0 ? (
              resultadosFiltrados.map((item) => (
                <div key={item.id} className="section-box">
                  <div 
                    onClick={() => toggleExpand(item.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', fontSize: '1.6rem', cursor: 'pointer' }}
                  >
                    <span>
                      <strong>#{item.id}</strong> | Unidade: {item.unidade_nome} | Data: {new Date(item.data).toLocaleDateString('pt-PT')}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>
                      {expandedId === item.id ? '▲' : '▼'}
                    </span>
                  </div>

                  {expandedId === item.id && (
                    <div style={{ padding: '20px', borderTop: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
                      <p><strong>Tipo de Mensagem:</strong> {item.tipo_nome}</p>
                      <div style={{ marginTop: '15px' }}>
                        <p><strong>Descritivo:</strong></p>
                        <div style={{ border: '1px solid #999', padding: '15px', minHeight: '80px', marginTop: '5px', backgroundColor: '#fff' }}>
                          {item.descritivo || <i>Sem descrição.</i>}
                        </div>
                        <p style={{ marginTop: '15px' }}><strong>Resolução:</strong></p>
                        <div style={{ border: '1px solid #999', padding: '15px', minHeight: '80px', marginTop: '5px', backgroundColor: '#fff' }}>
                          {item.resolucao || <i>Pendente de resolução.</i>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '20px' }}>
                Nenhum registo encontrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}