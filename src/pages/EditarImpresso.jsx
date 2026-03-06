import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/InserirImpresso.css';

export default function EditarImpresso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({
    nome: '', data: '', morada: '', tipo: '', unidade: '', email: '', tel: '', descritivo: '', resolucao: ''
  });

  useEffect(() => {
    // Carregar opções e dados do registo
    Promise.all([
      fetch('http://localhost/API/obterUnidade.php').then(res => res.json()),
      fetch('http://localhost/API/obterTipoMensagem.php').then(res => res.json()),
      fetch(`http://localhost/API/obterImpresso.php`).then(res => res.json())
    ]).then(([u, t, impressos]) => {
      setUnidades(u);
      setTipos(t);
      const atual = impressos.find(i => String(i.id) === id);
      if(atual) {
        setFormData({
          nome: atual.nome || '',
          data: atual.data.split(' ')[0],
          morada: atual.morada || '',
          tipo: atual.tipo_id,
          unidade: atual.unidade_id,
          email: atual.email || '',
          tel: atual.telefone || '',
          descritivo: atual.descritivo || '',
          resolucao: atual.resolucao || ''
        });
      }
    });
  }, [id]);

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
      if (res.status === 'sucesso') navigate('/listar-impresso');
    } catch (err) { alert("Erro ao conectar ao servidor"); }
  };

  return (
    <div className="page-wrapper">
      <header className="main-header">
        <div className="title-section">EDITAR IMPRESSO #{id}</div>
      </header>
      <main className="main-content">
        <form onSubmit={handleSubmit} className="form-card">
          <section className="section-box">
            <div className="row">
              <div className="input-group grow"><label>Nome:</label>
                <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="input-group"><label>Data:</label>
                <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="section-box">
            <div className="row">
              <div className="input-group">
                <label>Tipo:</label>
                <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Unidade:</label>
                <select value={formData.unidade} onChange={e => setFormData({...formData, unidade: e.target.value})}>
                  {unidades.map(u => <option key={u.cod_unidade} value={u.cod_unidade}>{u.descricao}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="section-box no-padding">
            <h2 className="section-title gray-bg">Descritivo:</h2>
            <textarea className="textarea-container" value={formData.descritivo} onChange={e => setFormData({...formData, descritivo: e.target.value})} />
          </section>

          <section className="section-box no-padding">
            <h2 className="section-title gray-bg">Resolução:</h2>
            <textarea className="textarea-container" value={formData.resolucao} onChange={e => setFormData({...formData, resolucao: e.target.value})} />
          </section>

          <div className="button-group">
            <button type="submit" className="btn-submit">Atualizar</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/listar-impresso')}>Cancelar</button>
          </div>
        </form>
      </main>
    </div>
  );
}