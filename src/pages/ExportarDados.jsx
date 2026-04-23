import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logohospital_cores.png';

export default function ExportarEstatisticas() {
  const navigate = useNavigate();
  const reportRef = useRef();

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
            <button className="logout-btn" onClick={handleLogout}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link">← Voltar</button>
      </nav>

      <hr className="divider" />

      <div className="export-actions">
        <button onClick={exportarExcel} className="btn-export btn-excel">
          Excel
        </button>
        <button onClick={exportarPDF} className="btn-export btn-pdf">
          PDF
        </button>
      </div>

      <main className="main-content list-page">
        <div className="container-1200 stats-page-container">
          
          {/* Filtros */}
          <div className="section-box filters-box">
            <div className="row filters-row">
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
              <div className="btn-container">
                <button onClick={carregarDados} className="btn-submit" style={{ padding: '10px 20px' }}>Filtrar</button>
              </div>
            </div>
          </div>

          {/* Área de Captura (O que sai no PDF) */}
          <div ref={reportRef} className="capture-area">
            
            {/* Widgets de Totais */}
            <div className="cards-grid">
              <Card titulo="Muito Bom" valor={totaisGerais.mb} cor="#2ecc71" />
              <Card titulo="Bom" valor={totaisGerais.b} cor="#3498db" />
              <Card titulo="Aceitável" valor={totaisGerais.a} cor="#f1c40f" />
              <Card titulo="Mau" valor={totaisGerais.m} cor="#e74c3c" />
              <Card titulo="Total" valor={totaisGerais.total} cor="#34495e" />
            </div>

            {/* Tabela de Visualização */}
            <table className="stats-table">
              <thead>
                <tr>
                  <th className="text-left">Indicador</th>
                  <th>MB</th>
                  <th>B</th>
                  <th>A</th>
                  <th>M</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {dados.map(p => (
                  <React.Fragment key={p.pergunta_id}>
                    <tr className="group-row">
                      <td colSpan="6">{p.titulo}</td>
                    </tr>
                    {p.indicadores.map((ind, idx) => (
                      <tr key={idx}>
                        <td>{ind.texto}</td>
                        <td className="text-center">{ind.mb}</td>
                        <td className="text-center">{ind.b}</td>
                        <td className="text-center">{ind.a}</td>
                        <td className="text-center">{ind.m}</td>
                        <td className="text-center text-bold">{ind.mb + ind.b + ind.a + ind.m}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
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

function Card({ titulo, valor, cor }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: cor }}>
      <div className="stat-card-title">{titulo}</div>
      <div className="stat-card-value" style={{ color: cor }}>{valor}</div>
    </div>
  );
}