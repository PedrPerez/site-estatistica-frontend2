import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/HomePage.css";
import "../css/Header.css";
import logo from '../assets/logohospital_cores.png'; 

export default function HomePageAdmin() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [userName, setUserName] = useState("Utilizador");

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);

  const handleClick = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    navigate("/login");
  };

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Hospital de Esposende Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <main className="content-container">
        <div className="menu-grid">
          {/* Questionários */}
          <MenuBox
            title="Utilizadores"
            isOpen={openMenu === "utilizadores"}
            onClick={() => handleClick("utilizadores")}
          >
            <Option onClick={() => navigate("/inserir-user")}>Registar Novo</Option>
            <Option onClick={() => navigate("/listar-user")}>Consultar Lista</Option>
          </MenuBox>
        </div>
      </main>
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

function MenuBox({ title, isOpen, onClick, children }) {
  return (
    <div className={`menu-box ${isOpen ? "open" : ""}`}>
      <button className="menu-title" onClick={onClick}>
        {title}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="menu-content">{children}</div>}
    </div>
  );
}

function Option({ children, onClick }) {
  return (
    <div className="option" onClick={onClick}>
      {children}
    </div>
  );
}