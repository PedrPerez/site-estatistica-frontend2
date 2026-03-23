import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/InserirImpresso.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function InserirImpresso() {
  const [unidades, setUnidades] = useState([]);
  const [userName, setUserName] = useState("Utilizador");
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
      .catch(err => console.error("Erro:", err));
      
    fetch('http://localhost/API/obterTipoMensagem.php')
      .then(res => res.json())
      .then(data => setTipos(data))
      .catch(err => console.error("Erro:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!formData.tipo || !formData.unidade || !formData.nome || !formData.descritivo) {
      setError('Preencha os campos obrigatórios (Nome, Unidade, Tipo e Descritivo).');
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
        window.scrollTo(0, 0); // Volta ao topo para ver a mensagem
      } else {
        setError(result.mensagem || 'Erro ao inserir registo.');
      }
    } catch (err) {
      setError('Não foi possível contactar o servidor.');
    }
  };

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('userName'); navigate("/login"); }}>
              Terminar Sessão
            </button>
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
          
          {error && <div className="status-msg error" style={{color: 'red', textAlign: 'center', marginBottom: '15px'}}>{error}</div>}
          {success && <div className="status-msg success" style={{color: 'green', textAlign: 'center', marginBottom: '15px'}}>{success}</div>}

          {/* Identificação */}
          <section className="section-box">
            <h2 className="section-title">Identificação</h2>
            <div className="row">
              <div className="input-group grow">
                <label>Nome:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome completo" />
              </div>
              <div className="input-group">
                <label>Data:</label>
                <input type="date" name="data" value={formData.data} onChange={handleChange} />
              </div>
            </div>
            <div className="row" style={{ paddingTop: 0 }}>
              <div className="input-group grow">
                <label>Morada:</label>
                <input type="text" name="morada" value={formData.morada} onChange={handleChange} placeholder="Morada completa" />
              </div>
            </div>
          </section>

          {/* Tipo e Unidade */}
          <section className="section-box">
            <div className="row">
              <div className="input-group grow">
                <label>Tipo:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="">Seleccione o Tipo</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </div>
              <div className="input-group grow">
                <label>Unidade:</label>
                <select name="unidade" value={formData.unidade} onChange={handleChange}>
                  <option value="">Seleccione a Unidade</option>
                  {unidades.map(u => <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="section-box">
            <h2 className="section-title">Contacto</h2>
            <div className="row">
              <div className="input-group grow">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemplo@email.com" />
              </div>
              <div className="input-group grow">
                <label>Telemóvel:</label>
                <input type="text" name="tel" value={formData.tel} onChange={handleChange} placeholder="9xxxxxxxx" />
              </div>
            </div>
          </section>

          {/* Descritivo e Resolução */}
          <section className="section-box no-padding">
            <h2 className="section-title gray-bg">Descritivo:</h2>
            <div className="textarea-container">
              <textarea name="descritivo" value={formData.descritivo} onChange={handleChange} placeholder="Detalhes da ocorrência..." />
            </div>
          </section>

          <section className="section-box no-padding">
            <h2 className="section-title gray-bg">Resolução:</h2>
            <div className="textarea-container">
              <textarea name="resolucao" value={formData.resolucao} onChange={handleChange} placeholder="Ações tomadas..." />
            </div>
          </section>

          <div className="button-group">
            <button type="submit" className="btn-submit">Submeter Registo</button>
            <button type="button" className="btn-cancel" onClick={() => setFormData(initialForm)}>Limpar Campos</button>
          </div>
        </form>
      </main>
    </div>
  );
}