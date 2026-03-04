import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../css/InserirQuestionario.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function EstatisticasPage() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });
  const [chartData, setChartData] = useState(null);

  // Carregar unidades para o select de filtros
  useEffect(() => {
    fetch("http://localhost/API/obterUnidade.php")
      .then(res => res.json())
      .then(data => setUnidades(data))
      .catch(err => console.error("Erro unidades:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({ unidade: '', inicio: '', fim: '' });
    setChartData(null);
  };

  const gerarGrafico = async () => {
    const { unidade, inicio, fim } = filtros;
    let url = `http://localhost/API/estatisticaQuestionario.php?unidade=${unidade}`;
    if (inicio && fim) url += `&inicio=${inicio}&fim=${fim}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.length === 0) {
        alert("Sem dados para este período/unidade.");
        return;
      }

      setChartData({
        labels: data.map(d => d.indicador),
        datasets: [
          { label: 'Muito Bom', data: data.map(d => d.mb), backgroundColor: '#2ecc71' },
          { label: 'Bom', data: data.map(d => d.b), backgroundColor: '#9b59b6' },
          { label: 'Aceitável', data: data.map(d => d.a), backgroundColor: '#f1c40f' },
          { label: 'Mau', data: data.map(d => d.m), backgroundColor: '#e74c3c' }
        ]
      });
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="logo-section">Logo</div>
        <div className="title-section">SCME - ANÁLISE ESTATÍSTICA</div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/')} className="nav-link-btn" style={{cursor:'pointer'}}>← Voltar</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <div className="container-1200">
          
          <div className="filter-header">
            <span className="filter-title">Filtros de Estatística:</span>
            <button onClick={limparFiltros} className="clean-filters">Limpar Filtros</button>
          </div>

          <div className="section-box filter-box">
            <div className="row">
              <div className="input-group">
                <label>Unidade:</label>
                <select name="unidade" value={filtros.unidade} onChange={handleChange}>
                  <option value="">Todas as Unidades</option>
                  {unidades.map(u => (
                    <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>De:</label>
                <input type="date" name="inicio" value={filtros.inicio} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Até:</label>
                <input type="date" name="fim" value={filtros.fim} onChange={handleChange} />
              </div>
            </div>
            <button onClick={gerarGrafico} className="submit-btn" style={{marginTop: '20px'}}>Gerar Gráfico de Barras</button>
          </div>

          {chartData ? (
            <div className="section-box" style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px' }}>
              <Bar 
                data={chartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Distribuição de Satisfação por Indicador' }
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="results-text" style={{textAlign: 'center', marginTop: '40px'}}>
              Selecione os filtros acima e clique em "Gerar Gráfico".
            </div>
          )}
        </div>
      </main>
    </div>
  );
}