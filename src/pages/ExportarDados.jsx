import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logohospital_cores.png';

export default function ExportarDados() {
  const navigate = useNavigate();
  const reportRef = useRef();

  // Estados
  const [userName, setUserName] = useState("Utilizador");
  const [unidades, setUnidades] = useState([]);
  const [dados, setDados] = useState([]);
  const [comentarios, setComentarios] = useState([]); // Novo estado
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
        
        // 1. Pedido das Estatísticas
        const responseEst = await fetch(`http://localhost/API/estatisticaQuestionario.php?${params}`);
        const resDataEst = await responseEst.json();
        
        if (!responseEst.ok) {
            throw new Error(resDataEst.erro || 'Erro ao carregar estatísticas');
        }
        
        setDados(Array.isArray(resDataEst) ? resDataEst : []);

        // 2. Pedido dos Comentários
        console.log("A chamar comentários com parâmetros:", params);
        const responseCom = await fetch(`http://localhost/API/obterComentario.php?${params}`);
        const resDataCom = await responseCom.json();
        
        console.log("Resposta bruta dos comentários:", resDataCom);

        if (!responseCom.ok) {
            throw new Error(resDataCom.erro || 'Erro ao carregar comentários');
        }

        // Processar comentários - cada linha é um objeto com sugestoes_comentarios
        if (Array.isArray(resDataCom)) {
            const listaComentarios = resDataCom
                .map(item => item.sugestoes_comentarios)
                .filter(txt => {
                    // Verificar se é string não vazia
                    if (typeof txt !== 'string') return false;
                    const trimmed = txt.trim();
                    // Filtrar vazios e conteúdo de teste
                    return trimmed !== '' && 
                           trimmed.toLowerCase() !== 'aaaaaa' &&
                           trimmed.toLowerCase() !== 'sugestoes_comentarios';
                });

            console.log("Comentários filtrados:", listaComentarios);
            setComentarios(listaComentarios);
        } else {
            console.warn("Resposta de comentários não é um array:", resDataCom);
            setComentarios([]);
        }

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Resetar estados em caso de erro
        setDados([]);
        setComentarios([]);
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

    // Adicionar Comentários ao Excel no fim
    if (comentarios.length > 0) {
      matriz.push(["SUGESTÕES E COMENTÁRIOS"]);
      comentarios.forEach((c, idx) => matriz.push([`${idx + 1}. ${c}`]));
    }

    const ws = XLSX.utils.aoa_to_sheet(matriz);
    const wb = XLSX.utils.book_new();
    ws['!cols'] = [{ wch: 60 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 12 }];

    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `Relatorio_${filtros.unidade || 'Geral'}.xlsx`);
  };

  const exportarPDF = async () => {
    setLoading(true);
    try {
        // Mostrar no console para debug
        console.log("Comentários disponíveis para PDF:", comentarios);
        console.log("Número de comentários:", comentarios.length);
        
        const element = reportRef.current;
        if (!element) {
            throw new Error("Elemento de relatório não encontrado");
        }
        
        const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Verificar se a imagem cabe numa página
        if (pdfHeight > pdf.internal.pageSize.getHeight()) {
            // Se for muito grande, ajustar
            const ratio = pdf.internal.pageSize.getHeight() / pdfHeight;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth * ratio, pdf.internal.pageSize.getHeight());
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        // Adicionar página de comentários
        if (comentarios.length > 0) {
            console.log("Adicionando página de comentários ao PDF");
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.text("Sugestões e Comentários", 15, 20);
            
            pdf.setFontSize(11);
            let yPos = 35;
            
            comentarios.forEach((txt, index) => {
                console.log(`Processando comentário ${index + 1}:`, txt.substring(0, 50));
                
                // Verificar espaço na página
                if (yPos > 260) {
                    pdf.addPage();
                    yPos = 20;
                }

                // Texto do comentário
                const textLines = pdf.splitTextToSize(`${index + 1}. ${txt}`, 180);
                pdf.text(textLines, 15, yPos);
                
                // Calcular novo Y baseado no número de linhas
                yPos += (textLines.length * 6) + 5; // 6mm por linha + 5mm de espaçamento
            });
            
            console.log("Página de comentários adicionada com sucesso");
        } else {
            console.warn("Nenhum comentário para adicionar ao PDF");
        }

        pdf.save(`Relatorio_${filtros.unidade || 'Geral'}_${new Date().toISOString().split('T')[0]}.pdf`);
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao gerar PDF. Verifique o console para mais detalhes.");
    } finally {
        setLoading(false);
    }
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
        <button onClick={exportarExcel} className="btn-export btn-excel" disabled={loading}>
          Excel
        </button>
        <button onClick={exportarPDF} className="btn-export btn-pdf" disabled={loading}>
          {loading ? 'A gerar...' : 'PDF'}
        </button>
      </div>

      <main className="main-content list-page">
        <div className="container-1200 stats-page-container">
          
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

          <div ref={reportRef} className="capture-area">
            <div className="cards-grid">
              <Card titulo="Muito Bom" valor={totaisGerais.mb} cor="#2ecc71" />
              <Card titulo="Bom" valor={totaisGerais.b} cor="#3498db" />
              <Card titulo="Aceitável" valor={totaisGerais.a} cor="#f1c40f" />
              <Card titulo="Mau" valor={totaisGerais.m} cor="#e74c3c" />
              <Card titulo="Total" valor={totaisGerais.total} cor="#34495e" />
            </div>

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