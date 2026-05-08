import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

export default function ListarUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [registos, setRegistos] = useState([]);
  const [menus, setMenus] = useState([]); 
  const [userPermissions, setUserPermissions] = useState({}); 
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

  const fetchMenus = async () => {
    try {
      const res = await fetch('http://localhost/API/obterMenu.php');
      const data = await res.json();
      setMenus(data);
    } catch (err) {
      console.error("Erro ao carregar menus:", err);
    }
  };

  const handleExpand = async (iduser) => {
    if (expandedId === iduser) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(iduser);
    try {
      const res = await fetch(`http://localhost/API/obterPermissoesUser.php?iduser=${iduser}`);
      const data = await res.json();
      const permsMap = {};
      data.forEach(p => { permsMap[p.idmenu] = String(p.activo) === "1"; });
      setUserPermissions(permsMap);
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
    }
  };

  // 4. Alteração de Permissão com bloqueio para Categoria 1
  const togglePermission = async (user, idmenu, estadoAtual) => {
    // Bloqueio preventivo no Front-end
    if (String(user.idcategoria) === "1") {
      alert("Não é permitido alterar permissões de um Administrador.");
      return;
    }

    const novoEstado = estadoAtual ? 0 : 1;

    try {
      const response = await fetch('http://localhost/API/alterarPermissao.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ iduser: user.iduser, idmenu, activo: novoEstado })
      });

      const result = await response.json();
      if (result.status === 'sucesso') {
        setUserPermissions(prev => ({ ...prev, [idmenu]: !estadoAtual }));
      } else {
        alert(result.mensagem);
      }
    } catch (err) {
      alert("Erro ao comunicar com o servidor.");
    }
  };

  // 5. Alteração de Status com bloqueio para Categoria 1
  const toggleStatus = async (e, item) => {
    e.stopPropagation();

    if (String(item.idcategoria) === "1") {
      alert("Por motivos de segurança, não pode desativar um Administrador do sistema.");
      return;
    }

    const novoStatus = String(item.activo) === "1" ? 0 : 1;
    try {
      const response = await fetch('http://localhost/API/alterarStatusUser.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ iduser: item.iduser, activo: novoStatus })
      });
      const result = await response.json();
      if (result.status === 'sucesso') {
        setRegistos(prev => prev.map(u => 
          u.iduser === item.iduser ? { ...u, activo: String(novoStatus) } : u
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
    localStorage.clear();
    navigate("/login");
  };

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
        <button onClick={() => navigate('/principal')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Página Principal</button>
      </nav>
    
      <hr className="divider" />

      <main className="main-content list-page">
        <div className="container-1200">
          
          <div className="results-container">
            {resultadosFiltrados.map((item) => {
              const isActivo = String(item.activo) === "1";
              const isAdmin = String(item.idcategoria) === "1";

              return (
                <div key={item.iduser} className="section-box list-item" style={{marginBottom: '10px', border: isAdmin ? '1px solid #007bff' : '1px solid #eee'}}>
                  <div 
                    className="clickable-header"
                    onClick={() => handleExpand(item.iduser)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', cursor: 'pointer', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>
                      <strong>#{item.iduser}</strong> | {item.nome} 
                      {isAdmin && <span style={{ marginLeft: '10px', fontSize: '0.8rem', backgroundColor: '#007bff', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>SISTEMA</span>}
                      <br/>
                      <small style={{color: '#666'}}>@{item.username}</small>
                    </span>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <button 
                        onClick={(e) => toggleStatus(e, item)}
                        disabled={isAdmin}
                        style={{ 
                          backgroundColor: isAdmin ? "#e9ecef" : (isActivo ? "#d4edda" : "#f8d7da"), 
                          color: isAdmin ? "#6c757d" : (isActivo ? "#155724" : "#721c24"),
                          border: `1px solid ${isActivo ? "#c3e6cb" : "#f5c6cb"}`,
                          padding: '6px 14px', borderRadius: '4px', 
                          cursor: isAdmin ? 'not-allowed' : 'pointer', 
                          minWidth: '100px',
                          fontWeight: 'bold'
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
                          {isAdmin && <p style={{color: '#d9534f', fontSize: '0.85rem'}}>* Contas de administrador não podem ser editadas.</p>}
                        </div>

                        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', opacity: isAdmin ? 0.7 : 1 }}>
                          <h4 style={{ marginTop: 0, borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>
                            Gestão de Acessos {isAdmin && "(Bloqueado)"}
                          </h4>
                          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                            {menus.map(menu => (
                              <label key={menu.idmenu} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginBottom: '8px', 
                                cursor: isAdmin ? 'not-allowed' : 'pointer', 
                                fontSize: '0.9rem',
                                color: isAdmin ? '#999' : '#000'
                              }}>
                                <input 
                                  type="checkbox" 
                                  checked={isAdmin ? true : !!userPermissions[menu.idmenu]} 
                                  disabled={isAdmin}
                                  onChange={() => togglePermission(item, menu.idmenu, userPermissions[menu.idmenu])}
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