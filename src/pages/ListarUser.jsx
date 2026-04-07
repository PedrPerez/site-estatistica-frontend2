import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ListarImpresso.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function ListarUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [registos, setRegistos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '' // Alterado de 'tipo' para 'categoria'
  });

  const [expandedId, setExpandedId] = useState(null);

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

  const resultadosFiltrados = registos.filter(item => {
    const correspondeNome = formData.nome === '' || 
      (item.nome && item.nome.toLowerCase().includes(formData.nome.toLowerCase())) ||
      (item.username && item.username.toLowerCase().includes(formData.nome.toLowerCase()));
    
    const correspondeCategoria = formData.categoria === '' || 
      String(item.idcategoria) === formData.categoria;

    return correspondeNome && correspondeCategoria;
  });

  if (loading) return <div className="page-wrapper" style={{textAlign:'center', padding:'50px'}}><h3>A carregar...</h3></div>;
  if (error) return <div className="page-wrapper" style={{textAlign:'center', padding:'50px', color:'red'}}><h3>Erro: {error}</h3></div>;

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Hospital Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={() => navigate("/login")}>Sair</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal-admin')} className="nav-link">← Página Principal</button>
      </nav>

      <hr className="divider" />

      <main className="main-content list-page">
        <div className="container-1200">
          <div className="filter-header">
            <span className="filter-title">Filtros de Utilizadores:</span>
            <button onClick={() => setFormData({nome:'', categoria:''})} className="clean-filters">Limpar</button>
          </div>

          <section className="section-box filter-box">
            <div className="row">
              <div className="input-group grow">
                <label>Pesquisar (Nome ou Username):</label>
                <input 
                  type="text" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  placeholder="Nome..." 
                />
              </div>
              <div className="input-group grow">
                <label>Categoria ID:</label>
                <input 
                  type="number" 
                  value={formData.categoria} 
                  onChange={e => setFormData({...formData, categoria: e.target.value})} 
                  placeholder="Filtrar por ID Categoria"
                />
              </div>
            </div>
          </section>

          <h2 className="results-count">Utilizadores Encontrados: {resultadosFiltrados.length}</h2>

          <div className="results-container">
            {resultadosFiltrados.map((item) => (
              <div key={item.iduser} className="section-box list-item">
                <div 
                  className="clickable-header"
                  onClick={() => setExpandedId(expandedId === item.iduser ? null : item.iduser)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', cursor: 'pointer', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '1.1rem' }}>
                    <strong>#{item.iduser}</strong> | {item.nome} <small>({item.username})</small>
                  </span>
                  
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ color: item.activo === "1" ? "green" : "red", fontWeight: "bold", fontSize: "0.9rem" }}>
                      {item.activo === "1" ? "ATIVO" : "INATIVO"}
                    </span>
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
                  <div className="expanded-content" style={{ padding: '20px', borderTop: '1px solid #ccc', backgroundColor: '#fdfdfd' }}>
                    <div className="row" style={{ display: 'flex', gap: '40px' }}>
                      <div>
                        <p><strong>Username:</strong> {item.username}</p>
                        <p><strong>Nome Completo:</strong> {item.nome}</p>
                      </div>
                      <div>
                        <p><strong>ID Categoria:</strong> {item.idcategoria}</p>
                        <p><strong>PIN:</strong> {item.pin || <i style={{color: '#999'}}>Sem PIN definido</i>}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}