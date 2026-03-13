import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ListarQuestionario.css';
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
      <header className="login-header">
        <img src={logo} alt="Hospital de Esposende Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>
              Terminar Sessão
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Pagina Principal</button>
        <button onClick={() => navigate('/inserir-questionario')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Registar Questionário →</button>
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
              <div className="input-group grow">
                <label>Unidade:</label>
                <select value={formData.unidade} onChange={(e) => setFormData({...formData, unidade: e.target.value})}>
                  <option value="">Todas as Unidades</option>
                  {unidades.map(u => <option key={u.cod_unidade} value={u.descricao}>{u.descricao}</option>)}
                </select>
              </div>
              <div className="input-group grow">
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
                    <div className="row-content" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>ID: {q.id_questionario} | {q.nome_unidade} | {new Date(q.data).toLocaleDateString()}</span>
                      
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* BOTÃO EDITAR: Navega para a página de edição */}
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); // Impede que o acordeão feche ao clicar no botão
                            navigate(`/editar-questionario/${q.id_questionario}`); 
                          }}
                          className="btn-edit-list"
                          style={{ 
                            backgroundColor: '#2196F3', 
                            color: 'white', 
                            border: 'none', 
                            padding: '5px 15px', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          EDITAR
                        </button>
                        <span>{expandedId === q.id_questionario ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo Detalhado (Acordeão Principal) */}
                  {expandedId === q.id_questionario && (
                    <div className="question-content">
                      {detalhes[q.id_questionario]?.respostas_agrupadas?.map((pergunta) => (
                        <div key={pergunta.id} className="question-box" style={{ marginBottom: '10px' }}>
                          <div className="question-header gray-bg" onClick={() => togglePergunta(q.id_questionario, pergunta.id)}>
                            <span>{pergunta.titulo}</span>
                            <span>{seccoesAbertas[q.id_questionario]?.[pergunta.id] ? '▲' : '▼'}</span>
                          </div>
                          
                          <div style={{ display: seccoesAbertas[q.id_questionario]?.[pergunta.id] ? 'block' : 'none', padding: '15px' }}>
                            <table className="rating-table">
                              <thead>
                                <tr>
                                  <th className="text-left">Indicador</th>
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
                        </div>
                      ))}
                      
                      <div className="questionario-title" style={{marginTop: '20px', fontWeight: 'bold'}}>Comentários:</div>
                      <div className="comment-box" style={{padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '5px'}}>
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