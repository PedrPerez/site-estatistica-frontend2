import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ListarEmail.css';

export default function ListarEmail() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({ tipo: '', data: '', busca: '' });

  // 1. Carregar dados da API (Emails e Tipos de Mensagem)
  useEffect(() => {
    Promise.all([
      fetch('http://localhost/API/obterEmail.php').then(res => res.json()),
      fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json())
    ]).then(([dataEmails, dataTipos]) => {
      setEmails(dataEmails);
      setTipos(dataTipos);
      setLoading(false);
    }).catch((err) => {
      console.error("Erro ao carregar dados:", err);
      setLoading(false);
    });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFilters({ tipo: '', data: '', busca: '' });
  };

  // 2. Lógica de Filtragem Dinâmica
  const emailsFiltrados = emails.filter(item => {
    const correspondeTipo = filters.tipo === '' || String(item.cod_tipo) === filters.tipo;
    const correspondeData = filters.data === '' || item.data.includes(filters.data);
    const correspondeBusca = filters.busca === '' || 
      (item.nome && item.nome.toLowerCase().includes(filters.busca.toLowerCase())) ||
      (item.assunto && item.assunto.toLowerCase().includes(filters.busca.toLowerCase()));
    
    return correspondeTipo && correspondeData && correspondeBusca;
  });

  if (loading) return (
    <div className="page-wrapper">
      <div className="main-content" style={{textAlign:'center', padding:'50px'}}>
        <h3>A carregar base de dados de emails...</h3>
      </div>
    </div>
  );

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
        <button onClick={() => navigate('/')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Página Principal</button>
        <button onClick={() => navigate('/inserir-email')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Registar Email →</button>
      </nav>

      <hr className="divider" />

      <div className="main-content list-page">
        <div className="container-1200">
          
          {/* SECÇÃO DE FILTROS */}
          <div className="filter-header">
            <span className="filter-title">Filtros de Pesquisa:</span>
            <button className="clean-filters" onClick={limparFiltros}>
              Limpar Filtros
            </button>
          </div>

          <section className="section-box filter-box">
            <div className="row">
              <div className="input-group">
                <label>Tipo de Mensagem:</label>
                <select name="tipo" className="filter-select" value={filters.tipo} onChange={handleFilterChange}>
                  <option value="">Todos os Tipos</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Data de Registo:</label>
                <input type="date" name="data" className="filter-input" value={filters.data} onChange={handleFilterChange} />
              </div>
              <div className="input-group grow">
                <label>Pesquisa Geral:</label>
                <input 
                  type="text" 
                  name="busca" 
                  placeholder="Nome do remetente ou assunto..." 
                  className="filter-input" 
                  value={filters.busca} 
                  onChange={handleFilterChange} 
                />
              </div>
            </div>
          </section>

          <h2 className="results-text">Resultados encontrados: {emailsFiltrados.length}</h2>

          {/* LISTAGEM DE RESULTADOS */}
          <div className="results-container">
            {emailsFiltrados.length > 0 ? (
              emailsFiltrados.map((item) => (
                <div key={item.id_email} className="list-item-wrapper">
                  {/* CABEÇALHO DA LINHA (CLICÁVEL) */}
                  <div 
                    className="section-box list-row" 
                    onClick={() => setExpandedId(expandedId === item.id_email ? null : item.id_email)}
                  >
                    <div className="row-content">
                      <span className="row-text">
                        <strong>#{item.id_email}</strong> | {item.nome || 'Sem Nome'} | <span className="text-muted">{item.assunto}</span>
                      </span>
                      
                      <div className="action-group">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); // Impede que a linha abra/feche ao clicar em editar
                            navigate(`/editar-email/${item.id_email}`); 
                          }}
                          className="btn-edit-small"
                        >
                          EDITAR
                        </button>
                        <span className="row-icon">{expandedId === item.id_email ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CONTEÚDO DETALHADO (EXPANDIDO) */}
                  {expandedId === item.id_email && (
                    <div className="expanded-details">
                      <div className="details-grid">
                        <p><strong>Remetente:</strong> {item.email}</p>
                        <p><strong>Data:</strong> {new Date(item.data).toLocaleDateString('pt-PT')}</p>
                        <p><strong>Categoria:</strong> {item.tipo_descricao || 'Não definida'}</p>
                      </div>
                      
                      <hr className="inner-divider" />
                      
                      <p className="content-label"><strong>Conteúdo da Mensagem:</strong></p>
                      <div className="detail-box-email">
                        {item.conteudo || <i>Este email não possui conteúdo registado.</i>}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results-box">
                <p>Nenhum registo corresponde aos critérios de pesquisa selecionados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}