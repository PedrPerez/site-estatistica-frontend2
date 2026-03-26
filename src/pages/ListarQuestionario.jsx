import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ListarQuestionario.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function ListarQuestionarios() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [questionarios, setQuestionarios] = useState([]);
  const [expandedIds, setExpandedIds] = useState({}); 
  const [detalhes, setDetalhes] = useState({});
  const [seccoesAbertas, setSeccoesAbertas] = useState({});
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({ unidade: '', data: '' });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    
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

  const carregarDetalhes = async (id) => {
    if (!detalhes[id]) {
      try {
        const res = await fetch(`http://localhost/API/obterDetalhe.php?id=${id}`);
        const data = await res.json();
        setDetalhes(prev => ({ ...prev, [id]: data }));
        
        const inicializarAbertas = {};
        if(data.respostas_agrupadas) {
            data.respostas_agrupadas.forEach(p => { inicializarAbertas[p.id] = false; });
        }
        setSeccoesAbertas(prev => ({ ...prev, [id]: inicializarAbertas }));
      } catch (err) { 
        console.error("Erro ao obter detalhes:", err); 
      }
    }
  };

  const toggleExpandQuestionario = async (id) => {
    await carregarDetalhes(id);
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePergunta = (qId, pId) => {
    setSeccoesAbertas(prev => ({
      ...prev,
      [qId]: { ...prev[qId], [pId]: !prev[qId]?.[pId] }
    }));
  };

  const toggleTodosQuestionarios = async () => {
    const algumAberto = Object.values(expandedIds).some(v => v === true);
    if (algumAberto) {
      setExpandedIds({});
    } else {
      const novoEstado = {};
      for (const q of questionariosFiltrados) {
        novoEstado[q.id_questionario] = true;
        await carregarDetalhes(q.id_questionario);
      }
      setExpandedIds(novoEstado);
    }
  };

  const toggleTodasQuestoesInternas = (qId) => {
    const perguntas = detalhes[qId]?.respostas_agrupadas;
    if (!perguntas) return;
    const algumaPerguntaAberta = Object.values(seccoesAbertas[qId] || {}).some(v => v === true);
    const novoEstadoQuestoes = {};
    perguntas.forEach(p => { novoEstadoQuestoes[p.id] = !algumaPerguntaAberta; });
    setSeccoesAbertas(prev => ({ ...prev, [qId]: novoEstadoQuestoes }));
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  const questionariosFiltrados = questionarios.filter(item => {
    const correspondeUnidade = formData.unidade === '' || 
      (item.nome_unidade?.trim().toLowerCase() === formData.unidade.trim().toLowerCase());
    const correspondeData = formData.data === '' || 
      (item.data?.split(' ')[0] === formData.data);
    return correspondeUnidade && correspondeData;
  });

  const IndicadoresMobile = ({ indicadores }) => (
    <div className="indicadores-mobile-visualizacao">
      {indicadores.map((ind, idx) => (
        <div key={idx} className="indicador-card-visualizacao">
          <div className="indicador-texto-visualizacao">{ind.texto}</div>
          <div className="rating-grid-visualizacao">
            {['muito_bom', 'bom', 'aceitavel', 'mau'].map(nivel => (
              <div key={nivel} className={`rating-option-visualizacao ${ind[nivel] === 1 ? 'selected' : ''}`}>
                <span className="rating-label-visualizacao">{nivel.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const IndicadoresDesktop = ({ indicadores }) => (
    <div className="table-responsive">
      <table className="rating-table">
        <thead>
          <tr>
            <th className="text-left"></th>
            <th>Muito Bom</th><th>Bom</th><th>Aceitável</th><th>Mau</th>
          </tr>
        </thead>
        <tbody>
          {indicadores.map((ind, i) => (
            <tr key={i}>
              <td className="question-text">{ind.texto}</td>
              <td><span className={`radio-circle ${ind.muito_bom === 1 ? 'active' : ''}`}></span></td>
              <td><span className={`radio-circle ${ind.bom === 1 ? 'active' : ''}`}></span></td>
              <td><span className={`radio-circle ${ind.aceitavel === 1 ? 'active' : ''}`}></span></td>
              <td><span className={`radio-circle ${ind.mau === 1 ? 'active' : ''}`}></span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="page-wrapper"><h3>A carregar listagem...</h3></div>;

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Hospital Logo" className="hospital-logo" />
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

          <div className="action-bar-top">
             <button 
                className={`btn-toggle-main ${Object.values(expandedIds).some(v => v === true) ? 'active' : ''}`} 
                onClick={toggleTodosQuestionarios}
             >
                {Object.values(expandedIds).some(v => v === true) ? 'RECOLHER TODOS OS QUESTIONÁRIOS' : 'EXPANDIR TODOS OS QUESTIONÁRIOS'}
             </button>
          </div>

          <div className="results-container">
            {questionariosFiltrados.length === 0 ? (
              <p style={{textAlign: 'center', marginTop: '20px'}}>Nenhum questionário encontrado.</p>
            ) : (
              questionariosFiltrados.map((q) => (
                <div key={q.id_questionario} className="section-box">
                  <div className="section-title gray-bg clickable-header" onClick={() => toggleExpandQuestionario(q.id_questionario)}>
                    <div className="row-content">
                      <div className="row-info-text">
                        <strong>ID: {q.id_questionario}</strong>
                        <span>{q.nome_unidade}</span>
                        <small>{new Date(q.data).toLocaleDateString()}</small>
                      </div>
                      <div className="row-actions">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/editar-questionario/${q.id_questionario}`); }} className="btn-edit-list">EDITAR</button>
                        <span className="toggle-icon">{expandedIds[q.id_questionario] ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {expandedIds[q.id_questionario] && (
                    <div className="question-content expanded">
                      <div className="expand-questions-row">
                        <button className="btn-text-action" onClick={() => toggleTodasQuestoesInternas(q.id_questionario)}>
                          {Object.values(seccoesAbertas[q.id_questionario] || {}).some(v => v === true) ? '- Recolher todas as questões' : '+ Abrir todas as questões'}
                        </button>
                      </div>

                      {detalhes[q.id_questionario]?.respostas_agrupadas?.map((pergunta) => (
                        <div key={pergunta.id} className="question-box">
                          <div className="question-header gray-bg clickable-header" onClick={() => togglePergunta(q.id_questionario, pergunta.id)}>
                            <span className="question-title">{pergunta.titulo}</span>
                            <span className="toggle-icon">{seccoesAbertas[q.id_questionario]?.[pergunta.id] ? '▲' : '▼'}</span>
                          </div>
                          {seccoesAbertas[q.id_questionario]?.[pergunta.id] && (
                            isMobile ? <IndicadoresMobile indicadores={pergunta.indicadores} /> : <IndicadoresDesktop indicadores={pergunta.indicadores} />
                          )}
                        </div>
                      ))}
                      <div className="comentarios-section">
                        <div className="comentarios-titulo">Comentários:</div>
                        <div className="comment-box">{detalhes[q.id_questionario]?.sugestoes || "Sem comentários."}</div>
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