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
    tipo: '',
    email: '',
    data: '',
    conteudo: '',
    nome: '',
    assunto: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    // Carregar tipos de mensagem e dados do email específico
    Promise.all([
      fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json()),
      fetch('http://localhost/API/obterEmail.php').then(res => res.json())
    ])
      .then(([dataTipos, emails]) => {
        setTipos(dataTipos);
        const atual = emails.find(e => String(e.id_email) === id);
        if (atual) {
          setFormData({
            tipo: atual.cod_tipo || '',
            email: atual.email || '',
            data: atual.data ? atual.data.split(' ')[0] : '',
            conteudo: atual.conteudo || '',
            nome: atual.nome || '',
            assunto: atual.assunto || ''
          });
        }
      })
      .catch(err => setError("Erro ao carregar dados do email."));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost/API/editarEmail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_email: id })
      });
      
      const result = await response.json();
      if (result.status === 'sucesso') {
        setSuccess('Email atualizado com sucesso!');
        setTimeout(() => navigate('/listar-email'), 1500);
      } else {
        setError(result.mensagem || 'Erro ao atualizar email.');
      }
    } catch (err) {
      setError("Não foi possível contactar o servidor.");
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
            <button className="logout-btn" onClick={handleLogout}>
              Terminar Sessão
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/listar-email')} className="nav-link" style={{background:'none', border:'none', cursor:'pointer'}}>← Voltar à Lista</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
          
          {/* Feedback */}
          {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
          {success && <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>{success}</div>}

          {/* Secção Identificação do Email */}
          <section className="section-box">
            <h2 className="section-title">Dados do Email</h2>
            
            <div className="row">
              <div className="input-group grow">
                <label>Nome do Remetente:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Data:</label>
                <input type="date" name="data" value={formData.data} onChange={handleChange} />
              </div>
            </div>

            <div className="row" style={{ paddingTop: 0 }}>
              <div className="input-group grow">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              
              <div className="input-group">
                <label>Tipo:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="">Seleccione o Tipo</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.descricao}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Secção Assunto */}
          <section className="section-box">
            <div className="row">
              <div className="input-group grow">
                <label>Assunto:</label>
                <input type="text" name="assunto" value={formData.assunto} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Secção Conteúdo */}
          <section className="section-box no-padding">
            <h2 className="section-title gray-bg">Conteúdo do Email:</h2>
            <div className="textarea-container">
              <textarea 
                name="conteudo" 
                value={formData.conteudo} 
                onChange={handleChange}
                style={{ minHeight: '200px' }}
              />
            </div>
          </section>

          {/* Botões de Ação */}
          <div className="button-group">
            <button type="submit" className="btn-submit">Atualizar Email</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/listar-email')}>Cancelar</button>
          </div>
        </form>
      </main>
    </div>
  );
}