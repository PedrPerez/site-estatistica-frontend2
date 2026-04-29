import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import logo from '../assets/logohospital_cores.png'; 

const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043'];

export default function EstatisticaEmails() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [dados, setDados] = useState({ categorias: [], lista: [], totais_pizza: [] });
  const [filtros, setFiltros] = useState({ inicio: '', fim: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    
    carregarDados();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const carregarDados = () => {
    const query = new URLSearchParams(filtros).toString();
    fetch(`http://localhost/API/estatisticaEmail.php?${query}`)
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(err => console.error("Erro:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <header className="login-header">
        <img src={logo} alt="Hospital Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link">← Página Principal</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <div className="container-1200">
          {/* Filtros */}
          <div className="section-box filter-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6', borderRadius: '8px', marginBottom: '20px' }}>
            <div className="row flex-gap" style={{ padding: '15px', display: 'flex', alignItems: 'flex-end' }}>
              <div className="input-group">
                <label>De:</label>
                <input type="date" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Até:</label>
                <input type="date" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} />
              </div>
              <div className="btn-container">
                <button onClick={carregarDados} className="btn-submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Filtrar Estatísticas</button>
              </div>
            </div>
          </div>

          <div className="section-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="section-title" style={{ backgroundColor: '#2c3e50', color: '#fff', padding: '15px', fontWeight: 'bold' }}>
              Estatísticas de Registos de Email por Utilizador
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#fff' }}>
              {/* Tabela de Dados */}
              <div className="table-responsive" style={{ marginBottom: '30px' }}>
                <table className="rating-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th className="text-left" style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Utilizador</th>
                      {dados.categorias.map(cat => (
                        <th key={cat.id} style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>{cat.descricao}</th>
                      ))}
                      <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.lista.length === 0 ? (
                      <tr><td colSpan={dados.categorias.length + 2} style={{ textAlign: 'center', padding: '20px' }}>Sem dados encontrados.</td></tr>
                    ) : (
                      dados.lista.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{item.agrupamento_nome}</td>
                          {dados.categorias.map(cat => (
                            <td key={cat.id} style={{ textAlign: 'center', padding: '12px' }}>
                              {item[`total_cat_${cat.id}`] || 0}
                            </td>
                          ))}
                          <td style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold', backgroundColor: '#fcfcfc' }}>
                            {item.total_geral}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Gráficos */}
              <div className="charts-grid" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
                <div style={{ flex: 1, height: '400px' }}>
                  <h4 style={{ textAlign: 'center', color: '#666' }}>Volume por Utilizador</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dados.lista}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="agrupamento_nome" />
                      <YAxis />
                      <Legend />
                      {dados.categorias.map((cat, idx) => (
                        <Bar 
                          key={cat.id} 
                          dataKey={`total_cat_${cat.id}`} 
                          name={cat.descricao} 
                          fill={COLORS[idx % COLORS.length]} 
                          stackId="a"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ flex: 1, height: '400px' }}>
                  <h4 style={{ textAlign: 'center', color: '#666' }}>Distribuição Global por Tipo</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={dados.totais_pizza} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" cy="50%" 
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {dados.totais_pizza.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}