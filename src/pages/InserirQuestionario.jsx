import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/InserirQuestionario.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png'; 

export default function InserirQuestionario() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [userName, setUserName] = useState("Utilizador");
  const [questoes, setQuestoes] = useState([]);
  const [seccoesAbertas, setSeccoesAbertas] = useState({});
  const [formData, setFormData] = useState({
    unidade: '',
    data: '',
    sugestoes: '',
    respostas: {}
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  //Carregar as questões e indicadores do PHP (listarQuestoes.php)
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
    // Carregar Unidades
    fetch('http://localhost/API/obterUnidade.php')
      .then(res => res.json())
      .then(data => setUnidades(data))
      .catch(err => console.error("Erro ao carregar unidades:", err));
    fetch("http://localhost/API/listarQuestoes.php")
      .then(res => res.json())
      .then(data => {
        setQuestoes(data);
        // Inicializa todas as secções como abertas por padrão
        const estadoInicial = {};
        data.forEach(q => {
          estadoInicial[q.id] = true;
        });
        setSeccoesAbertas(estadoInicial);
      })
      .catch(() => setStatus({ type: 'error', message: 'Erro ao carregar indicadores.' }));
  }, []);

  //Alternar visibilidade da secção (Toggle/Accordion)
  const toggleSeccao = (id) => {
    setSeccoesAbertas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  //Lidar com mudanças nos inputs de texto/select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  //Lidar com a seleção dos Radio Buttons
  const handleRadioChange = (indicadorId, valor) => {
    setFormData(prev => ({
      ...prev,
      respostas: { ...prev.respostas, [indicadorId]: valor }
    }));
  };

  //Submeter os dados para o servidor (salvarQuestionario.php)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'A gravar...' });

    //Formata as respostas para o formato esperado pela tbl_questionarios_registos
    const listaRespostas = Object.keys(formData.respostas).map(id => ({
      id_indicador: parseInt(id),
      valor: formData.respostas[id]
    }));

    const payload = {
      unidade: formData.unidade,
      data: formData.data,
      conteudo: formData.sugestoes,
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
        // Limpa o formulário após sucesso
        setFormData({ unidade: '', data: '', sugestoes: '', respostas: {} });
      } else {
        setStatus({ type: 'error', message: res.mensagem });
      }
    } catch {
      setStatus({ type: 'error', message: 'Erro de ligação ao servidor.' });
    }
  };

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
            <button className="logout-btn" onClick={handleLogout}>
              Terminar Sessão
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Pagina Principal</button>
        <button onClick={() => navigate('/listar-questionario')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Listar Questionário →</button>
      </nav>

      <hr className="divider" />

        <main className="main-content">
          <form onSubmit={handleSubmit} className="full-width-form">
            
            {/* Secção de Identificação */}
            <div className="section-box">
              <div className="section-title gray-bg">Identificação</div>
              <div className="row">
                <div className="input-group">
                  <label>Unidade:</label>
                  <select name="unidade" value={formData.unidade} onChange={handleChange}>
                    <option value="">Seleccione a Unidade</option>
                    {unidades.map(u => (
                      <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group grow">
                  <label>Data:</label>
                  <input type="date" name="data" value={formData.data} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Renderização Dinâmica das Questões e Indicadores */}
            {questoes.map((q) => (
              <div className="section-box" key={q.id}>
                <div 
                  className="section-title gray-bg clickable-header" 
                  onClick={() => toggleSeccao(q.id)}
                >
                  <span>{q.titulo}</span>
                  <span className="toggle-icon">{seccoesAbertas[q.id] ? '▲' : '▼'}</span>
                </div>
                
                {/* Conteúdo da Tabela que recolhe/expande */}
                <div className={`question-content ${seccoesAbertas[q.id] ? 'show' : 'hide'}`}>
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
                      {q.indicadores && q.indicadores.map((ind) => (
                        <tr key={ind.id}>
                          <td className="question-text">{ind.texto}</td>
                          {['muito_bom', 'bom', 'aceitavel', 'mau'].map(nivel => (
                            <td key={nivel}>
                              <input 
                                type="radio" 
                                name={`ind_${ind.id}`} 
                                required
                                checked={formData.respostas[ind.id] === nivel}
                                onChange={() => handleRadioChange(ind.id, nivel)} 
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Secção de Sugestões */}
            <div className="section-box">
              <div className="section-title gray-bg">Sugestões e outros comentários</div>
              <div className="textarea-container">
                <textarea 
                  name="sugestoes" 
                  value={formData.sugestoes} 
                  onChange={handleChange} 
                  placeholder="Escreva aqui as suas sugestões..."
                />
              </div>
            </div>

            {/* Mensagens de Feedback */}
            {status.message && (
              <div className={status.type === 'error' ? 'error-message' : 'status-msg'}>
                {status.message}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="button-group">
              <button type="button" className="btn-cancel" onClick={() => window.history.back()}>Cancelar</button>
              <button type="submit" className="btn-submit">Submeter</button>
            </div>
          </form>
        </main>
    </div>
  );
}