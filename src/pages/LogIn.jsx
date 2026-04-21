import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import '../css/Header.css';
import logo from '../assets/logohospital_cores.png';

export default function LogIn() {
    const [utilizador, setUtilizador] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); // 1. Estado para a checkbox
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

                // Lógica de Redirecionamento condicional
                if (isAdmin) {
                    navigate('/HomePageAdmin'); // Rota para Admin
                } else {
                    navigate('/principal');     // Rota normal
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

                    {/* 3. Checkbox de Admin */}
                    <div className="admin-checkbox">
                        <label>Entrar como Administrador</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isAdmin}
                                onChange={(e) => setIsAdmin(e.target.checked)}
                            />
                        </label>
                    </div>
                    
                    <button type="submit" className="btn-login" style={{ marginTop: '20px' }}>
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