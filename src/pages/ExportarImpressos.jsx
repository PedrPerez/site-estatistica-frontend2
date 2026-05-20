import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logohospital_cores.png';

export default function ExportarImpressos() {
  const navigate = useNavigate();
  const reportRef = useRef();

  // Estados
  const [userName, setUserName] = useState("Utilizador");
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]); // Guarda os tipos dinâmicos
  const [listaDados, setListaDados] = useState([]);  // Guarda as linhas por unidade
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ unidade: '', inicio: '', fim: '' });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    // Carregar o dropdown das unidades (usando a tua API existente)
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
      const response = await fetch(`http://localhost/API/estatisticaImpresso.php?${params}`);
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.erro || 'Erro ao carregar estatísticas');
      }

      // Atribuir os dados vindo da nova estrutura do PHP
      setCategorias(resData.categorias || []);
      setListaDados(resData.lista || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setCategorias([]);
      setListaDados([]);
    } finally {
      setLoading(false);
    }
  };

  // Formata o texto do cabeçalho esquerdo (Ex: "13-04-2023 a 18-05-2026 Serviço")
  const getPeriodoTexto = () => {
    const dataIn = filtros.inicio ? filtros.inicio.split('-').reverse().join('-') : 'Início';
    const dataFim = filtros.fim ? filtros.fim.split('-').reverse().join('-') : 'Fim';
    return `${dataIn} a ${dataFim} Serviço`;
  };

  const exportarExcel = () => {
    const periodoCabecalho = getPeriodoTexto();

    // 1. Criar a linha de cabeçalhos dinamicamente
    const cabecalho = [
      periodoCabecalho, 
      ...categorias.map(cat => cat.descricao)
    ];

    const matriz = [cabecalho];

    // 2. Preencher as linhas com as unidades e as suas contagens dinâmicas
    listaDados.forEach(linha => {
      const novaLinha = [linha.unidade_nome.toUpperCase()];
      
      // Para cada categoria ativa, vai buscar o valor correspondente gerado pelo SUM(CASE) do PHP
      categorias.forEach(cat => {
        const campoValor = `total_cat_${cat.id}`;
        novaLinha.push(parseInt(linha[campoValor]) || 0);
      });

      matriz.push(novaLinha);
    });

    // 3. Gerar folha de Excel
    const ws = XLSX.utils.aoa_to_sheet(matriz);
    const wb = XLSX.utils.book_new();
    
    // Configurar a largura das colunas: a 1ª coluna larga, as seguintes médias
    const larguras = [{ wch: 50 }]; // Largura para o nome do Serviço
    categorias.forEach(() => {
      larguras.push({ wch: 18 });   // Largura para as colunas de categorias
    });
    ws['!cols'] = larguras;

    XLSX.utils.book_append_sheet(wb, ws, "Estatísticas");
    XLSX.writeFile(wb, `Estatistica_Impressos_${filtros.unidade || 'Geral'}.xlsx`);
  };

  const exportarPDF = async () => {
    setLoading(true);
    try {
      const element = reportRef.current;
      if (!element) throw new Error("Elemento de relatório não encontrado");
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' para modo Paisagem (Landscape) para caber a grelha
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Estatistica_Impressos_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
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
          
          {/* Bloco de Filtros */}
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

          {/* Grelha / Tabela Visual igual à imagem */}
          <div ref={reportRef} className="capture-area" style={{ padding: '20px', background: '#fff' }}>
            <table className="stats-table" style={{ borderCollapse: 'collapse', width: '100%', color: '#000' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', border: '1px solid #000', padding: '10px', background: '#f9f9f9', fontSize: '13px' }}>
                    {getPeriodoTexto()}
                  </th>
                  {categorias.map(cat => (
                    <th key={cat.id} style={{ border: '1px solid #000', padding: '10px', background: '#f9f9f9', fontSize: '13px', textAlign: 'center' }}>
                      {cat.descricao}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listaDados.length > 0 ? listaDados.map((linha, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'left', fontSize: '13px' }}>
                      {linha.unidade_nome?.toUpperCase()}
                    </td>
                    {categorias.map(cat => {
                      const campoValor = `total_cat_${cat.id}`;
                      return (
                        <td key={cat.id} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontSize: '13px' }}>
                          {linha[campoValor] || 0}
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={categorias.length + 1} style={{ textAlign: 'center', padding: '20px', border: '1px solid #000' }}>
                      Nenhuns dados encontrados.
                    </td>
                  </tr>
                )}
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