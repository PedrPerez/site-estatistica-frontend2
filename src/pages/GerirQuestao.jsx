import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

export default function GerirQuestoes() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para nova questão
  const [novoTitulo, setNovoTitulo] = useState("");
  const [listaIndicadores, setListaIndicadores] = useState([""]); 
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost/API/obterQuestaoAdmin.php');
      const data = await res.json();
      setQuestoes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCampoIndicador = () => setListaIndicadores([...listaIndicadores, ""]);
  
  const updateIndicador = (index, valor) => {
    const novaLista = [...listaIndicadores];
    novaLista[index] = valor;
    setListaIndicadores(novaLista);
  };

  const salvarQuestao = async () => {
    // 1. Validar antes de enviar
    if (!novoTitulo.trim()) {
        alert("Por favor, escreva a pergunta.");
        return;
    }

    // Filtrar indicadores vazios
    const indicadoresValidos = listaIndicadores.filter(i => i.trim() !== "");
    
    if (indicadoresValidos.length === 0) {
        alert("Adicione pelo menos um indicador (impresso).");
        return;
    }

    const payload = {
        titulo: novoTitulo,
        indicadores: indicadoresValidos
    };

    try {
        const res = await fetch('http://localhost/API/salvarQuestao.php', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' // OBRIGATÓRIO para o PHP ler via php://input
        },
        body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.status === 'sucesso') {
        alert("Questão e indicadores guardados com sucesso!");
        setNovoTitulo("");
        setListaIndicadores([""]);
        fetchData(); // Atualiza a lista em baixo
        } else {
        console.error("Erro do Servidor:", result.mensagem);
        alert("Erro ao guardar: " + result.mensagem);
        }
    } catch (err) {
        console.error("Erro na Requisição:", err);
        alert("Não foi possível contactar o servidor.");
    }
    };

  const toggleStatus = async (e, id, statusAtual) => {
    e.stopPropagation();
    const novoStatus = String(statusAtual) === "1" ? 0 : 1;

    try {
      const response = await fetch('http://localhost/API/alterarStatusQuestao.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: id, activo: novoStatus })
      });
      const result = await response.json();
      
      if (result.status === 'sucesso') {
        setQuestoes(prev => prev.map(q => q.id === id ? { ...q, activo: String(novoStatus) } : q));
      } else {
        alert("Erro: " + result.mensagem);
      }
    } catch (err) {
      alert("Erro na ligação ao servidor.");
    }
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
            <button className="logout-btn" onClick={handleLogout}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Página Principal</button>
      </nav>

      <hr className="divider" />

      <main className="main-content list-page" style={{padding: '20px'}}>
        <div className="container-1200">
          
          <section className="section-box" style={{border: '1px solid #007bff', padding: '20px', marginBottom: '30px'}}>
            <h3>Criar Nova Questão</h3>
            <div className="input-group">
              <label>Pergunta:</label>
              <input type="text" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} placeholder="Título da questão..." />
            </div>

            <div style={{marginTop: '15px'}}>
              <label><strong>Indicadores:</strong></label>
              {listaIndicadores.map((texto, idx) => (
                <input 
                  key={idx} 
                  type="text" 
                  value={texto} 
                  onChange={e => updateIndicador(idx, e.target.value)} 
                  placeholder={`Indicador ${idx+1}`} 
                  style={{display: 'block', width: '100%', marginBottom: '5px'}}
                />
              ))}
              <button onClick={addCampoIndicador} style={{cursor:'pointer'}}>+ Adicionar Indicador</button>
            </div>

            <button onClick={salvarQuestao} className="btn-edit-list" style={{marginTop: '15px', backgroundColor: '#28a745', color: '#fff'}}>GRAVAR TUDO</button>
          </section>

          <hr className="divider" />

          <h2>Gestão de Questões</h2>
          <div className="results-container">
            {questoes.map((q) => {
              const isActivo = String(q.activo) === "1";
              return (
                <div key={q.id} className="section-box list-item" style={{marginBottom: '10px', opacity: isActivo ? 1 : 0.6}}>
                  <div 
                    className="clickable-header"
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', cursor: 'pointer', alignItems: 'center' }}
                  >
                    <span><strong>#{q.id}</strong> | {q.titulo}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={(e) => toggleStatus(e, q.id, q.activo)}
                        style={{ 
                          backgroundColor: isActivo ? "#d4edda" : "#f8d7da", 
                          color: isActivo ? "#155724" : "#721c24",
                          padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc'
                        }}
                      >
                        {isActivo ? "● ATIVA" : "○ INATIVA"}
                      </button>
                      <span>{expandedId === q.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expandedId === q.id && (
                    <div style={{ padding: '15px', background: '#f9f9f9', borderTop: '1px solid #eee' }}>
                      <strong>Lista de Indicadores:</strong>
                      <ul>
                        {q.indicadores.map(ind => <li key={ind.id}>{ind.texto}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
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