import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../css/ListarQuestionario.css';

export default function EstatisticaQuestionario() {
  const [dados, setDados] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });

  useEffect(() => {
    fetch("http://localhost/API/obterUnidade.php").then(res => res.json()).then(data => setUnidades(data));
    carregarDados();
  }, []);

  const carregarDados = () => {
    const query = new URLSearchParams(filtros).toString();
    fetch(`http://localhost/API/estatisticaQuestionario.php?${query}`)
      .then(res => res.json())
      .then(data => setDados(data));
  };

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="title-section">ESTATÍSTICAS DE SATISFAÇÃO</div>
      </header>

      <nav className="nav-links">
        <a href="/" className="nav-link">← Principal</a>
        <a href="/listar-questionarios" className="nav-link">Lista de Registos →</a>
      </nav>

      <main className="main-content">
        <div className="container-1200">
          {/* Filtros de Estatística */}
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

          <div className="section-box" style={{height: '500px', padding: '20px'}}>
            <h3 className="questionario-title">Satisfação por Indicador</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indicador" angle={-45} textAnchor="end" interval={0} height={100} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="mb" name="Muito Bom" fill="#000000" />
                <Bar dataKey="b" name="Bom" fill="#4a4a4a" />
                <Bar dataKey="a" name="Aceitável" fill="#8e8e8e" />
                <Bar dataKey="m" name="Mau" fill="#cccccc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}