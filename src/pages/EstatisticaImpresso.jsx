import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import logo from '../assets/logohospital_cores.png'; 

const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043'];

export default function EstatisticaImpresso() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [dados, setDados] = useState({ categorias: [], lista: [], totais_pizza: [] });
  const [unidades, setUnidades] = useState([]);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    
    fetch("http://localhost/API/obterUnidade.php")
      .then(res => res.json())
      .then(data => setUnidades(data));
    
    carregarDados();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const carregarDados = () => {
    const query = new URLSearchParams(filtros).toString();
    fetch(`http://localhost/API/estatisticaImpresso.php?${query}`)
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
        <button onClick={() => navigate('/listar-impresso')} className="nav-link">Lista de Registos →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <div className="container-1200">
          {/* Filtros */}
          <div className="section-box filter-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6', borderRadius: '8px', marginBottom: '20px' }}>
            <div className="row flex-gap" style={{ padding: '15px' }}>
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
                <button onClick={carregarDados} className="btn-submit" style={{ padding: '10px 20px' }}>Filtrar</button>
              </div>
            </div>
          </div>

          <div className="section-box" style={{ backgroundColor: '#fff', border: '1px solid #d1d9e6', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="section-title" style={{ backgroundColor: '#4A72B2', color: '#fff', padding: '15px' }}>
              Resumo por Tipo de Mensagem e Unidade
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#fff' }}>
              {/* Tabela de Dados */}
              <div className="table-responsive" style={{ marginBottom: '30px' }}>
                <table className="rating-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th className="text-left" style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Unidade</th>
                      {dados.categorias.map(cat => (
                        <th key={cat.id} style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>{cat.descricao}</th>
                      ))}
                      <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.lista.length === 0 ? (
                      <tr><td colSpan={dados.categorias.length + 2} style={{ textAlign: 'center', padding: '20px' }}>Sem dados para o período selecionado.</td></tr>
                    ) : (
                      dados.lista.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{item.unidade_nome}</td>
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

              {/* Zona de Gráficos */}
              <div className="charts-grid" style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                gap: '20px',
                marginTop: '30px' 
              }}>
                
                {/* Gráfico de Barras - Percentagem por Unidade */}
                <div style={{ flex: 1, height: '450px', minWidth: isMobile ? '100%' : '60%' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#666' }}>Distribuição por Unidade</h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={dados.lista} margin={{ top: 30, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="unidade_nome" hide={isMobile} tick={{fontSize: 11}} />
                      <YAxis tick={{fontSize: 12}} />
                      
                      {/* Tooltip removido para evitar hover */}
                      <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }}/>

                      {dados.categorias.map((cat, idx) => (
                        <Bar 
                          key={cat.id} 
                          dataKey={`total_cat_${cat.id}`} 
                          name={cat.descricao} 
                          fill={COLORS[idx % COLORS.length]} 
                          radius={[4, 4, 0, 0]}
                          label={{ 
                            position: 'top', 
                            fontSize: 10, 
                            fontWeight: 'bold',
                            fill: '#444',
                            // Otimizado para evitar erros de undefined
                            formatter: (value, entry) => {
                                const total = entry?.payload?.total_geral;
                                if (value > 0 && total > 0) {
                                    return `${((value / total) * 100).toFixed(0)}%`;
                                }
                                return '';
                            }
                          }}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Pizza - Percentagem Global */}
                <div style={{ flex: 1, height: '450px', minWidth: isMobile ? '100%' : '35%' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#666' }}>Total Global</h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie 
                        data={dados.totais_pizza} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={isMobile ? 80 : 100}
                        // Label mostra a % da fatia
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {dados.totais_pizza.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      {/* Tooltip removido para evitar hover */}
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
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