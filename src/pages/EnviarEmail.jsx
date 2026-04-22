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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEnviar = async () => {
    setEnviando(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost/API/enviarEmail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mensagem })
      });
      
      const data = await response.json();
      
      if (data.status === 'sucesso') {
        setSuccess("E-mail enviado com sucesso!");
        setTimeout(() => navigate('/listar-impresso'), 2000);
      } else {
        setError("Erro: " + data.mensagem);
      }
    } catch (error) {
      setError("Erro ao comunicar com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (!email) return (
    <div className="page-wrapper">
      <div className="status-msg" style={{color: 'red', textAlign: 'center', marginTop: '50px'}}>
        Dados insuficientes para envio. Por favor, volte atrás.
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
             <span className="user-name"><strong>{localStorage.getItem('userName')}</strong></span>
          </div>
        </div>
      </header>

      <nav className="nav-links">
        <button onClick={() => navigate('/listar-impresso')} className="nav-link">← Cancelar e Voltar</button>
      </nav>

      <hr className="divider" />

      <main className="main-content">
        <div className="full-width-form">
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="status-msg" style={{color: 'green', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px'}}>{success}</div>}

          {/* Secção Destinatário */}
          <section className="section-box">
            <h2 className="section-title">Confirmação de Envio</h2>
            <div className="row">
              <div className="input-group grow">
                <label>Destinatário (Utente):</label>
                <input 
                  type="text" 
                  value={email} 
                  disabled 
                  style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed', color: '#666' }} 
                />
              </div>
              <div className="input-group">
                <label>ID do Processo:</label>
                <input 
                  type="text" 
                  value={id} 
                  disabled 
                  style={{ backgroundColor: '#f9f9f9', textAlign: 'center', width: '80px' }} 
                />
              </div>
            </div>
          </section>

          {/* Secção Conteúdo - Usando o mesmo estilo da Ocorrência/Resolução */}
          <section className="section-box">
            <h2 className="section-title">Conteúdo da Mensagem:</h2>
            <div className="textarea-container">
              <textarea 
                style={{ minHeight: '300px' }}
                value={mensagem} 
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva aqui a mensagem que o utente irá receber..."
              />
            </div>
            <p style={{fontSize: '0.85rem', color: '#666', marginTop: '10px'}}>
              * Pode editar o texto acima antes de carregar em enviar.
            </p>
          </section>

          <div className="button-group">
            <button 
              type="button" 
              className="btn-submit" 
              onClick={handleEnviar} 
              disabled={enviando}
            >
              {enviando ? "A enviar..." : "Confirmar e Enviar E-mail"}
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => navigate('/listar-impresso')}
            >
              Sair sem enviar
            </button>
          </div>
        </div>
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