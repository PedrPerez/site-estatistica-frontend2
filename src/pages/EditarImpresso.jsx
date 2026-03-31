import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/InserirImpresso.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function EditarImpresso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilizador");
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    data: '',
    morada: '',
    tipo: '',
    unidade: '',
    email: '',
    tel: '',
    descritivo: '',
    resolucao: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    Promise.all([
      fetch('http://localhost/API/obterUnidade.php').then(res => res.json()),
      fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json()),
      fetch(`http://localhost/API/obterImpresso.php`).then(res => res.json())
    ])
      .then(([u, t, impressos]) => {
        setUnidades(u);
        setTipos(t);
        const atual = impressos.find(i => String(i.id) === id);
        if (atual) {
          setFormData({
            nome: atual.nome || '',
            data: atual.data ? atual.data.split(' ')[0] : '',
            morada: atual.morada || '',
            tipo: atual.tipo_id || '',
            unidade: atual.unidade_id || '',
            email: atual.email || '',
            tel: atual.telefone || '',
            descritivo: atual.descritivo || '',
            resolucao: atual.resolucao || ''
          });
        }
      })
      .catch(err => setError("Erro ao carregar dados do servidor."));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Deseja guardar as alterações?")) return;

    try {
      const response = await fetch('http://localhost/API/editarImpresso.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_impresso: id })
      });
      const res = await response.json();
      if (res.status === 'sucesso') {
        setSuccess('Registo atualizado com sucesso!');
        window.scrollTo(0, 0);
        setTimeout(() => navigate('/listar-impresso'), 1500);
      } else {
        setError(res.mensagem || 'Erro ao atualizar registo.');
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
            <button className="logout-btn" onClick={() => { localStorage.removeItem('userName'); navigate("/login"); }}>
              Terminar Sessão
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/listar-impresso')} className="nav-link">← Voltar à Lista</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <form onSubmit={handleSubmit} className="full-width-form">
          
          {error && <div className="status-msg error" style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
          {success && <div className="status-msg success" style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{success}</div>}

          <section className="section-box">
            <h2 className="section-title">Identificação (Modo Edição)</h2>
            <div className="row">
              <div className="input-group grow">
                <label>Nome:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Data:</label>
                <input type="date" name="data" value={formData.data} onChange={handleChange} />
              </div>
            </div>

            <div className="row" style={{ paddingTop: 0 }}>
              <div className="input-group grow">
                <label>Morada:</label>
                <input type="text" name="morada" value={formData.morada} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="section-box">
            <div className="row">
              <div className="input-group grow">
                <label>Tipo:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="">Seleccione o Tipo</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="input-group grow">
                <label>Unidade:</label>
                <select name="unidade" value={formData.unidade} onChange={handleChange}>
                  <option value="">Seleccione a Unidade</option>
                  {unidades.map(u => (
                    <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="section-box">
            <h2 className="section-title">Contacto</h2>
            <div className="row">
              <div className="input-group grow">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="input-group grow">
                <label>Telemóvel:</label>
                <input type="text" name="tel" value={formData.tel} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="section-box">
            <h2 className="section-title">Descritivo:</h2>
            <div className="textarea-container">
              <textarea name="descritivo" value={formData.descritivo} onChange={handleChange} />
            </div>
          </section>

          <section className="section-box">
            <h2 className="section-title">Resolução:</h2>
            <div className="textarea-container">
              <textarea name="resolucao" value={formData.resolucao} onChange={handleChange} />
            </div>
          </section>

          <div className="button-group">
            <button type="submit" className="btn-submit">Atualizar Dados</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/listar-impresso')}>Sair sem guardar</button>
          </div>
        </form>
      </main>
    </div>
  );
}