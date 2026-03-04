import React, { useState, useEffect } from 'react';
import '../css/InserirEmail.css';

export default function InserirEmail() {
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({
    tipo: '',
    unidade: '',
    email: '',
    data: new Date().toISOString().split('T')[0],
    conteudo: '',
    nome: '', 
    assunto: ''
  });

  const [status, setStatus] = useState({ type: '', msg: '' });

  // Carregar opções dinâmicas
  useEffect(() => {
    fetch('http://localhost/API/obterUnidade.php').then(res => res.json()).then(setUnidades);
    fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json()).then(setTipos);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tipo || !formData.email || !formData.conteudo) {
      setStatus({ type: 'error', msg: 'Por favor, preencha os campos obrigatórios.' });
      return;
    }

    try {
      const response = await fetch('http://localhost/API/salvarEmail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData)
      });

      const result = await response.json();
      if (result.status === 'sucesso') {
        setStatus({ type: 'success', msg: 'Email registado com sucesso!' });
        setFormData({ ...formData, email: '', conteudo: '', nome: '', assunto: '' });
      } else {
        setStatus({ type: 'error', msg: result.mensagem });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Erro na ligação ao servidor.' });
    }
  };

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="logo-section">Logo</div>
        <div className="title-section">SANTA CASA DA MISERICÓRDIA DE ESPOSENDE</div>
        <div className="user-section">
          <span>*Utilizador*</span>
          <button className="logout-btn">Terminar Sessão</button>
        </div>
      </header>

      <nav className="nav-links">
        <a href="/" className="nav-link">← Pagina Principal</a>
        <a href="/listar-email" className="nav-link">Listar Email →</a>
      </nav>

      <hr className="divider" />

      <div className="main-content">
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <section className="section-box">
              <h2 className="section-title">Identificação</h2>
              
              {status.msg && (
                <div style={{ color: status.type === 'success' ? 'green' : 'red', marginBottom: '15px' }}>
                  {status.msg}
                </div>
              )}

              <div className="row">
                <div className="input-group">
                  <label>Tipo:</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange}>
                    <option value="">Seleccione o Tipo</option>
                    {tipos.map(t => (
                      <option key={t.id} value={t.id}>{t.descricao}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Unidade:</label>
                  <select name="unidade" value={formData.unidade} onChange={handleChange}>
                    <option value="">Selecione a Unidade</option>
                    {unidades.map(u => <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>)}
                  </select>
                </div>
              </div>

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

              <div className="row">
                <div className="input-group grow">
                  <label>Email:</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="input-group grow">
                  <label>Assunto:</label>
                  <input type="text" name="assunto" value={formData.assunto} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="section-box no-padding">
              <h2 className="section-title gray-bg">Conteúdo do email:</h2>
              <div className="textarea-container">
                <textarea name="conteudo" value={formData.conteudo} onChange={handleChange} />
              </div>
            </section>

            <div className="button-group">
              <button type="submit" className="btn-submit">Submeter</button>
              <button type="button" className="btn-cancel" onClick={() => window.location.reload()}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
