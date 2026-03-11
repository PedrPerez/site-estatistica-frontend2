import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

export default function LogIn() {
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
            const response = await fetch('http://localhost/API/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utilizador, password })
            });

            const data = await response.json();

            if (data.status === 'sucesso') {
                setError('');
                // Guarda o nome do utilizador da tabela tbl_users
                localStorage.setItem('userName', data.user.nome);
                navigate('/estatistica-impresso'); 
            } else {
                setError(data.mensagem);
            }
        } catch (err) {
            setError('Erro de ligação ao servidor');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h1>Login</h1>
                
                <p className={`error ${error ? 'visible' : 'hidden'}`}>
                    {error || "Espaço reservado"}
                </p>
                
                <input
                    type="text"
                    placeholder="Utilizador"
                    value={utilizador}
                    onChange={(e) => setUtilizador(e.target.value)}
                    required
                />
                
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}