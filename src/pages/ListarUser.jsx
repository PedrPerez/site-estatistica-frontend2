import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

export default function ListarUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [registos, setRegistos] = useState([]);
  const [menus, setMenus] = useState([]); // Todos os menus possíveis
  const [userPermissions, setUserPermissions] = useState({}); // Permissões do user expandido
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({ nome: '', categoria: '' });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    fetchData();
    fetchMenus();
  }, []);

  // 1. Carrega utilizadores
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost/API/obterUser.php');
      const data = await res.json();
      setRegistos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Carrega todos os menus disponíveis no sistema
  const fetchMenus = async () => {
    try {
      const res = await fetch('http://localhost/API/obterMenu.php');
      const data = await res.json();
      setMenus(data);
    } catch (err) {
      console.error("Erro ao carregar menus:", err);
    }
  };

  // 3. Carrega as permissões de um utilizador específico ao expandir
  const handleExpand = async (iduser) => {
    if (expandedId === iduser) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(iduser);
    try {
      const res = await fetch(`http://localhost/API/obterPermissoesUser.php?iduser=${iduser}`);
      const data = await res.json();
      // Transformamos a lista de permissões num objeto para busca rápida: { idmenu: true/false }
      const permsMap = {};
      data.forEach(p => { permsMap[p.idmenu] = String(p.activo) === "1"; });
      setUserPermissions(permsMap);
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
    }
  };

  // 4. Altera a permissão na BD
  const togglePermission = async (iduser, idmenu, estadoAtual) => {
    const novoEstado = estadoAtual ? 0 : 1;

    try {
      const response = await fetch('http://localhost/API/alterarPermissao.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ iduser, idmenu, activo: novoEstado })
      });

      const result = await response.json();
      if (result.status === 'sucesso') {
        setUserPermissions(prev => ({ ...prev, [idmenu]: !estadoAtual }));
      }
    } catch (err) {
      alert("Erro ao comunicar com o servidor.");
    }
  };

  // ... (Mantenha a função toggleStatus e lógica de filtros igual ao seu original)
  const toggleStatus = async (e, iduser, statusAtual) => {
    e.stopPropagation();
    const novoStatus = String(statusAtual) === "1" ? 0 : 1;
    try {
      const response = await fetch('http://localhost/API/alterarStatusUser.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ iduser: iduser, activo: novoStatus })
      });
      const result = await response.json();
      if (result.status === 'sucesso') {
        setRegistos(prev => prev.map(user => 
          user.iduser === iduser ? { ...user, activo: String(novoStatus) } : user
        ));
      }
    } catch (err) { console.error(err); }
  };

  const getCategoriaNome = (id) => {
    const nomes = { "1": "Admin", "7": "Funcionário", "9": "Geral" };
    return nomes[String(id)] || "Desconhecido";
  };

  const resultadosFiltrados = registos.filter(item => {
    const correspondeNome = formData.nome === '' || 
      (item.nome && item.nome.toLowerCase().includes(formData.nome.toLowerCase())) ||
      (item.username && item.username.toLowerCase().includes(formData.nome.toLowerCase()));
    const correspondeCategoria = formData.categoria === '' || String(item.idcategoria) === formData.categoria;
    return correspondeNome && correspondeCategoria;
  });

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

      <main className="main-content list-page">
        <div className="container-1200">
          {/* Box de Filtros aqui... */}
          <div className="results-container">
            {resultadosFiltrados.map((item) => {
              const isActivo = String(item.activo) === "1";

              return (
                <div key={item.iduser} className="section-box list-item" style={{marginBottom: '10px', border: '1px solid #eee'}}>
                  <div 
                    className="clickable-header"
                    onClick={() => handleExpand(item.iduser)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', cursor: 'pointer', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>
                      <strong>#{item.iduser}</strong> | {item.nome} <small style={{color: '#666'}}>@{item.username}</small>
                    </span>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <button 
                        onClick={(e) => toggleStatus(e, item.iduser, item.activo)}
                        style={{ 
                          backgroundColor: isActivo ? "#d4edda" : "#f8d7da", 
                          color: isActivo ? "#155724" : "#721c24",
                          border: `1px solid ${isActivo ? "#c3e6cb" : "#f5c6cb"}`,
                          padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', minWidth: '100px'
                        }}
                      >
                        {isActivo ? "● ATIVO" : "○ INATIVO"}
                      </button>
                      <span>{expandedId === item.iduser ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expandedId === item.iduser && (
                    <div className="expanded-content" style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <h4>Dados do Utilizador</h4>
                          <p><strong>Username:</strong> {item.username}</p>
                          <p><strong>Categoria:</strong> {getCategoriaNome(item.idcategoria)}</p>
                        </div>

                        {/* SECÇÃO DE PERMISSÕES */}
                        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                          <h4 style={{ marginTop: 0, borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Gestão de Acessos</h4>
                          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                            {menus.map(menu => (
                              <label key={menu.idmenu} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input 
                                  type="checkbox" 
                                  checked={!!userPermissions[menu.idmenu]} 
                                  onChange={() => togglePermission(item.iduser, menu.idmenu, userPermissions[menu.idmenu])}
                                  style={{ marginRight: '10px', width: '18px', height: '18px' }}
                                />
                                {menu.descmenu}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}