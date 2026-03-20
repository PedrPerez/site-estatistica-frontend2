import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ListarQuestionario.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function ListarQuestionarios() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [questionarios, setQuestionarios] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [detalhes, setDetalhes] = useState({});
  const [seccoesAbertas, setSeccoesAbertas] = useState({});
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ unidade: '', data: '' });

  // 1. Carregar lista inicial e unidades para filtros
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
    fetch("http://localhost/API/obterUnidade.php")
      .then(res => res.json())
      .then(data => setUnidades(data))
      .catch(err => console.error("Erro ao carregar unidades:", err));

    fetch("http://localhost/API/listarQuestionario.php")
      .then(res => res.json())
      .then(data => { 
        setQuestionarios(data); 
        setLoading(false); 
      })
      .catch(err => {
        console.error("Erro ao listar questionários:", err);
        setLoading(false);
      });
  }, []);

  const limparFiltros = () => setFormData({ unidade: '', data: '' });

  // 2. Lógica para expandir e carregar detalhes via API
  const toggleExpandQuestionario = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    
    if (!detalhes[id]) {
      try {
        const res = await fetch(`http://localhost/API/obterDetalhe.php?id=${id}`);
        const data = await res.json();
        setDetalhes(prev => ({ ...prev, [id]: data }));
        
        // Inicializa as sub-secções (perguntas) como fechadas
        const inicializarAbertas = {};
        if(data.respostas_agrupadas) {
            data.respostas_agrupadas.forEach(p => { inicializarAbertas[p.id] = false; });
        }
        setSeccoesAbertas(prev => ({ ...prev, [id]: inicializarAbertas }));
      } catch (err) { 
        console.error("Erro ao obter detalhes:", err); 
      }
    }
    setExpandedId(id);
  };

  const togglePergunta = (qId, pId) => {
    setSeccoesAbertas(prev => ({
      ...prev,
      [qId]: { ...prev[qId], [pId]: !prev[qId]?.[pId] }
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  // 3. Filtros em tempo real
  const questionariosFiltrados = questionarios.filter(item => {
    const correspondeUnidade = formData.unidade === '' || 
      (item.nome_unidade?.trim().toLowerCase() === formData.unidade.trim().toLowerCase());
    const correspondeData = formData.data === '' || 
      (item.data?.split(' ')[0] === formData.data);
    return correspondeUnidade && correspondeData;
  });

  if (loading) return <div className="page-wrapper"><h3>A carregar listagem...</h3></div>;

  return (
    <div className="page-wrapper">
      {/* Header e Nav permanecem iguais ao que já tens */}
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
        <button onClick={() => navigate('/principal')} className="nav-link">← Página Principal</button>
        <button onClick={() => navigate('/inserir-questionario')} className="nav-link nav-link-right">Registar Questionário →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content list-page">
        <div className="container-1200">
          
          {/* Bloco de Filtros */}
          <div className="filter-header">
            <span className="filter-title">Filtros:</span>
            <button onClick={limparFiltros} className="clean-filters">Limpar Filtros</button>
          </div>

          <div className="section-box filter-box">
            <div className="row">
              <div className="input-group">
                <label>Unidade:</label>
                <select value={formData.unidade} onChange={(e) => setFormData({...formData, unidade: e.target.value})}>
                  <option value="">Todas as Unidades</option>
                  {unidades.map(u => <option key={u.cod_unidade} value={u.descricao}>{u.descricao}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Data:</label>
                <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Listagem de Resultados */}
          <div className="results-container">
            {questionariosFiltrados.length === 0 ? (
              <p style={{textAlign: 'center', marginTop: '20px'}}>Nenhum questionário encontrado.</p>
            ) : (
              questionariosFiltrados.map((q) => (
                <div key={q.id_questionario} className="section-box">
                  <div className="section-title gray-bg clickable-header" onClick={() => toggleExpandQuestionario(q.id_questionario)}>
                    <div className="row-content">
                      <div className="row-info-text">
                        <strong>ID: {q.id_questionario}</strong><br/>
                        <span>{q.nome_unidade}</span><br/>
                        <small>{new Date(q.data).toLocaleDateString()}</small>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/editar-questionario/${q.id_questionario}`); 
                          }}
                          className="btn-edit-list"
                        >
                          EDITAR
                        </button>
                        <span>{expandedId === q.id_questionario ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo Detalhado */}
                  {expandedId === q.id_questionario && (
                    <div className="question-content" style={{padding: '10px'}}>
                      {detalhes[q.id_questionario]?.respostas_agrupadas?.map((pergunta) => (
                        <div key={pergunta.id} className="question-box" style={{ marginBottom: '15px', border: '1px solid #000' }}>
                          <div className="question-header gray-bg" onClick={() => togglePergunta(q.id_questionario, pergunta.id)} style={{padding: '10px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer'}}>
                            <span style={{fontSize: '0.9rem'}}>{pergunta.titulo}</span>
                            <span>{seccoesAbertas[q.id_questionario]?.[pergunta.id] ? '▲' : '▼'}</span>
                          </div>
                          
                          {seccoesAbertas[q.id_questionario]?.[pergunta.id] && (
                            <div className="table-responsive">
                              <table className="rating-table">
                                <thead>
                                  <tr>
                                    <th className="text-left"></th>
                                    <th>Muito Bom</th><th>Bom</th><th>Aceitável</th><th>Mau</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pergunta.indicadores.map((ind, i) => (
                                    <tr key={i}>
                                      <td className="question-text">{ind.texto}</td>
                                      <td><span className={`radio-circle ${ind.muito_bom == 1 ? 'active' : ''}`}></span></td>
                                      <td><span className={`radio-circle ${ind.bom == 1 ? 'active' : ''}`}></span></td>
                                      <td><span className={`radio-circle ${ind.aceitavel == 1 ? 'active' : ''}`}></span></td>
                                      <td><span className={`radio-circle ${ind.mau == 1 ? 'active' : ''}`}></span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="questionario-title" style={{marginTop: '15px', fontWeight: 'bold'}}>Comentários:</div>
                      <div className="comment-box">
                        {detalhes[q.id_questionario]?.sugestoes || "Sem comentários."}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}