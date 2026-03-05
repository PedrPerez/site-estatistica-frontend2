import React, { useState, useEffect } from 'react';
import '../css/ListarQuestionario.css'; 

export default function ListarQuestionarios() {
  const [questionarios, setQuestionarios] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [detalhes, setDetalhes] = useState({});
  const [seccoesAbertas, setSeccoesAbertas] = useState({});
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ unidade: '', data: '' });

  useEffect(() => {
    fetch("http://localhost/API/obterUnidade.php").then(res => res.json()).then(data => setUnidades(data));
    fetch("http://localhost/API/listarQuestionario.php")
      .then(res => res.json())
      .then(data => { setQuestionarios(data); setLoading(false); });
  }, []);

  const limparFiltros = () => setFormData({ unidade: '', data: '' });

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
        
        // Ao abrir, as perguntas começam fechadas para tu escolheres qual abrir
        const inicializarAbertas = {};
        data.respostas_agrupadas.forEach(p => { inicializarAbertas[p.id] = false; });
        setSeccoesAbertas(prev => ({ ...prev, [id]: inicializarAbertas }));
      } catch (err) { console.error(err); }
    }
    setExpandedId(id);
  };

  const togglePergunta = (qId, pId) => {
    setSeccoesAbertas(prev => ({
      ...prev,
      [qId]: { ...prev[qId], [pId]: !prev[qId]?.[pId] }
    }));
  };

  const questionariosFiltrados = questionarios.filter(item => {
    const correspondeUnidade = formData.unidade === '' || (item.nome_unidade?.trim().toLowerCase() === formData.unidade.trim().toLowerCase());
    const correspondeData = formData.data === '' || (item.data?.split(' ')[0] === formData.data);
    return correspondeUnidade && correspondeData;
  });

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
        <a href="/" className="nav-link">← Página Principal</a>
        <a href="/inserir-questionario" className="nav-link">Registar Questionário →</a>
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

          <div className="results-container">
            {questionariosFiltrados.map((q) => (
              <div key={q.id_questionario} className="section-box">
                <div className="section-title gray-bg clickable-header" onClick={() => toggleExpandQuestionario(q.id_questionario)}>
                  <div className="row-content">
                    <span>ID: {q.id_questionario} | {q.nome_unidade} | {new Date(q.data).toLocaleDateString()}</span>
                    <span>{expandedId === q.id_questionario ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Conteúdo do Questionário */}
                <div style={{ display: expandedId === q.id_questionario ? 'block' : 'none' }} className="question-content">
                  
                  {detalhes[q.id_questionario]?.respostas_agrupadas?.map((pergunta) => (
                    <div key={pergunta.id} className="question-box" style={{ marginBottom: '10px' }}>
                      <div className="question-header gray-bg" onClick={() => togglePergunta(q.id_questionario, pergunta.id)}>
                        <span>{pergunta.titulo}</span>
                        <span>{seccoesAbertas[q.id_questionario]?.[pergunta.id] ? '▲' : '▼'}</span>
                      </div>
                      
                      {/* CORREÇÃO AQUI: display none/block controlado pelo estado */}
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
                  
                  <div className="questionario-title">Comentários:</div>
                  <div className="comment-box">{detalhes[q.id_questionario]?.sugestoes || "Sem comentários."}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}