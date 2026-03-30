import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function ExportarEstatisticas() {
  const navigate = useNavigate();
  const reportRef = useRef(); // Referência para a captura do PDF

  // Estados
  const [userName, setUserName] = useState("Utilizador");
  const [unidades, setUnidades] = useState([]);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    fetch("http://localhost/API/obterUnidade.php")
      .then(res => res.json())
      .then(data => setUnidades(data))
      .catch(err => console.error("Erro ao carregar unidades:", err));

    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await fetch(`http://localhost/API/estatisticaQuestionario.php?${params}`);
      const resData = await response.json();
      setDados(Array.isArray(resData) ? resData : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const totaisGerais = useMemo(() => {
    let mb = 0, b = 0, a = 0, m = 0;
    dados.forEach(p => {
      p.indicadores.forEach(i => {
        mb += i.mb || 0;
        b += i.b || 0;
        a += i.a || 0;
        m += i.m || 0;
      });
    });
    return { mb, b, a, m, total: mb + b + a + m };
  }, [dados]);

  const exportarExcel = () => {
    const matriz = [
      ["RELATÓRIO ESTATÍSTICO DE SATISFAÇÃO"],
      [`Unidade: ${filtros.unidade || 'Todas'} | Período: ${filtros.inicio || '---'} a ${filtros.fim || '---'}`],
      [],
      ["Questões / Indicadores", "Muito Bom", "%", "Bom", "%", "Aceitável", "%", "Mau", "%", "Total"]
    ];

    dados.forEach(pergunta => {
      matriz.push([pergunta.titulo.toUpperCase(), "", "", "", "", "", "", "", "", ""]);
      pergunta.indicadores.forEach(ind => {
        matriz.push([
          ind.texto,
          ind.mb, (ind.mb_p / 100),
          ind.b, (ind.b_p / 100),
          ind.a, (ind.a_p / 100),
          ind.m, (ind.m_p / 100),
          (ind.mb + ind.b + ind.a + ind.m)
        ]);
      });
      matriz.push([]); 
    });

    const ws = XLSX.utils.aoa_to_sheet(matriz);
    const wb = XLSX.utils.book_new();

    ws['!cols'] = [{ wch: 50 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 12 }];

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 4; R <= range.e.r; ++R) {
      [2, 4, 6, 8].forEach(C => {
        const cell = ws[XLSX.utils.encode_cell({c:C, r:R})];
        if(cell && typeof cell.v === 'number') cell.z = '0.0%';
      });
    }

    XLSX.utils.book_append_sheet(wb, ws, "Estatísticas");
    XLSX.writeFile(wb, `Estatisticas_${filtros.unidade || 'Geral'}.xlsx`);
  };

  const exportarPDF = async () => {
    setLoading(true);
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("Relatorio_Estatistico.pdf");
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>Sair</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link">← Voltar</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportarExcel} className="nav-link" style={{ backgroundColor: '#27ae60', color: 'white' }}>Excel</button>
          <button onClick={exportarPDF} className="nav-link" style={{ backgroundColor: '#c0392b', color: 'white' }}>PDF</button>
        </div>
      </nav>

      <main className="main-content list-page">
        <div className="container-1200" style={{ marginTop: '20px' }}>
          
          {/* Filtros */}
          <div className="section-box" style={{ marginBottom: '20px' }}>
            <div className="row" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
              <div className="input-group">
                <label>Unidade:</label>
                <select value={filtros.unidade} onChange={(e) => setFiltros({...filtros, unidade: e.target.value})}>
                  <option value="">Todas</option>
                  {unidades.map(u => <option key={u.id} value={u.descricao}>{u.descricao}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Início:</label>
                <input type="date" onChange={(e) => setFiltros({...filtros, inicio: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Fim:</label>
                <input type="date" onChange={(e) => setFiltros({...filtros, fim: e.target.value})} />
              </div>
              <button onClick={carregarDados} className="nav-link" style={{ height: '40px' }}>Filtrar</button>
            </div>
          </div>

          {/* Área de Captura (O que sai no PDF) */}
          <div ref={reportRef} style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            
            {/* Widgets de Totais */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px' }}>
              <Card titulo="Muito Bom" valor={totaisGerais.mb} cor="#2ecc71" />
              <Card titulo="Bom" valor={totaisGerais.b} cor="#3498db" />
              <Card titulo="Aceitável" valor={totaisGerais.a} cor="#f1c40f" />
              <Card titulo="Mau" valor={totaisGerais.m} cor="#e74c3c" />
              <Card titulo="Total" valor={totaisGerais.total} cor="#34495e" />
            </div>

            {/* Tabela de Visualização */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f4f4f4' }}>
                  <th style={{ textAlign: 'left', padding: '10px', border: '1px solid #ddd' }}>Indicador</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>MB</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>B</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>A</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>M</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {dados.map(p => (
                  <React.Fragment key={p.pergunta_id}>
                    <tr style={{ background: '#005596', color: 'white' }}>
                      <td colSpan="6" style={{ padding: '8px', fontWeight: 'bold' }}>{p.titulo}</td>
                    </tr>
                    {p.indicadores.map((ind, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ind.texto}</td>
                        <td style={{ textAlign: 'center', border: '1px solid #ddd' }}>{ind.mb}</td>
                        <td style={{ textAlign: 'center', border: '1px solid #ddd' }}>{ind.b}</td>
                        <td style={{ textAlign: 'center', border: '1px solid #ddd' }}>{ind.a}</td>
                        <td style={{ textAlign: 'center', border: '1px solid #ddd' }}>{ind.m}</td>
                        <td style={{ textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>{ind.mb + ind.b + ind.a + ind.m}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}

// Sub-componente para os Cartões
function Card({ titulo, valor, cor }) {
  return (
    <div style={{ 
      padding: '15px', borderRadius: '8px', borderLeft: `6px solid ${cor}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', background: '#fff'
    }}>
      <div style={{ fontSize: '0.8rem', color: '#777', textTransform: 'uppercase' }}>{titulo}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: cor }}>{valor}</div>
    </div>
  );
}