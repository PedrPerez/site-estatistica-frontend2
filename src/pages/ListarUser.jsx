import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

export default function ListarUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [registos, setRegistos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: ''
  });

  const [expandedId, setExpandedId] = useState(null);

  // Mapeamento visual para as categorias
  const getCategoriaNome = (id) => {
    const nomes = { "1": "Admin", "7": "Funcionário", "9": "Geral" };
    return nomes[String(id)] || "Desconhecido";
  };

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost/API/obterUser.php');
      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
      const data = await res.json();
      setRegistos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para alterar o estado Ativo/Inativo na DB e atualizar o estado local
  const toggleStatus = async (e, iduser, statusAtual) => {
    e.stopPropagation(); // Impede que a linha expanda ao clicar no botão
    
    // Inverte o status: se é "1" vira 0, se é "0" vira 1
    const novoStatus = String(statusAtual) === "1" ? 0 : 1;

    try {
      const response = await fetch('http://localhost/API/alterarStatusUser.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          iduser: iduser,
          activo: novoStatus
        })
      });

      const result = await response.json();

      if (result.status === 'sucesso') {
        setRegistos(prev => prev.map(user => 
          user.iduser === iduser ? { ...user, activo: String(novoStatus) } : user
        ));
      } else {
        alert("Erro ao alterar status: " + result.mensagem);
      }
    } catch (err) {
      console.error("Erro na ligação:", err);
      alert("Erro na ligação ao servidor.");
    }
  };

  const resultadosFiltrados = registos.filter(item => {
    const correspondeNome = formData.nome === '' || 
      (item.nome && item.nome.toLowerCase().includes(formData.nome.toLowerCase())) ||
      (item.username && item.username.toLowerCase().includes(formData.nome.toLowerCase()));
    
    const correspondeCategoria = formData.categoria === '' || 
      String(item.idcategoria) === formData.categoria;

    return correspondeNome && correspondeCategoria;
  });

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  if (loading) return <div className="page-wrapper" style={{textAlign:'center', padding:'50px'}}><h3>A carregar utilizadores...</h3></div>;
  if (error) return <div className="page-wrapper" style={{textAlign:'center', padding:'50px', color:'red'}}><h3>Erro: {error}</h3></div>;

  return (
    <div className="page-wrapper">
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
        <button onClick={() => navigate('/principal-admin')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Página Principal</button>
      </nav>

      <hr className="divider" />

      <main className="main-content list-page">
        <div className="container-1200">
          <div className="filter-header">
            <span className="filter-title">Filtros de Utilizadores:</span>
            <button onClick={() => setFormData({nome:'', categoria:''})} className="clean-filters">Limpar Filtros</button>
          </div>

          <section className="section-box filter-box">
            <div className="row">
              <div className="input-group grow">
                <label>Pesquisar (Nome ou Username):</label>
                <input 
                  type="text" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  placeholder="Ex: ana, admin, mregado..." 
                />
              </div>
              <div className="input-group grow">
                <label>Categoria:</label>
                <select 
                  value={formData.categoria} 
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                >
                  <option value="">Todas as Categorias</option>
                  <option value="1">Admin</option>
                  <option value="7">Funcionário</option>
                  <option value="9">Geral</option>
                </select>
              </div>
            </div>
          </section>

          <h2 className="results-count">Utilizadores Encontrados: {resultadosFiltrados.length}</h2>

          <div className="results-container">
            {resultadosFiltrados.map((item) => {
              // Verificação de sincronia: Garantimos que o estado visual segue o valor da DB
              const isActivo = String(item.activo) === "1";

              return (
                <div key={item.iduser} className="section-box list-item" style={{marginBottom: '10px', border: '1px solid #eee'}}>
                  <div 
                    className="clickable-header"
                    onClick={() => setExpandedId(expandedId === item.iduser ? null : item.iduser)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', cursor: 'pointer', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>
                      <strong>#{item.iduser}</strong> | {item.nome} <small style={{color: '#666'}}>@{item.username}</small>
                    </span>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      
                      {/* BOTÃO SYNCED COM A DB */}
                      <button 
                        onClick={(e) => toggleStatus(e, item.iduser, item.activo)}
                        style={{ 
                          backgroundColor: isActivo ? "#d4edda" : "#f8d7da", 
                          color: isActivo ? "#155724" : "#721c24",
                          border: `1px solid ${isActivo ? "#c3e6cb" : "#f5c6cb"}`,
                          padding: '6px 14px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          minWidth: '100px'
                        }}
                        title="Clique para alternar estado"
                      >
                        {isActivo ? "● ATIVO" : "○ INATIVO"}
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/editar-user/${item.iduser}`); }}
                        className="btn-edit-list"
                      >
                        EDITAR
                      </button>
                      <span>{expandedId === item.iduser ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expandedId === item.iduser && (
                    <div className="expanded-content" style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                      <div className="row" style={{ display: 'flex', gap: '40px' }}>
                        <div>
                          <p><strong>Username:</strong> {item.username}</p>
                          <p><strong>Nome Completo:</strong> {item.nome}</p>
                        </div>
                        <div>
                          <p><strong>Categoria:</strong> {getCategoriaNome(item.idcategoria)}</p>
                          <p><strong>PIN:</strong> {item.pin || <i style={{color: '#999'}}>Sem PIN definido</i>}</p>
                          <p><strong>Estado Atual:</strong> {isActivo ? "Conta Habilitada" : "Conta Suspensa"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {resultadosFiltrados.length === 0 && (
              <p style={{textAlign:'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px'}}>
                Nenhum utilizador encontrado para estes filtros.
              </p>
            )}
          </div>
        </div>
      </main>
      <footer className="footer-minimal">
        <div className="footer-content">
          <div className="footer-info">
            <span className="hospital-name">Hospital de Esposende</span>
            <span className="hospital-sub">Valentim Ribeiro</span>
          </div>
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} — Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}