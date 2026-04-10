import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function LogInAdmin() {
    const [utilizador, setUtilizador] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!utilizador || !password) {
            setError('Campos por preencher');
            return;
        }

        try {
            const response = await fetch('http://localhost/API/loginAdmin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utilizador, password })
            });

            const data = await response.json();

            if (data.status === 'sucesso') {
                setError('');
                localStorage.setItem('userName', data.user.nome);
                navigate('/principal-admin'); 
            } else {
                setError(data.mensagem);
            }
        } catch (err) {
            setError('Erro de ligação ao servidor');
            console.error(err);
        }
    };

    return (
        <div className="login-page">
            <header className="login-header">
                <img src={logo} alt="Hospital de Esposende Logo" className="hospital-logo" />
            </header>

            <div className="login-container">
                <form onSubmit={handleSubmit}>
                    <h1>Acesso ao Sistema Admin</h1>
                    
                    <p className={`error ${error ? 'visible' : 'hidden'}`}>
                        {error || "Espaço reservado"}
                    </p>
                    
                    <label>Utilizador</label>
                    <input
                        type="text"
                        placeholder="Introduza o seu utilizador"
                        value={utilizador}
                        onChange={(e) => setUtilizador(e.target.value)}
                        required
                    />
                    
                    <label>Palavra-passe</label>
                    <input
                        type="password"
                        placeholder="Introduza a sua password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    <button type="submit" className="btn-login">Entrar</button>
                </form>
            </div>
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