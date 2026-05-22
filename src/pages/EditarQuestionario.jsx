import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

/**
 * Componente EditarQuestionario
 * 
 * Permite a edição de um questionário previamente submetido.
 * 
 * Funcionalidades:
 * - Carregamento Síncrono (Promise.all) de questões, detalhes e unidades.
 * - Mapeamento de estado de resposta (o formulário preenche os radio buttons automaticamente).
 * - Persistência de dados via POST com payload formatado.
 * - Suporte a UI Responsiva (Mobile/Desktop).
 * 
 * @component
 */
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
    // Carrega em paralelo: Questões disponíveis, Detalhes da resposta e Lista de Unidades
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
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

        const respMap = {};
        if (dData.respostas_agrupadas) {
          dData.respostas_agrupadas.forEach(seccao => {
            // Verifica ambos os nomes possíveis para os indicadores no detalhe
            const lista = seccao.indicadores || seccao.indicators || [];
            lista.forEach(i => {
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
        qData.forEach(q => { estadoInicial[q.id] = true; });
        setSeccoesAbertas(estadoInicial);
        
        setFormData({
          unidade: dData.cod_unidade || '',
          data: dData.data ? dData.data.split(' ')[0] : '',
          sugestoes: dData.sugestoes || '',
          respostas: respMap
        });
        
      } catch (err) {
        setStatus({ type: 'error', message: 'Erro ao carregar dados.' });
      }
    };
    fetchData();
  }, [id]);

  const handleRadioChange = (indicadorId, valor) => {
    setFormData(prev => ({
      ...prev,
      respostas: { ...prev.respostas, [indicadorId]: valor }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (res.status === "sucesso") navigate('/listar-questionario');
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro ao conectar com o servidor.' });
    }
  };

  const IndicadoresMobile = ({ lista }) => (
    <div className="indicadores-mobile" style={{ backgroundColor: '#fff' }}>
      {lista.map((ind) => (
        <div key={ind.id} className="indicador-card" style={{ backgroundColor: '#fff' }}>
          <div className="indicador-texto">{ind.texto}</div>
          <div className="rating-grid">
            {[
              { key: 'muito_bom', label: 'Muito Bom' },
              { key: 'bom', label: 'Bom' },
              { key: 'aceitavel', label: 'Aceitável' },
              { key: 'mau', label: 'Mau' }
            ].map((nivel) => (
              <label 
                key={nivel.key} 
                className={`rating-option ${formData.respostas[ind.id] === nivel.key ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`ind_${ind.id}`}
                  checked={formData.respostas[ind.id] === nivel.key}
                  onChange={() => handleRadioChange(ind.id, nivel.key)}
                  // Removido o atributo 'required' aqui
                />
                <span className="rating-label">{nivel.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const IndicadoresDesktop = ({ lista }) => (
    <div className="table-responsive" style={{ backgroundColor: '#fff' }}>
      <table className="rating-table" style={{ backgroundColor: '#fff' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th className="text-left">Indicador</th>
            <th>Muito Bom</th><th>Bom</th><th>Aceitável</th><th>Mau</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((ind) => (
            <tr key={ind.id}>
              <td className="question-text">{ind.texto}</td>
              {['muito_bom', 'bom', 'aceitavel', 'mau'].map(nivel => (
                <td key={nivel}>
                  <input 
                    type="radio" 
                    name={`ind_${ind.id}`} 
                    checked={formData.respostas[ind.id] === nivel}
                    onChange={() => handleRadioChange(ind.id, nivel)}
                    // Removido o atributo 'required' aqui
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
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
        <button onClick={() => navigate('/listar-questionario')} className="nav-link">Listar Questionário →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
          <div className="section-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6' }}>
            <div className="section-title" style={{ backgroundColor: '#000', color: '#fff', border: 'none' }}>
              Identificação (Modo Edição)
            </div>
            <div className="row" style={{ backgroundColor: '#fff', padding: '20px' }}>
              <div className="input-group">
                <label>Unidade:</label>
                <select value={formData.unidade} onChange={e => setFormData({...formData, unidade: e.target.value})} required>
                  {unidades.map(u => <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Data:</label>
                <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required />
              </div>
            </div>
          </div>

          {questoes.map(q => (
            <div className="section-box" key={q.id} style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6' }}>
              <div 
                className="section-title" 
                style={{ backgroundColor: '#4A72B2', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} 
                onClick={() => setSeccoesAbertas(prev => ({...prev, [q.id]: !prev[q.id]}))}
              >
                <span>{q.titulo}</span>
                <span>{seccoesAbertas[q.id] ? '▲' : '▼'}</span>
              </div>
              <div className={`question-content ${seccoesAbertas[q.id] ? 'show' : 'hide'}`} style={{ backgroundColor: '#fff' }}>
                {isMobile ? 
                  <IndicadoresMobile lista={q.indicadores || q.indicators || []} /> : 
                  <IndicadoresDesktop lista={q.indicadores || q.indicators || []} />
                }
              </div>
            </div>
          ))}

          <div className="section-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6' }}>
            <div className="section-title" style={{ backgroundColor: '#fff', color: '#4A72B2', borderBottom: '1px solid #eee' }}>Sugestões</div>
            <div className="textarea-container" style={{ padding: '20px' }}>
              <textarea value={formData.sugestoes} onChange={e => setFormData({...formData, sugestoes: e.target.value})} style={{ backgroundColor: '#fff' }} />
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn-submit">Guardar Alterações</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/listar-questionario')}>Cancelar</button>
          </div>
        </form>
      </main>
      <footer className="footer-minimal">
        <div className="footer-content">
          <div className="footer-info">
            <span className="hospital-name">Hospital de Esposende Valentim Ribeiro</span>
          </div>
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} — Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}