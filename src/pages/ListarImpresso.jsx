import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

/**
 * Componente ListarImpresso
 * 
 * Lista todos os impressos com filtros dinâmicos e expansão de detalhes.
 * 
 * Funcionalidades:
 * - Carregamento múltiplo (Promise.all) de dados (Registos, Unidades, Tipos).
 * - Filtros combináveis: Unidade, Data e Tipo de Mensagem.
 * - Visualização expandida (acordeão) para detalhes (Descritivo/Resolução).
 * - Navegação direta para edição de um registo específico.
 * 
 * @component
 */
export default function ListarImpresso() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
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

  useEffect(() => {
    // Carregamento paralelo para minimizar o tempo de carregamento inicial
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
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

  /**
   * Filtragem em memória dos registos baseada no estado 'formData'.
   */
  const resultadosFiltrados = registos.filter(item => {
    const correspondeUnidade = formData.unidade === '' || String(item.unidade_id) === formData.unidade;
    const correspondeTipo = formData.tipo === '' || String(item.tipo_id) === formData.tipo;
    const correspondeData = formData.data === '' || item.data.includes(formData.data);

    return correspondeUnidade && correspondeTipo && correspondeData;
  });

  if (loading) return <div className="page-wrapper" style={{textAlign:'center', padding:'50px'}}><h3>A carregar registos...</h3></div>;

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

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
        <button onClick={() => navigate('/inserir-impresso')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Registar Impresso →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content list-page">
        <div className="container-1200">

          <div className="filter-header">
            <span className="filter-title">Filtros:</span>
            <button onClick={limparFiltros} className="clean-filters">Limpar Filtros</button>
          </div>

          <section className="section-box filter-box">
            <div className="row">
              <div className="input-group grow">
                <label>Unidade:</label>
                <select name="unidade" value={formData.unidade} onChange={handleChange}>
                  <option value="">Todas as Unidades</option>
                  {unidades.map(u => (
                    <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="input-group grow">
                <label>Data:</label>
                <input type="date" name="data" value={formData.data} onChange={handleChange} />
              </div>
              
              <div className="input-group grow">
                <label>Tipo:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="">Todos os Tipos</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.descricao}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <h2 className="results-count">
            Total de Resultados: {resultadosFiltrados.length}
          </h2>

          <div className="results-container">
            {resultadosFiltrados.length > 0 ? (
              resultadosFiltrados.map((item) => (
                <div key={item.id} className="section-box">
                  {/* CABEÇALHO COM A MESMA ESTÉTICA DO PRIMEIRO */}
                  <div className="cabecalho-questionario-branco" onClick={() => toggleExpand(item.id)}>
                    <div className="row-content">
                      <div className="row-info-text">
                        <strong>ID: {item.id}</strong>
                        <span>{item.unidade_nome}</span>
                        <small>{new Date(item.data).toLocaleDateString('pt-PT')}</small>
                      </div>
                      
                      <div className="row-actions">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/editar-impresso/${item.id}`); 
                          }} 
                          className="btn-edit-list"
                        >
                          EDITAR
                        </button>
                        <span className="toggle-icon">
                          {expandedId === item.id ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CONTEÚDO EXPANDIDO */}
                  {expandedId === item.id && (
                    <div className="question-content expanded">
                      <div className="comentarios-section">
                        <p><strong>Tipo de Mensagem:</strong> {item.tipo_nome}</p>
                        
                        <div className="comentarios-titulo" style={{ marginTop: '15px' }}>Descritivo:</div>
                        <div className="comment-box">
                          {item.descritivo || "Sem descrição."}
                        </div>
                        
                        <div className="comentarios-titulo" style={{ marginTop: '15px' }}>Resolução:</div>
                        <div className="comment-box">
                          {item.resolucao || "Pendente de resolução."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{textAlign: 'center', marginTop: '20px'}}>Nenhum registo encontrado.</p>
            )}
          </div>
        </div>
      </main>
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