import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ListarEmail.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

/**
 * Componente ListarEmail
 * 
 * Painel de consulta de e-mails com filtragem em tempo real e 
 * visualização detalhada em formato de acordeão.
 * 
 * Funcionalidades:
 * - Carregamento Assíncrono Paralelo: Utiliza `Promise.all` para otimizar o tempo de espera.
 * - Filtragem Client-Side: Realizada através de computed property (`emailsFiltrados`) 
 *   baseada em estado.
 * - Gestão de Estado de UI: Controla o estado de expansão de cada item (`expandedId`) 
 *   individualmente.
 * 
 * @component
 */
export default function ListarEmail() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [emails, setEmails] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({ tipo: '', data: '', busca: '' });

  // 1. Carregar dados da API (Emails e Tipos de Mensagem)
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
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

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  // A lógica de filtragem é eficiente, mas para volumes de dados > 500 registos,
  // considerar debouncing na pesquisa geral.
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
      <header className="login-header">
        <img src={logo} alt="Hospital de Esposende Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Página Principal</button>
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
                <div key={item.id_email} className="section-box">
                  {/* CABEÇALHO DA LINHA (ESTILO QUESTIONÁRIO) */}
                  <div 
                    className="cabecalho-questionario-branco" 
                    onClick={() => setExpandedId(expandedId === item.id_email ? null : item.id_email)}
                  >
                    <div className="row-content">
                      <div className="row-info-text">
                        <strong>ID: {item.id_email}</strong>
                        <span>{item.nome || 'Sem Nome'}</span>
                        <small>{item.assunto}</small>
                      </div>
                      
                      <div className="row-actions">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/editar-email/${item.id_email}`); 
                          }} 
                          className="btn-edit-list"
                        >
                          EDITAR
                        </button>
                        <span className="toggle-icon">
                          {expandedId === item.id_email ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CONTEÚDO EXPANDIDO (ESTILO QUESTIONÁRIO) */}
                  {expandedId === item.id_email && (
                    <div className="question-content expanded">
                      <div className="comentarios-section">
                        <div className="details-grid-email">
                          <p><strong>Remetente:</strong> {item.email}</p>
                          <p><strong>Data:</strong> {new Date(item.data).toLocaleDateString('pt-PT')}</p>
                          <p><strong>Categoria:</strong> {item.tipo_descricao || 'Não definida'}</p>
                        </div>
                        
                        <div className="comentarios-titulo" style={{ marginTop: '15px' }}>Conteúdo da Mensagem:</div>
                        <div className="comment-box">
                          {item.conteudo || <i>Este email não possui conteúdo registado.</i>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results-box">
                <p style={{textAlign: 'center', padding: '40px', color: '#666'}}>Nenhum registo encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="footer-minimal">
        <div className="footer-content">
          <div className="footer-info">
            <span className="hospital-name">Hospital de Esposende Valentim Ribeiro</span>
          </div>
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} — Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}