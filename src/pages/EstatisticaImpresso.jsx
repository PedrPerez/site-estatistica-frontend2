import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../css/ListarQuestionario.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png'; 

const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043'];

export default function EstatisticaImpresso() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [dados, setDados] = useState({ categorias: [], lista: [], totais_pizza: [] });
  const [unidades, setUnidades] = useState([]);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
    fetch("http://localhost/API/obterUnidade.php").then(res => res.json()).then(data => setUnidades(data));
    carregarDados();
  }, []);

  const carregarDados = () => {
    const query = new URLSearchParams(filtros).toString();
    fetch(`http://localhost/API/estatisticaImpresso.php?${query}`)
      .then(res => res.json())
      .then(data => setDados(data));
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
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Principal</button>
        <button onClick={() => navigate('/listar-impresso')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Lista de Registos →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content dashboard-padding">
        <div className="container-1200">
          
          {/* Filtros */}
          <div className="section-box filter-box border-black">
            <div className="row flex-gap">
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
              <button onClick={carregarDados} className="btn-filter">Filtrar</button>
            </div>
          </div>

          <div className="section-box white-bg border-black padding-20">
            <div className="section-title gray-bg mb-20">
                Resumo por Tipo de Mensagem e Unidade
            </div>

            {/* Tabela Dinâmica */}
            <table className="rating-table full-width">
              <thead>
                <tr className="light-gray-bg">
                  <th className="table-cell text-left">Unidade</th>
                  {dados.categorias.map(cat => (
                    <th key={cat.id} className="table-cell">{cat.descricao}</th>
                  ))}
                  <th className="table-cell">Total</th>
                </tr>
              </thead>
              <tbody>
                {dados.lista.map((item, i) => (
                  <tr key={i}>
                    <td className="table-cell">{item.unidade_nome}</td>
                    {dados.categorias.map(cat => (
                      <td key={cat.id} className="table-cell text-center">
                        {item[`total_cat_${cat.id}`] || 0}
                      </td>
                    ))}
                    <td className="table-cell text-center bold">{item.total_geral}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Gráficos em Dashboard */}
            <div className="charts-container">
              <div className="bar-chart-wrapper">
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

              <div className="pie-chart-wrapper">
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