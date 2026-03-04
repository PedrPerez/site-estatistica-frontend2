import React, { useState, useEffect } from 'react';
import '../css/ListarEmail.css'; // Usa o mesmo CSS que me enviaste

export default function ListarEmail() {
  const [emails, setEmails] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({ tipo: '', data: '', busca: '' });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost/API/obterEmail.php').then(res => res.json()),
      fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json())
    ]).then(([dataEmails, dataTipos]) => {
      setEmails(dataEmails);
      setTipos(dataTipos);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const emailsFiltrados = emails.filter(item => {
    const correspondeTipo = filters.tipo === '' || String(item.cod_tipo) === filters.tipo;
    const correspondeData = filters.data === '' || item.data.includes(filters.data);
    const correspondeBusca = filters.busca === '' || 
      item.nome.toLowerCase().includes(filters.busca.toLowerCase()) ||
      item.assunto.toLowerCase().includes(filters.busca.toLowerCase());
    return correspondeTipo && correspondeData && correspondeBusca;
  });

  if (loading) return <div className="page-wrapper"><div className="main-content">A carregar...</div></div>;

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="logo-section">Logo</div>
        <div className="title-section">SANTA CASA DA MISERICÓRDIA DE ESPOSENDE</div>
        <div className="user-section">
          <span>*Utilizador*</span><br/>
          <button className="logout-btn">Terminar Sessão</button>
        </div>
      </header>

      <nav className="nav-links">
        <a href="/" className="nav-link">← Pagina Principal</a>
        <a href="/inserir-email" className="nav-link">Inserir Email →</a>
      </nav>

      <hr className="divider" />

      <div className="main-content list-page">
        <div className="container-1200">
          
          {/* FILTROS */}
          <div className="filter-header">
            <span className="filter-title">Filtros:</span>
            <button className="clean-filters" onClick={() => setFilters({tipo:'', data:'', busca:''})}>
              Limpar Filtros
            </button>
          </div>

          <section className="section-box filter-box">
            <div className="row">
              <div className="input-group">
                <label>Tipo:</label>
                <select name="tipo" className="filter-select" value={filters.tipo} onChange={handleFilterChange}>
                  <option value="">-</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Data:</label>
                <input type="date" name="data" className="filter-input" value={filters.data} onChange={handleFilterChange} />
              </div>
              <div className="input-group grow">
                <label>Busca:</label>
                <input type="text" name="busca" placeholder="Nome ou Assunto" className="filter-input" style={{width: '100%'}} value={filters.busca} onChange={handleFilterChange} />
              </div>
            </div>
          </section>

          <h2 className="results-text">Total de Resultados: {emailsFiltrados.length}</h2>

          {/* LISTA */}
          <div className="results-container">
            {emailsFiltrados.map((item) => (
              <div key={item.id_email}>
                <div className="section-box list-row" onClick={() => setExpandedId(expandedId === item.id_email ? null : item.id_email)}>
                  <div className="row-content">
                    <span className="row-text">
                      #{item.id_email} | {item.nome} | {item.assunto}
                    </span>
                    <span className="row-icon">{expandedId === item.id_email ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === item.id_email && (
                  <div className="expanded-details">
                    <p><strong>Remetente:</strong> {item.email}</p>
                    <p><strong>Tipo:</strong> {item.tipo_descricao}</p>
                    <p><strong>Data:</strong> {new Date(item.data).toLocaleDateString('pt-PT')}</p>
                    <hr style={{margin: '15px 0', border: '0.5px solid #000'}} />
                    <p><strong>Conteúdo:</strong></p>
                    <div style={{marginTop: '10px', whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px'}}>
                      {item.conteudo}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
