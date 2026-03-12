import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/HomePage.css";
import logo from '../assets/logohospital_cores.png'; 

export default function HomePage() {
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
            <button className="logout-btn" onClick={handleLogout}>
              Terminar Sessão
            </button>
          </div>
        </div>
      </header>

      <main className="content-container">
        <div className="menu-grid">
          {/* Questionários */}
          <MenuBox
            title="Questionários"
            isOpen={openMenu === "questionario"}
            onClick={() => handleClick("questionario")}
          >
            <Option onClick={() => navigate("/inserir-questionario")}>Registar Novo</Option>
            <Option onClick={() => navigate("/listar-questionario")}>Consultar Lista</Option>
            <Option onClick={() => navigate("/estatistica-questionario")}>Estatísticas</Option>
          </MenuBox>

          {/* Impressos */}
          <MenuBox
            title="Impressos"
            isOpen={openMenu === "impressos"}
            onClick={() => handleClick("impressos")}
          >
            <Option onClick={() => navigate("/inserir-impresso")}>Registar</Option>
            <Option onClick={() => navigate("/listar-impresso")}>ConsultarLista</Option>
            <Option onClick={() => navigate("/estatistica-impresso")}>Estatísticas</Option> 
          </MenuBox>

          {/* Emails */}
          <MenuBox
            title="Gestão de Emails"
            isOpen={openMenu === "emails"}
            onClick={() => handleClick("emails")}
          >
            <Option onClick={() => navigate("/inserir-email")}>Registar</Option>
            <Option onClick={() => navigate("/listar-email")}>Histórico</Option>
          </MenuBox>
        </div>
      </main>
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