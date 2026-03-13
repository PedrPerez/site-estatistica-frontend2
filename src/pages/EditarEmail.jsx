import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/InserirEmail.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function EditarEmail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({
    tipo: '', email: '', data: '', conteudo: '', nome: '', assunto: ''
  });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName)
    // Carregar tipos e dados do email atual
    Promise.all([
      fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json()),
      fetch('http://localhost/API/obterEmail.php').then(res => res.json())
    ]).then(([dataTipos, emails]) => {
      setTipos(dataTipos);
      const atual = emails.find(e => String(e.id_email) === id);
      if (atual) {
        setFormData({
          tipo: atual.cod_tipo,
          email: atual.email,
          data: atual.data.split(' ')[0],
          conteudo: atual.conteudo,
          nome: atual.nome,
          assunto: atual.assunto
        });
      }
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/API/editarEmail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_email: id })
      });
      const result = await response.json();
      if (result.status === 'sucesso') {
        alert("Atualizado!");
        navigate('/listar-email');
      }
    } catch (err) { alert("Erro ao atualizar"); }
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
            <button className="logout-btn" onClick={handleLogout}>
              Terminar Sessão
            </button>
          </div>
        </div>
      </header>
      
      <div className="main-content">
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <section className="section-box">
              <div className="row">
                <div className="input-group">
                  <label>Tipo:</label>
                  <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Data:</label>
                  <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                </div>
              </div>
              <div className="row">
                <div className="input-group grow"><label>Nome:</label>
                  <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
              </div>
              <div className="row">
                <div className="input-group grow"><label>Email:</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="input-group grow"><label>Assunto:</label>
                  <input type="text" value={formData.assunto} onChange={e => setFormData({...formData, assunto: e.target.value})} />
                </div>
              </div>
            </section>
            <section className="section-box no-padding">
              <h2 className="section-title gray-bg">Conteúdo:</h2>
              <textarea style={{width:'100%', minHeight:'150px', padding:'10px'}} value={formData.conteudo} onChange={e => setFormData({...formData, conteudo: e.target.value})} />
            </section>
            <div className="button-group">
              <button type="submit" className="btn-submit">Guardar</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/listar-email')}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}