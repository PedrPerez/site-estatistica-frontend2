import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

export default function InserirImpresso() {
  const [unidades, setUnidades] = useState([]);
  const [userName, setUserName] = useState("Utilizador");
  const today = new Date().toISOString().split('T')[0];
  const [tipos, setTipos] = useState([]);
  const navigate = useNavigate();
  
  const initialForm = {
    nome: '',
    data: new Date().toISOString().split('T')[0], 
    morada: '',
    tipo: '',
    unidade: '',
    email: '',
    tel: '',
    descritivo: '',
    resolucao: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    
    fetch('http://localhost/API/obterUnidade.php')
      .then(res => res.json())
      .then(data => setUnidades(data))
      .catch(err => console.error("Erro ao carregar unidades:", err));
      
    fetch('http://localhost/API/obterTipoMensagem.php')
      .then(res => res.json())
      .then(data => setTipos(data))
      .catch(err => console.error("Erro ao carregar tipos:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!formData.tipo || !formData.unidade || !formData.nome || !formData.descritivo) {
      setError('Campos obrigatórios: Nome, Unidade, Tipo e Descritivo.');
      return;
    }

    try {
      const response = await fetch('http://localhost/API/salvarImpresso.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ...formData, utilizador_registo: userName })
      });

      const result = await response.json();
      if (result.status === 'sucesso') {
        setSuccess('Registo inserido com sucesso!');
        setFormData(initialForm);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave para o topo
      } else {
        setError(result.mensagem || 'Erro ao inserir registo.');
      }
    } catch (err) {
      setError('Erro na ligação ao servidor.');
    }
  };

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('userName'); navigate("/login"); }}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/principal')} className="nav-link">← Página Principal</button>
        <button onClick={() => navigate('/listar-impresso')} className="nav-link">Listar Impresso →</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
          
          {/* Feedback Visual Centralizado */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="status-msg" style={{color: 'green', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px'}}>{success}</div>}

          {/* Secção Identificação */}
          <section className="section-box">
            <h2 className="section-title">Identificação</h2>
            <div className="row">
              <div className="input-group grow">
                <label>Nome:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome do utente" />
              </div>
              <div className="input-group grow">
                <label>Morada:</label>
                <input type="text" name="morada" value={formData.morada} onChange={handleChange} placeholder="Morada completa" />
              </div>
              <div className="input-group">
                <label>Data:</label>
                <input type="date" name="data" value={formData.data} max={today} onChange={handleChange} />
              </div>
            </div>
  
            <div className="row">
              <div className="input-group grow">
                <label>Tipo:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="">Selecione o Tipo...</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </div>
              <div className="input-group grow">
                <label>Unidade:</label>
                <select name="unidade" value={formData.unidade} onChange={handleChange}>
                  <option value="">Selecione a Unidade...</option>
                  {unidades.map(u => <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="section-box">
            <h2 className="section-title">Contacto</h2>
            <div className="row">
              <div className="input-group grow">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemplo@email.com" />
              </div>
              <div className="input-group grow">
                <label>Telemóvel:</label>
                <input type="text" name="tel" value={formData.tel} onChange={handleChange} placeholder="Nº Telefone" />
              </div>
            </div>
          </section>

          <section className="section-box">
            <h2 className="section-title">Descritivo:</h2>
            <div className="textarea-container">
              <textarea name="descritivo" value={formData.descritivo} onChange={handleChange} placeholder="Escreva aqui os detalhes..." />
            </div>
          </section>

          <section className="section-box">
            <h2 className="section-title">Resolução:</h2>
            <div className="textarea-container">
              <textarea name="resolucao" value={formData.resolucao} onChange={handleChange} placeholder="Ações tomadas para resolver..." />
            </div>
          </section>

          <div className="button-group">
            <button type="submit" className="btn-submit">Submeter</button>
            <button type="button" className="btn-cancel" onClick={() => setFormData(initialForm)}>Limpar</button>
          </div>
        </form>
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