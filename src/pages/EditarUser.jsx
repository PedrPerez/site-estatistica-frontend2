import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

export default function EditarUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  
  const [formData, setFormData] = useState({
    iduser: '',
    username: '',
    nome: '',
    password: '', // Deixar vazio se não quiser alterar
    idcategoria: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    // Carregar os dados do utilizador específico
    fetch(`http://localhost/API/obterUser.php`)
      .then(res => res.json())
      .then(data => {
        const user = data.find(u => String(u.iduser) === id);
        if (user) {
          setFormData({
            iduser: user.iduser,
            username: user.username,
            nome: user.nome,
            password: '', // Password não é puxada por segurança
            idcategoria: user.idcategoria
          });
        }
      })
      .catch(err => setError("Erro ao carregar dados do utilizador."));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!window.confirm("Deseja guardar as alterações deste utilizador?")) return;

    try {
      const response = await fetch('http://localhost/API/editarUser.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const res = await response.json();
      
      if (res.status === 'sucesso') {
        setSuccess('Utilizador atualizado com sucesso!');
        setTimeout(() => navigate('/listar-user'), 1500);
      } else {
        setError(res.mensagem || 'Erro ao atualizar.');
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Hospital Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('userName'); navigate("/login"); }}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/listar-user')} className="nav-link">← Voltar à Lista</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
          <h2 className="section-title">Editar Perfil de Utilizador #{id}</h2>
          
          {error && <div className="status-msg error" style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
          {success && <div className="status-msg success" style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{success}</div>}

          <section className="section-box">
            <div className="row">
              <div className="input-group grow">
                <label>Username (Não editável):</label>
                <input type="text" value={formData.username} disabled style={{ backgroundColor: '#f0f0f0' }} />
              </div>
              <div className="input-group grow">
                <label>Nome Completo:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>
            </div>

            <div className="row">
              <div className="input-group grow">
                <label>Nova Password (deixe vazio para não alterar):</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="******" />
              </div>
              <div className="input-group grow">
                <label>Cargo / Categoria:</label>
                <select name="idcategoria" value={formData.idcategoria} onChange={handleChange} required>
                  <option value="">Seleccione o Cargo</option>
                  <option value="1">Admin</option>
                  <option value="7">Funcionário</option>
                  <option value="9">Geral</option>
                </select>
              </div>
            </div>
          </section>

          <div className="button-group">
            <button type="submit" className="btn-submit">Guardar Alterações</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/listar-user')}>Cancelar</button>
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