import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ListarImpresso.css';

export default function ListarImpresso() {
  const navigate = useNavigate();
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

  // 1. Carregar dados da API ao iniciar
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

  // 2. Lógica de Filtragem Dinâmica
  const resultadosFiltrados = registos.filter(item => {
    const correspondeUnidade = formData.unidade === '' || String(item.unidade_id) === formData.unidade;
    const correspondeTipo = formData.tipo === '' || String(item.tipo_id) === formData.tipo;
    const correspondeData = formData.data === '' || item.data.includes(formData.data);

    return correspondeUnidade && correspondeTipo && correspondeData;
  });

  if (loading) return <div className="page-wrapper" style={{textAlign:'center', padding:'50px'}}><h3>A carregar registos...</h3></div>;

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="logo-section">Logo</div>
        <div className="title-section">SANTA CASA DA MISERICÓRDIA DE ESPOSENDE</div>
        <div className="user-section">
          <span>*Utilizador*</span><br/>
          <button className="logout-btn" onClick={() => navigate("/login")}>
            Terminar Sessão
          </button>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Página Principal</button>
        <button onClick={() => navigate('/inserir-impresso')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Registar Impresso →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content list-page">
        <div className="container-1200">
          
          {/* FILTROS */}
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

          {/* LISTA DE RESULTADOS */}
          <div className="results-container">
            {resultadosFiltrados.length > 0 ? (
              resultadosFiltrados.map((item) => (
                <div key={item.id} className="section-box list-item">
                  <div 
                    className="clickable-header"
                    onClick={() => toggleExpand(item.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', cursor: 'pointer', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>
                      <strong>#{item.id}</strong> | {item.unidade_nome} | {new Date(item.data).toLocaleDateString('pt-PT')}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      {/* BOTÃO EDITAR */}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/editar-impresso/${item.id}`); 
                        }}
                        className="btn-edit-list"
                        style={{ 
                          backgroundColor: '#2196F3', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 15px', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      >
                        EDITAR
                      </button>
                      <span style={{ fontWeight: 'bold' }}>
                        {expandedId === item.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* CONTEÚDO EXPANDIDO */}
                  {expandedId === item.id && (
                    <div className="expanded-content" style={{ padding: '20px', borderTop: '1px solid #ccc', backgroundColor: '#fdfdfd' }}>
                      <p><strong>Tipo de Mensagem:</strong> {item.tipo_nome}</p>
                      <div style={{ marginTop: '15px' }}>
                        <p><strong>Descritivo:</strong></p>
                        <div className="detail-box">
                          {item.descritivo || <i>Sem descrição.</i>}
                        </div>
                        
                        <p style={{ marginTop: '15px' }}><strong>Resolução:</strong></p>
                        <div className="detail-box resolution">
                          {item.resolucao || <i>Pendente de resolução.</i>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-results">Nenhum registo encontrado com os filtros selecionados.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}