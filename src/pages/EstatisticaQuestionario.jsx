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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    
    fetch("http://localhost/API/obterUnidade.php")
      .then(res => res.json())
      .then(data => setUnidades(data));
    
    carregarDados();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const carregarDados = () => {
    const query = new URLSearchParams(filtros).toString();
    fetch(`http://localhost/API/estatisticaQuestionario.php?${query}`)
      .then(res => res.json())
      .then(data => {
        setEstatisticas(data);
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

  const DadosMobile = ({ indicadores }) => (
    <div className="stats-mobile-container" style={{ padding: '10px' }}>
      {indicadores.map((ind, i) => (
        <div key={i} className="indicador-card" style={{ backgroundColor: '#fff', border: '1px solid #eee', marginBottom: '15px', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333', borderBottom: '1px solid #f0f0f0', paddingBottom: '5px' }}>
            {ind.texto}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ fontSize: '0.85rem' }}><strong>M. Bom:</strong> {ind.mb} <small>({ind.mb_p}%)</small></div>
            <div style={{ fontSize: '0.85rem' }}><strong>Bom:</strong> {ind.b} <small>({ind.b_p}%)</small></div>
            <div style={{ fontSize: '0.85rem' }}><strong>Aceit.:</strong> {ind.a} <small>({ind.a_p}%)</small></div>
            <div style={{ fontSize: '0.85rem' }}><strong>Mau:</strong> {ind.m} <small>({ind.m_p}%)</small></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <header className="login-header">
        <img src={logo} alt="Hospital Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>Sair</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link">← Menu</button>
        <button onClick={() => navigate('/listar-questionario')} className="nav-link">Registos →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <div className="container-1200">
          
          <div className="section-box filter-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6', borderRadius: '8px' }}>
            <div className="row stats-filter-row" style={{ padding: '15px' }}>
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

          {estatisticas.map((seccao, idx) => (
            <div key={idx} className="section-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
              <div 
                className="section-title" 
                style={{ 
                  backgroundColor: '#4A72B2', 
                  color: '#fff', 
                  padding: '15px',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }} 
                onClick={() => toggleSeccao(idx)}
              >
                <span>{seccao.titulo}</span>
                <span>{seccoesAbertas[idx] ? '▲' : '▼'}</span>
              </div>

              {seccoesAbertas[idx] && (
                <div className="stats-content" style={{ backgroundColor: '#fff' }}>
                  
                  {isMobile ? (
                    <DadosMobile indicadores={seccao.indicadores} />
                  ) : (
                    <div className="table-responsive" style={{ padding: '10px' }}>
                      <table className="rating-table">
                        <thead>
                          <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th className="text-left" style={{ color: '#666' }}>Indicador</th>
                            <th style={{ color: '#666' }}>Muito Bom (%)</th>
                            <th style={{ color: '#666' }}>Bom (%)</th>
                            <th style={{ color: '#666' }}>Aceitável (%)</th>
                            <th style={{ color: '#666' }}>Mau (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seccao.indicadores.map((ind, i) => (
                            <tr key={i}>
                              <td className="question-text" style={{ fontWeight: 'bold' }}>{ind.texto}</td>
                              <td>{ind.mb} <br/><small>({ind.mb_p}%)</small></td>
                              <td>{ind.b} <br/><small>({ind.b_p}%)</small></td>
                              <td>{ind.a} <br/><small>({ind.a_p}%)</small></td>
                              <td>{ind.m} <br/><small>({ind.m_p}%)</small></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Gráfico (Mantém-se para ambos, ResponsiveContainer trata do tamanho) */}
                  <div className="chart-wrapper" style={{ height: '350px', padding: '20px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={seccao.indicadores}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="texto" hide />
                        <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="mb_p" name="M. Bom" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="b_p" name="Bom" fill="#52b788" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="a_p" name="Aceit." fill="#ffcd38" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="m_p" name="Mau" fill="#e63946" radius={[4, 4, 0, 0]} />
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