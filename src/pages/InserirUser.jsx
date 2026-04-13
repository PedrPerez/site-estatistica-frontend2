import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/InserirEmail.css'; 
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png'; 

export default function InserirUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nome: '',
    idcategoria: '9',
    pin: '',
    activo: '1'
  });

  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Alteração: Garante que idcategoria seja tratado como número
    const val = name === "idcategoria" ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.nome) {
      setStatus({ type: 'error', msg: 'Por favor, preencha o Usuário, Senha e Nome.' });
      return;
    }

    try {
      const response = await fetch('http://localhost/API/salvarUser.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData)
      });

      const result = await response.json();
      if (result.status === 'sucesso') {
        setStatus({ type: 'success', msg: result.mensagem });
        // Alteração: Reset para o valor padrão '9'
        setFormData({ username: '', password: '', nome: '', idcategoria: '9', pin: '', activo: '1' });
      } else {
        setStatus({ type: 'error', msg: result.mensagem });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Erro na ligação ao servidor.' });
    }
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
        <button onClick={() => navigate('/principal-admin')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Página Principal</button>
        <button onClick={() => navigate('/listar-user')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>Listar Utilizadores →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
            
            <section className="section-box">
              <h2 className="section-title">Criar Novo Utilizador</h2>
              
              {status.msg && (
                <div style={{ 
                  padding: '10px', 
                  borderRadius: '4px',
                  backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: status.type === 'success' ? '#155724' : '#721c24', 
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  {status.msg}
                </div>
              )}

              <div className="row">
                <div className="input-group grow">
                  <label>Nome Completo:</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange}/>
                </div>
                {/* ALTERAÇÃO AQUI: De input number para select */}
                <div className="input-group">
                  <label>Nível de Acesso:</label>
                  <select name="idcategoria" value={formData.idcategoria} onChange={handleChange}>
                    <option value="1">Admin</option>
                    <option value="7">Funcionário</option>
                    <option value="9">Geral</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="input-group grow">
                  <label>Username:</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange}/>
                </div>
                <div className="input-group grow">
                  <label>Password:</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} />
                </div>
              </div>

              <div className="row">
                <div className="input-group">
                  <label>PIN (Opcional):</label>
                  <input type="text" name="pin" value={formData.pin} onChange={handleChange} maxLength="4" />
                </div>
                <div className="input-group">
                  <label>Estado:</label>
                  <select name="activo" value={formData.activo} onChange={handleChange}>
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="button-group">
              <button type="submit" className="btn-submit">Criar Utilizador</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/principal-admin')}>Cancelar</button>
            </div>
        </form>
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