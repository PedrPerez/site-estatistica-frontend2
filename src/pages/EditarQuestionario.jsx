import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/InserirQuestionario.css';
import '../css/Header.css'
import logo from '../assets/logohospital_cores.png';

export default function EditarQuestionario() {
  const { id } = useParams();
  const [userName, setUserName] = useState("Utilizador");
  const navigate = useNavigate();
  const [questoes, setQuestoes] = useState([]);
  const [seccoesAbertas, setSeccoesAbertas] = useState({});
  const [formData, setFormData] = useState({
    unidade: '',
    data: '',
    sugestoes: '',
    respostas: {} 
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  // 1. Carregar dados atuais para edição
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
    const fetchData = async () => {
      try {
        const [resQ, resD] = await Promise.all([
          fetch("http://localhost/API/listarQuestoes.php"),
          fetch(`http://localhost/API/obterDetalhe.php?id=${id}`)
        ]);
        
        const qData = await resQ.json();
        const dData = await resD.json();

        const respMap = {};
        dData.respostas_agrupadas.forEach(p => {
          p.indicadores.forEach(i => {
            if (i.muito_bom == 1) respMap[i.id_indicador] = 'muito_bom';
            else if (i.bom == 1) respMap[i.id_indicador] = 'bom';
            else if (i.aceitavel == 1) respMap[i.id_indicador] = 'aceitavel';
            else if (i.mau == 1) respMap[i.id_indicador] = 'mau';
          });
        });

        setQuestoes(qData);
        setFormData({
          unidade: dData.cod_unidade,
          data: dData.data.split(' ')[0],
          sugestoes: dData.sugestoes || '',
          respostas: respMap
        });
        
        const open = {};
        qData.forEach(q => open[q.id] = true);
        setSeccoesAbertas(open);
      } catch (err) {
        setStatus({ type: 'error', message: 'Erro ao carregar dados.' });
      }
    };
    fetchData();
  }, [id]);

  // 2. Submissão com Alerta de Confirmação
  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmar = window.confirm("Deseja guardar as alterações?");
    if (!confirmar) return;

    // Garantir que os nomes das chaves batem com o PHP
    const payload = {
      id_questionario: id,
      unidade: formData.unidade,
      data: formData.data,
      sugestoes: formData.sugestoes,
      respostas: Object.keys(formData.respostas).map(idInd => ({
        id_indicador: idInd,
        valor: formData.respostas[idInd]
      }))
    };
    try {
      const response = await fetch("http://localhost/API/editarQuestionario.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const res = await response.json();

      if (res.status === "sucesso") {
        // Redireciona para a listagem após o sucesso
        navigate('/listar-questionario'); 
      } else {
        setStatus({ type: 'error', message: res.mensagem });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro ao conectar com o servidor.' });
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
      
      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
          
          <div className="section-box">
             <div className="section-title gray-bg">Identificação</div>
             <div className="row">
                <div className="input-group grow">
                  <label>Unidade:</label>
                  <select name="unidade" value={formData.unidade} onChange={e => setFormData({...formData, unidade: e.target.value})} required>
                    <option value="1">Convalescença</option>
                    <option value="2">Média Duração e Reabilitação</option>
                    <option value="3">Cirurgia</option>
                  </select>
                </div>
                <div className="input-group grow">
                  <label>Data:</label>
                  <input type="date" name="data" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required />
                </div>
             </div>
          </div>

          {questoes.map(q => (
            <div className="section-box" key={q.id}>
              <div className="section-title gray-bg">{q.titulo}</div>
              <div className="question-content show">
                <table className="rating-table">
                  <thead>
                    <tr>
                      <th className="text-left">Indicador</th>
                      <th>Muito Bom</th><th>Bom</th><th>Aceitável</th><th>Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.indicadores?.map(ind => (
                      <tr key={ind.id}>
                        <td className="question-text">{ind.texto}</td>
                        {['muito_bom', 'bom', 'aceitavel', 'mau'].map(nivel => (
                          <td key={nivel}>
                            <input 
                              type="radio" 
                              name={`ind_${ind.id}`} 
                              checked={formData.respostas[ind.id] === nivel}
                              onChange={() => setFormData({
                                ...formData, 
                                respostas: {...formData.respostas, [ind.id]: nivel}
                              })}
                              required
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

          <div className="section-box">
             <div className="section-title gray-bg">Sugestões</div>
             <textarea 
               className="textarea-container" 
               style={{width: '100%', minHeight: '100px', padding: '10px'}}
               value={formData.sugestoes} 
               onChange={e => setFormData({...formData, sugestoes: e.target.value})} 
             />
          </div>

          {status.message && <div className={`status-msg ${status.type}`}>{status.message}</div>}

          <div className="button-group" style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
            <button type="button" className="btn-cancel" onClick={() => navigate('/listar-questionario')}>Cancelar</button>
            <button type="submit" className="btn-submit">Guardar Alterações</button>
          </div>
        </form>
      </main>
    </div>
  );
}