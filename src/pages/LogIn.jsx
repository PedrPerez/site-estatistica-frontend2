import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

// Componentes de Ícones (SVG) para evitar dependências externas
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export default function LogIn() {
    const [utilizador, setUtilizador] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!utilizador || !password) {
            setError('Campos por preencher');
            return;
        }

        const url = isAdmin 
            ? 'http://localhost/API/loginAdmin.php' 
            : 'http://localhost/API/login.php';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utilizador, password })
            });

            const data = await response.json();

            if (data.status === 'sucesso') {
                setError('');
                localStorage.setItem('userName', data.user.nome);
                localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');

                if (isAdmin) {
                    navigate('/HomePageAdmin');
                } else {
                    navigate('/principal');
                }
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
                    <h1>Acesso ao Sistema</h1>
                    
                    <p className={`error ${error ? 'visible' : 'hidden'}`}>
                        {error || "Espaço reservado"}
                    </p>
                    
                    <label htmlFor="user">Utilizador</label>
                    <input
                        id="user"
                        type="text"
                        placeholder="Introduza o seu utilizador"
                        value={utilizador}
                        onChange={(e) => setUtilizador(e.target.value)}
                        required
                    />
                    
                    <label htmlFor="pass">Palavra-passe</label>
                    <div className="password-wrapper">
                        <input
                            id="pass"
                            type={showPassword ? "text" : "password"}
                            placeholder="Introduza a sua password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Ocultar password" : "Mostrar password"}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    <div className="admin-checkbox">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isAdmin}
                                onChange={(e) => setIsAdmin(e.target.checked)}
                            />
                            <span>Entrar como Administrador</span>
                        </label>
                    </div>
                    
                    <button type="submit" className="btn-login">
                        Entrar
                    </button>
                </form>
            </div>
            
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