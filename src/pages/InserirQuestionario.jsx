import React, { useState, useEffect } from 'react';
import '../css/InserirQuestionario.css';

export default function InserirQuestionario() {
  const [questoes, setQuestoes] = useState([]);
  const [formData, setFormData] = useState({
    unidade: '',
    data: '',
    sugestoes: '',
    respostas: {}
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  // Carrega as questões da base de dados (tbl_questoes)
  useEffect(() => {
    fetch("http://localhost/API/listarQuestoes.php")
      .then(res => res.json())
      .then(data => setQuestoes(data))
      .catch(() => setStatus({ type: 'error', message: 'Erro ao carregar indicadores.' }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (id, valor) => {
    setFormData(prev => ({
      ...prev,
      respostas: { ...prev.respostas, [id]: valor }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'A gravar...' });

    // Prepara os dados para a tbl_questionarios_registos
    const listaRespostas = Object.keys(formData.respostas).map(id => ({
      id_indicador: parseInt(id),
      valor: formData.respostas[id].replace(/\s+/g, '_')
    }));

    const payload = {
      unidade: formData.unidade,
      data: formData.data,
      conteudo: formData.sugestoes,
      utilizador: "Admin_HVR",
      respostas: listaRespostas
    };

    try {
      const response = await fetch("http://localhost/API/salvarQuestionario.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      if (res.status === "sucesso") {
        setStatus({ type: 'success', message: 'Gravado com sucesso!' });
        setFormData({ unidade: '', data: '', sugestoes: '', respostas: {} });
      } else {
        setStatus({ type: 'error', message: res.mensagem });
      }
    } catch {
      setStatus({ type: 'error', message: 'Erro de ligação.' });
    }
  };

  return (
    <div className="page-wrapper">
      {/* Este contentor controla a largura máxima de TODO o ecrã */}
      <div className="container-align">
        
        {/* Cabeçalho */}
        <header className="main-header">
          <div className="logo-section">Logo</div>
          <div className="title-section">SANTA CASA DA MISERICÓRDIA DE ESPOSENDE</div>
          <div className="user-section">
            <span>*Utilizador*</span><br/>
            <button className="logout-btn">Terminar Sessão</button>
          </div>
        </header>

        {/* Navegação */}
        <nav className="nav-links">
          <a href="/" className="nav-link">← Pagina Principal</a>
          <a href="/listar-questionario" className="nav-link">Listar Questionário →</a>
        </nav>

        <hr className="divider" />

        <main className="main-content">
          <form onSubmit={handleSubmit} className="full-width-form">
            
            {/* Secção Identificação */}
            <div className="section-box">
              <div className="section-title gray-bg">Identificação</div>
              <div className="row">
                <div className="input-group grow">
                  <label>Unidade:</label>
                  <select name="unidade" value={formData.unidade} onChange={handleChange} required>
                    <option value="">-</option>
                    <option value="1">Convalescença</option>
                    <option value="2">Média Duração e Reabilitação</option>
                    <option value="3">Cirurgia</option>
                  </select>
                </div>
                <div className="input-group grow">
                  <label>Data:</label>
                  <input type="date" name="data" value={formData.data} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Secção Tabela (Mapeada da tbl_questoes) */}
            <div className="section-box">
              <div className="section-title gray-bg">1. Grau de Satisfação</div>
              <div className="question-content">
                <table className="rating-table">
                  <thead>
                    <tr>
                      <th className="text-left">Indicador</th>
                      <th>Muito Bom</th>
                      <th>Bom</th>
                      <th>Aceitável</th>
                      <th>Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questoes.map(q => (
                      <tr key={q.id}>
                        <td className="question-text">{q.descricao}</td>
                        {['muito bom', 'bom', 'aceitavel', 'mau'].map(nivel => (
                          <td key={nivel}>
                            <input 
                              type="radio" 
                              name={`indicador_${q.id}`} 
                              required
                              checked={formData.respostas[q.id] === nivel}
                              onChange={() => handleRadioChange(q.id, nivel)} 
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Secção Sugestões */}
            <div className="section-box">
              <div className="section-title gray-bg">10. Sugestões e outros comentários</div>
              <div className="textarea-container">
                <textarea 
                  name="sugestoes" 
                  value={formData.sugestoes} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {status.message && (
              <div className={status.type === 'error' ? 'error-message' : 'status-msg'}>
                {status.message}
              </div>
            )}

            <div className="button-group">
              <button type="button" className="btn-cancel" onClick={() => window.history.back()}>Cancelar</button>
              <button type="submit" className="btn-submit">Submeter</button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}