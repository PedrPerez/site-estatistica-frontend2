import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../css/ListarQuestionario.css';

export default function EstatisticaQuestionario() {
  const navigate = useNavigate();
  const [estatisticas, setEstatisticas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });
  const [seccoesAbertas, setSeccoesAbertas] = useState({});

  useEffect(() => {
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

  const toggleSeccao = (idx) => {
    setSeccoesAbertas(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="title-section">ESTATÍSTICAS GERAIS DE SATISFAÇÃO</div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Principal</button>
        <button onClick={() => navigate('/listar-questionario')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Lista de Registos →</button>
      </nav>

      <main className="main-content">
        <div className="container-1200">
          
          {/* Filtros Estilizados */}
          <div className="section-box filter-box">
            <div className="row">
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
              <button onClick={carregarDados} className="logout-btn" style={{marginTop: '25px', height: '40px'}}>Filtrar</button>
            </div>
          </div>

          {/* Listagem por Categorias (Estilo Questionário) */}
          {estatisticas.map((seccao, idx) => (
            <div key={idx} className="section-box" style={{ marginBottom: '20px' }}>
              <div className="section-title gray-bg clickable-header" onClick={() => toggleSeccao(idx)}>
                <span>{seccao.titulo}</span>
                <span>{seccoesAbertas[idx] ? '▲' : '▼'}</span>
              </div>

              {seccoesAbertas[idx] && (
                <div style={{ padding: '20px' }}>
                  {/* Tabela de Percentagens */}
                  <table className="rating-table" style={{ marginBottom: '30px' }}>
                    <thead>
                      <tr>
                        <th className="text-left">Indicador</th>
                        <th>Muito Bom</th><th>Bom</th><th>Aceitável</th><th>Mau</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seccao.indicadores.map((ind, i) => (
                        <tr key={i}>
                          <td className="question-text">{ind.texto}</td>
                          <td>{ind.mb} <small>({ind.mb_p}%)</small></td>
                          <td>{ind.b} <small>({ind.b_p}%)</small></td>
                          <td>{ind.a} <small>({ind.a_p}%)</small></td>
                          <td>{ind.m} <small>({ind.m_p}%)</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Gráfico de Barras para a Secção */}
                  <div style={{ height: '300px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seccao.indicadores}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="texto" hide />
                        <YAxis tickFormatter={(val) => `${val}%`} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="mb_p" name="% Muito Bom" fill="#2d6a4f" />
                        <Bar dataKey="b_p" name="% Bom" fill="#52b788" />
                        <Bar dataKey="a_p" name="% Aceitável" fill="#ffcd38" />
                        <Bar dataKey="m_p" name="% Mau" fill="#e63946" />
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