import React, { useState, useEffect } from 'react';
import '../css/ListarQuestionario.css'; 

export default function ListarQuestionarios() {
  const [questionarios, setQuestionarios] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [detalhes, setDetalhes] = useState({});
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    unidade: '',
    data: ''
  });

  useEffect(() => {
    fetch("http://localhost/API/obterUnidade.php")
      .then(res => res.json())
      .then(data => {
        setUnidades(data);
      })
      .catch(err => console.error("Erro ao carregar unidades:", err));
  }, []);

  // Carregar questionários
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost/API/listarQuestionario.php")
      .then(res => res.json())
      .then(data => {
        setQuestionarios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFormData({ unidade: '', data: '' });
  };

  const questionariosFiltrados = questionarios.filter(item => {
    // Filtro de unidade - ignora maiúsculas/minúsculas
    const correspondeUnidade = formData.unidade === '' || 
      (item.nome_unidade && item.nome_unidade.trim().toLowerCase() === formData.unidade.trim().toLowerCase());
    
    // Filtro de data
    let correspondeData = true;
    if (formData.data !== '') {
      const dataItem = item.data ? item.data.split(' ')[0].split('T')[0] : '';
      correspondeData = dataItem === formData.data;
    }
    
    return correspondeUnidade && correspondeData;
  });

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    if (!detalhes[id]) {
      try {
        const res = await fetch(`http://localhost/API/obterDetalhe.php?id=${id}`);
        const data = await res.json();
        setDetalhes(prev => ({ ...prev, [id]: data }));
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      }
    }
    setExpandedId(id);
  };

  return (
    <div className="page-wrapper">
      <div className="container-align">
        
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
          <a href="/inserir-questionario" className="nav-link">Registar Questionário →</a>
        </nav>

        <hr className="divider" />

        <main className="main-content list-page">
          <div className="container-1200">
            
            {/* FILTROS */}
            <div className="filter-header">
              <span className="filter-title">Filtros:</span>
              <button onClick={limparFiltros} className="clean-filters">
                Limpar Filtros
              </button>
            </div>

            <div className="section-box filter-box">
              <div className="row">
                <div className="input-group">
                  <label>Unidade :</label>
                  <select name="unidade" value={formData.unidade} onChange={handleChange}>
                    <option value="">Todas as Unidades</option>
                    {unidades.map(unidade => (
                      <option key={unidade.cod_unidade} value={unidade.descricao}>
                        {unidade.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Data :</label>
                  <input 
                    type="date" 
                    name="data" 
                    value={formData.data} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <h2 className="results-text">
              Questionários Guardados: {questionariosFiltrados.length}
              {questionarios.length > 0 && formData.unidade !== '' && 
                ` (filtrados de ${questionarios.length} total)`}
            </h2>

            <div className="results-container">
              {loading ? (
                <div className="loading-message">A carregar questionários...</div>
              ) : questionariosFiltrados.length > 0 ? (
                questionariosFiltrados.map((q) => (
                  <div key={q.id_questionario}>
                    {/* Cabeçalho da Linha */}
                    <div className="section-box list-row" onClick={() => toggleExpand(q.id_questionario)}>
                      <div className="row-content">
                        <div className="row-text">
                          <strong>ID: {q.id_questionario}</strong> | {q.nome_unidade} | {new Date(q.data).toLocaleDateString()}
                        </div>
                        <div className="row-icon">{expandedId === q.id_questionario ? '▲' : '▼'}</div>
                      </div>
                    </div>

                    {/* Conteúdo Expandido (Detalhes) */}
                    {expandedId === q.id_questionario && detalhes[q.id_questionario] && (
                      <div className="expanded-details">
                        <div className="scale-header">
                          <div className="scale-label">Indicador</div>
                          <div>MB</div><div>B</div><div>A</div><div>M</div>
                        </div>
                        
                        {detalhes[q.id_questionario].respostas && detalhes[q.id_questionario].respostas.map((resp, idx) => (
                          <div className="scale-row" key={idx}>
                            <div className="scale-label">{resp.descricao}</div>
                            <div className="scale-cell">
                              <span className={`radio-circle ${resp.muito_bom ? 'active' : ''}`}></span>
                            </div>
                            <div className="scale-cell">
                              <span className={`radio-circle ${resp.bom ? 'active' : ''}`}></span>
                            </div>
                            <div className="scale-cell">
                              <span className={`radio-circle ${resp.aceitavel ? 'active' : ''}`}></span>
                            </div>
                            <div className="scale-cell">
                              <span className={`radio-circle ${resp.mau ? 'active' : ''}`}></span>
                            </div>
                          </div>
                        ))}

                        <div className="questionario-title">Comentários:</div>
                        <div className="comment-box">
                          {detalhes[q.id_questionario].sugestoes || "Sem comentários."}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-results">
                  Nenhum questionário encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}