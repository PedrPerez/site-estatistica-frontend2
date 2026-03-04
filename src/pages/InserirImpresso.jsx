import React, { useState, useEffect } from 'react';
import '../css/InserirImpresso.css';

export default function InserirImpresso() {
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    data: new Date().toISOString().split('T')[0], // Data de hoje por defeito
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

  // 1. Carregar Unidades e Tipos ao iniciar a página
  useEffect(() => {
    // Carregar Unidades
    fetch('http://localhost/API/obterUnidade.php')
      .then(res => res.json())
      .then(data => setUnidades(data))
      .catch(err => console.error("Erro ao carregar unidades:", err));

    // Carregar Tipos (Substituir pelo teu ficheiro de tipos)
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
    setError('');
    setSuccess('');

    // Validação simples
    const { nome, morada, unidade, email, data, tipo, tel, descritivo, resolucao } = formData;
    if (!tipo || !unidade || !nome || !descritivo) {
      setError('Por favor, preencha os campos obrigatórios (Nome, Unidade, Tipo e Descritivo).');
      return;
    }

    try {
      const response = await fetch('http://localhost/API/salvarImpresso.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...formData,
          utilizador_registo: 'Admin' // Poderia vir de um contexto de login
        })
      });

      const result = await response.json();

      if (result.status === 'sucesso') {
        setSuccess('Registo inserido com sucesso!');
        // Limpar formulário após sucesso
        setFormData({
          nome: '',
          data: new Date().toISOString().split('T')[0],
          morada: '',
          tipo: '',
          unidade: '',
          email: '',
          tel: '',
          descritivo: '',
          resolucao: ''
        });
      } else {
        setError(result.mensagem || 'Erro ao inserir registo.');
      }
    } catch (err) {
      setError('Não foi possível contactar o servidor.');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Cabeçalho */}
      <header className="main-header">
        <div className="logo-section">Logo</div>
        <div className="title-section">SANTA CASA DA MISERICÓRDIA DE ESPOSENDE</div>
        <div className="user-section">
          <span>*Utilizador*</span>
          <button className="logout-btn">Terminar Sessão</button>
        </div>
      </header>

      {/* Navegação */}
      <nav className="nav-links">
        <a href="/" className="nav-link">← Pagina Principal</a>
        <a href="/listar" className="nav-link">Listar Impressos →</a>
      </nav>

      <hr className="divider" />

      {/* Conteúdo */}
      <div className="main-content">
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            
            {/* Mensagens de Feedback */}
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            {success && <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>{success}</div>}

            {/* Secção Identificação */}
            <section className="section-box">
              <h2 className="section-title">Identificação</h2>
              
              <div className="row">
                <div className="input-group grow">
                  <label>Nome :</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
                </div>

                <div className="input-group">
                  <label>Data :</label>
                  <input type="date" name="data" value={formData.data} onChange={handleChange} />
                </div>
              </div>

              <div className="row" style={{ paddingTop: 0 }}>
                <div className="input-group grow">
                  <label>Morada :</label>
                  <input type="text" name="morada" value={formData.morada} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Secção Tipo e Unidade */}
            <section className="section-box">
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
                    <option value="">Seleccione a Unidade</option>
                    {unidades.map(u => (
                      <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Secção Email e Tel */}
            <section className="section-box">
              <div className="row">
                <div className="input-group grow">
                  <label>Email :</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Tel :</label>
                  <input type="text" name="tel" value={formData.tel} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Secção Descritivo */}
            <section className="section-box no-padding">
              <h2 className="section-title gray-bg">Descritivo:</h2>
              <div className="textarea-container">
                <textarea name="descritivo" value={formData.descritivo} onChange={handleChange} />
              </div>
            </section>

            {/* Secção Resolução */}
            <section className="section-box no-padding">
              <h2 className="section-title gray-bg">Resolução:</h2>
              <div className="textarea-container">
                <textarea name="resolucao" value={formData.resolucao} onChange={handleChange} />
              </div>
            </section>

            {/* Botões */}
            <div className="button-group">
              <button type="submit" className="btn-submit">Submeter</button>
              <button type="button" className="btn-cancel" onClick={() => setFormData({})}>Cancelar</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}