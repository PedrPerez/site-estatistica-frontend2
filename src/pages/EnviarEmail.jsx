import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logohospital_cores.png';

export default function EnviarEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recupera os dados enviados pelo redirecionamento
  const { email, nome, id, resolucao } = location.state || {};

  const [mensagem, setMensagem] = useState(
    `Caro(a) ${nome || 'Utente'},\n\n` +
    `Informamos que o seu processo com o ID ${id} foi registado/atualizado no nosso sistema.\n\n` +
    `Estado/Resolução: ${resolucao || 'Em processamento'}.\n\n` +
    `Melhores cumprimentos,\nHospital de Esposende Valentim Ribeiro.`
  );

  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
  setEnviando(true);
  try {
    const response = await fetch('http://localhost/API/enviarEmail.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // MUITO IMPORTANTE: a chave tem de ser "email"
      body: JSON.stringify({ 
        email: email, // Este 'email' vem do state (location.state)
        mensagem: mensagem 
      })
    });
    const data = await response.json();
      
      if (data.status === 'sucesso') {
        alert("E-mail enviado com sucesso!");
        navigate('/listar-impresso');
      } else {
        alert("Erro: " + data.mensagem);
      }
    } catch (error) {
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (!email) return <div className="page-wrapper">Dados insuficientes para envio.</div>;

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Logo" className="hospital-logo" />
      </header>

      <main className="main-content container-1200">
        <section className="section-box">
          <h2>Notificar Utente por E-mail</h2>
          <hr />
          
          <div className="input-group" style={{ marginBottom: '15px' }}>
            <label>Destinatário:</label>
            <input type="text" value={email} disabled style={{ backgroundColor: '#f0f0f0' }} />
          </div>

          <div className="input-group">
            <label>Conteúdo da Mensagem:</label>
            <textarea 
              style={{ width: '100%', height: '300px', padding: '15px', borderRadius: '8px', border: '1px solid #ccc' }}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              className="logout-btn" 
              style={{ backgroundColor: '#6c757d' }} 
              onClick={() => navigate('/listar-impresso')}
            >
              Cancelar
            </button>
            <button 
              className="btn-edit-list" 
              onClick={handleEnviar} 
              disabled={enviando}
            >
              {enviando ? "A enviar..." : "Confirmar e Enviar E-mail"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}