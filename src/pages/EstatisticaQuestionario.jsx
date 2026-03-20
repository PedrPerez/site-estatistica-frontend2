import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../css/ListarQuestionario.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png'; 

export default function EstatisticaQuestionario() {
  const navigate = useNavigate();
  const [estatisticas, setEstatisticas] = useState([]);
  const [userName, setUserName] = useState("Utilizador");
  const [unidades, setUnidades] = useState([]);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });
  const [seccoesAbertas, setSeccoesAbertas] = useState({});

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
    fetch("http://localhost/API/obterUnidade.php").then(res => res.json()).then(data => setUnidades(data));
    carregarDados();
  }, []);

  const carregarDados = () => {
    const query = new URLSearchParams(filtros).toString();
    fetch(`http://localhost/API/estatisticaQuestionario.php?${query}`)
      .then(res => res.json())
      .then(data => {
        setEstatisticas(data);
        // Abre todas as secções por defeito nas estatísticas
        const inicial = {};
        data.forEach((_, idx) => { inicial[idx] = true; });
        setSeccoesAbertas(inicial);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  const toggleSeccao = (idx) => {
    setSeccoesAbertas(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="page-wrapper">
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
        <button onClick={() => navigate('/listar-questionario')} className="nav-link">Lista de Registos →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <div className="container-1200">
          
          {/* Filtros Otimizados */}
          <div className="section-box filter-box">
            <div className="row stats-filter-row">
              <div className="input-group grow">
                <label>Unidade:</label>
                <select value={filtros.unidade} onChange={e => setFiltros({...filtros, unidade: e.target.value})}>
                  <option value="">Todas</option>
                  {unidades.map(u => <option key={u.cod_unidade} value={u.descricao}>{u.descricao}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>De:</label>
                <input type="date" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Até:</label>
                <input type="date" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} />
              </div>
              <div className="btn-container">
                 <button onClick={carregarDados} className="btn-submit stats-btn">Filtrar</button>
              </div>
            </div>
          </div>

          {/* Listagem por Categorias */}
          {estatisticas.map((seccao, idx) => (
            <div key={idx} className="section-box">
              <div className="section-title gray-bg clickable-header" onClick={() => toggleSeccao(idx)}>
                <span>{seccao.titulo}</span>
                <span>{seccoesAbertas[idx] ? '▲' : '▼'}</span>
              </div>

              {seccoesAbertas[idx] && (
                <div className="stats-content" style={{ padding: '15px' }}>
                  
                  {/* Tabela de Percentagens com Scroll Horizontal */}
                  <div className="table-responsive">
                    <table className="rating-table">
                      <thead>
                        <tr>
                          <th className="text-left"></th>
                          <th>Muito Bom (%)</th><th>Bom (%)</th><th>Aceitável (%)</th><th>Mau (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seccao.indicadores.map((ind, i) => (
                          <tr key={i}>
                            <td className="question-text">{ind.texto}</td>
                            <td>{ind.mb} <br/><small>({ind.mb_p}%)</small></td>
                            <td>{ind.b} <br/><small>({ind.b_p}%)</small></td>
                            <td>{ind.a} <br/><small>({ind.a_p}%)</small></td>
                            <td>{ind.m} <br/><small>({ind.m_p}%)</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Gráfico de Barras Responsivo */}
                  <div className="chart-wrapper" style={{ height: '350px', marginTop: '20px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={seccao.indicadores}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="texto" hide />
                        <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                        <Tooltip contentStyle={{ fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="mb_p" name="M. Bom" fill="#2d6a4f" />
                        <Bar dataKey="b_p" name="Bom" fill="#52b788" />
                        <Bar dataKey="a_p" name="Aceit." fill="#ffcd38" />
                        <Bar dataKey="m_p" name="Mau" fill="#e63946" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}