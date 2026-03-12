import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handleClick = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="page-wrapper">
      {/* Cabeçalho */}
      <header className="main-header">
        <div className="logo-section">Logo</div>
        <div className="title-section">SANTA CASA DA MISERICÓRDIA DE ESPOSENDE</div>
        <div className="user-section">
          <span>*Utilizador*</span>
          <button className="logout-btn" onClick={() => navigate("/login")}>
            Terminar Sessão
          </button>
        </div>
      </header>

      <hr className="divider" />
      
      <div className="menu-container">
        {/* Questionários */}
        <MenuBox
          title="Questionário"
          isOpen={openMenu === "questionario"}
          onClick={() => handleClick("questionario")}
        >
          <Option onClick={() => navigate("/inserir-questionario")}>Registar</Option>
          <Option onClick={() => navigate("/listar-questionario")}>Listar</Option>
          <Option onClick={() => navigate("/estatistica-questionario")}>Estatísticas</Option>
        </MenuBox>

        {/* Impressos */}
        <MenuBox
          title="Impressos"
          isOpen={openMenu === "impressos"}
          onClick={() => handleClick("impressos")}
        >
          <Option onClick={() => navigate("/inserir-impresso")}>Registar</Option>
          <Option onClick={() => navigate("/listar-impresso")}>Listar</Option>
          <Option onClick={() => navigate("/estatistica-impresso")}>Estatísticas</Option> 
        </MenuBox>

        {/* Emails */}
        <MenuBox
          title="Emails"
          isOpen={openMenu === "emails"}
          onClick={() => handleClick("emails")}
        >
          <Option onClick={() => navigate("/inserir-email")}>Registar</Option>
          <Option onClick={() => navigate("/listar-email")}>Listar</Option>
        </MenuBox>
      </div>
    </div>
  );
}

// Componente MenuBox (mantido igual, apenas para contexto)
function MenuBox({ title, isOpen, onClick, children }) {
  return (
    <div className={`menu-box ${isOpen ? "open" : ""}`}>
      <button className="menu-title" onClick={onClick}>
        {title}
      </button>
      {isOpen && <div className="menu-content">{children}</div>}
    </div>
  );
}

// Componente Option Atualizado para aceitar o evento de clique
function Option({ children, onClick }) {
  return (
    <div className="option" onClick={onClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
}