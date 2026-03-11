import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../css/ListarQuestionario.css';

const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043'];

export default function EstatisticaImpresso() {
  const navigate = useNavigate();
  const [dados, setDados] = useState({ categorias: [], lista: [], totais_pizza: [] });
  const [unidades, setUnidades] = useState([]);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });

  useEffect(() => {
    fetch("http://localhost/API/obterUnidade.php").then(res => res.json()).then(data => setUnidades(data));
    carregarDados();
  }, []);

  const carregarDados = () => {
    const query = new URLSearchParams(filtros).toString();
    fetch(`http://localhost/API/estatisticaImpresso.php?${query}`)
      .then(res => res.json())
      .then(data => setDados(data));
  };

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="title-section">ESTATÍSTICAS DE IMPRESSOS (DINÂMICO)</div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Principal</button>
      </nav>

      <main className="main-content" style={{ padding: '20px' }}>
        <div className="container-1200">
          
          {/* Filtros Estilizados como no teu código base */}
          <div className="section-box filter-box" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #000' }}>
            <div className="row" style={{ display: 'flex', gap: '15px' }}>
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

          <div className="section-box" style={{ border: '1px solid #000', padding: '20px', background: '#fff' }}>
            <div className="section-title gray-bg" style={{ marginBottom: '20px', padding: '10px' }}>
                Resumo por Tipo de Mensagem e Unidade
            </div>

            {/* Tabela Dinâmica */}
            <table className="rating-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #000', textAlign: 'left', padding: '8px' }}>Unidade</th>
                  {dados.categorias.map(cat => (
                    <th key={cat.id} style={{ border: '1px solid #000', padding: '8px' }}>{cat.descricao}</th>
                  ))}
                  <th style={{ border: '1px solid #000', padding: '8px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {dados.lista.map((item, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{item.unidade_nome}</td>
                    {dados.categorias.map(cat => (
                      <td key={cat.id} style={{ border: '1px solid #000', textAlign: 'center' }}>
                        {item[`total_cat_${cat.id}`] || 0}
                      </td>
                    ))}
                    <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{item.total_geral}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Gráficos em Dashboard */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '40px', height: '400px' }}>
              <div style={{ flex: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.lista}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="unidade_nome" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {dados.categorias.map((cat, idx) => (
                      <Bar 
                        key={cat.id} 
                        dataKey={`total_cat_${cat.id}`} 
                        name={cat.descricao} 
                        fill={COLORS[idx % COLORS.length]} 
                        stroke="#000"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ flex: 1, borderLeft: '1px solid #eee' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dados.totais_pizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {dados.totais_pizza.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="#000" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}