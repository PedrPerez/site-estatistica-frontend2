import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/InserirQuestionario.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function EditarQuestionario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [questoes, setQuestoes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [formData, setFormData] = useState({
    unidade: '',
    data: '',
    sugestoes: '',
    respostas: {} 
  });
  const [seccoesAbertas, setSeccoesAbertas] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    const fetchData = async () => {
      try {
        const [resQ, resD, resU] = await Promise.all([
          fetch("http://localhost/API/listarQuestoes.php"),
          fetch(`http://localhost/API/obterDetalhe.php?id=${id}`),
          fetch("http://localhost/API/obterUnidade.php")
        ]);
        
        const qData = await resQ.json();
        const dData = await resD.json();
        const uData = await resU.json();

        setUnidades(uData);

        if (dData.erro) {
          setStatus({ type: 'error', message: dData.erro });
          return;
        }

        const respMap = {};
        if (dData.respostas_agrupadas) {
          dData.respostas_agrupadas.forEach(seccao => {
            seccao.indicadores.forEach(i => {
              const idInd = i.id_indicador;
              if (i.muito_bom === 1) respMap[idInd] = 'muito_bom';
              else if (i.bom === 1) respMap[idInd] = 'bom';
              else if (i.aceitavel === 1) respMap[idInd] = 'aceitavel';
              else if (i.mau === 1) respMap[idInd] = 'mau';
            });
          });
        }

        setQuestoes(qData);

        const estadoInicial = {};
        qData.forEach(q => {
          estadoInicial[q.id] = true;
        });
        setSeccoesAbertas(estadoInicial);
        
        setFormData({
          unidade: dData.cod_unidade || '',
          data: dData.data ? dData.data.split(' ')[0] : '',
          sugestoes: dData.sugestoes || '',
          respostas: respMap
        });
        
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Erro ao carregar dados do servidor.' });
      }
    };

    fetchData();
  }, [id]);

  const toggleSeccao = (id) => {
    setSeccoesAbertas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Deseja guardar as alterações?")) return;

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

  const handleRadioChange = (indicadorId, valor) => {
    setFormData({
      ...formData,
      respostas: { ...formData.respostas, [indicadorId]: valor }
    });
  };

  const IndicadoresMobile = ({ indicadores, respostas, onRadioChange }) => {
    const niveis = [
      { key: 'muito_bom', label: 'Muito Bom' },
      { key: 'bom', label: 'Bom' },
      { key: 'aceitavel', label: 'Aceitável' },
      { key: 'mau', label: 'Mau' }
    ];

    return (
      <div className="indicadores-mobile">
        {indicadores.map((ind) => (
          <div key={ind.id} className="indicador-card">
            <div className="indicador-texto">{ind.texto}</div>
            <div className="rating-grid">
              {niveis.map((nivel) => (
                <label 
                  key={nivel.key} 
                  className={`rating-option ${respostas[ind.id] === nivel.key ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`ind_${ind.id}`}
                    required
                    checked={respostas[ind.id] === nivel.key}
                    onChange={() => onRadioChange(ind.id, nivel.key)}
                  />
                  <span className="rating-label">{nivel.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const IndicadoresDesktop = ({ indicadores, respostas, onRadioChange }) => (
    <div className="table-responsive">
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
          {indicadores.map((ind) => (
            <tr key={ind.id}>
              <td className="question-text">{ind.texto}</td>
              {['muito_bom', 'bom', 'aceitavel', 'mau'].map(nivel => (
                <td key={nivel}>
                  <input 
                    type="radio" 
                    name={`ind_${ind.id}`} 
                    checked={respostas[ind.id] === nivel}
                    onChange={() => onRadioChange(ind.id, nivel)}
                    required
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Logo" className="hospital-logo" />
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
        <button onClick={() => navigate('/listar-questionario')} className="nav-link">← Voltar à Lista</button>
      </nav>

      <hr className="divider" />
      
      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
          <div className="section-box">
            <div className="section-title gray-bg">Identificação (Modo Edição)</div>
            <div className="row">
              <div className="input-group grow">
                <label>Unidade:</label>
                <select 
                  value={formData.unidade} 
                  onChange={e => setFormData({...formData, unidade: e.target.value})} 
                  required
                >
                  <option value="">Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>
                  ))}
                </select>
              </div>
              <div className="input-group grow">
                <label>Data:</label>
                <input 
                  type="date" 
                  value={formData.data} 
                  onChange={e => setFormData({...formData, data: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </div>

          {questoes.map(q => (
            <div className="section-box" key={q.id}>
              <div 
                className="section-title gray-bg clickable-header" 
                onClick={() => toggleSeccao(q.id)}
              >
                <span>{q.titulo}</span>
                <span className="toggle-icon">{seccoesAbertas[q.id] ? '▲' : '▼'}</span>
              </div>
              
              <div className={`question-content ${seccoesAbertas[q.id] ? 'show' : 'hide'}`}>
                {isMobile ? (
                  <IndicadoresMobile 
                    indicadores={q.indicadores || []}
                    respostas={formData.respostas}
                    onRadioChange={handleRadioChange}
                  />
                ) : (
                  <IndicadoresDesktop 
                    indicadores={q.indicadores || []}
                    respostas={formData.respostas}
                    onRadioChange={handleRadioChange}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="section-box">
            <div className="section-title gray-bg">Sugestões e Comentários</div>
            <div className="textarea-container">
              <textarea 
                value={formData.sugestoes} 
                onChange={e => setFormData({...formData, sugestoes: e.target.value})} 
                placeholder="Edite aqui as sugestões..."
              />
            </div>
          </div>

          {status.message && (
            <div className={status.type === 'error' ? 'error-message' : 'status-msg'}>
              {status.message}
            </div>
          )}

          <div className="button-group">
            <button type="submit" className="btn-submit">Guardar Alterações</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/listar-questionario')}>Cancelar</button>
          </div>
        </form>
      </main>
    </div>
  );
}