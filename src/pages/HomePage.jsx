import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/Header.css";
import "../css/Footer.css";
import "../css/HomePage.css";
import "../css/InserirEmail.css";
import "../css/InserirEmail.css";
import "../css/InserirQuestionario.css";
import "../css/ListarEmail.css";
import "../css/ListarQuestionario.css";
import '../css/ExportarDados.css';
import logo from '../assets/logohospital_cores.png';

export default function HomePage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [userName, setUserName] = useState("Utilizador");
  const [userPerms, setUserPerms] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedId = localStorage.getItem('userId');
    
    if (storedName) setUserName(storedName);
    
    if (storedId) {
      fetchPermissions(storedId);
    } else {
      // Se não houver sessão, volta para o login
      navigate("/"); 
    }
  }, [navigate]);

  const fetchPermissions = async (userId) => {
    try {
      // Chamada à API que criámos anteriormente
      const res = await fetch(`http://localhost/API/obterPermissoesUser.php?iduser=${userId}`);
      const data = await res.json();
      
      // Filtramos apenas os IDs onde activo = 1 (ou "1")
      const allowedIds = data
        .filter(p => String(p.activo) === "1")
        .map(p => Number(p.idmenu));
      
      setUserPerms(allowedIds);
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Funções de verificação baseadas nos IDs da tua base de dados
  const canAccess = (id) => userPerms.includes(id);
  const hasAccessToCategory = (ids) => ids.some(id => canAccess(id));

  if (loading) {
    return (
      <div className="loading-screen">
        <h3>A carregar permissões de acesso...</h3>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <header className="login-header">
        <img src={logo} alt="Hospital Logo" className="hospital-logo" />
        <div className="user-section">
          <div className="user-info">
            <span className="user-name"><strong>{userName}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>Terminar Sessão</button>
          </div>
        </div>
      </header>

      <main className="content-container">
        <div className="menu-grid">
          
          {/* QUESTIONÁRIOS - IDs 1, 8, 11 */}
          {hasAccessToCategory([1, 2, 3, 4]) && (
            <MenuBox
              title="Questionários"
              isOpen={openMenu === "questionario"}
              onClick={() => setOpenMenu(openMenu === "questionario" ? null : "questionario")}
            >
              {canAccess(1) && <Option onClick={() => navigate("/inserir-questionario")}>Registar Novo</Option>}
              {canAccess(2) && <Option onClick={() => navigate("/listar-questionario")}>Consultar Lista</Option>}
              {canAccess(3) && <Option onClick={() => navigate("/estatistica-questionario")}>Estatísticas</Option>}
              {canAccess(4) && <Option onClick={() => navigate("/gerir-questoes")}>Gerir Questões</Option>}
            </MenuBox>
          )}

          {/* INQUÉRITOS / IMPRESSOS - IDs 9, 10 */}
          {hasAccessToCategory([5, 6, 7]) && (
            <MenuBox
              title="Inquerito"
              isOpen={openMenu === "impressos"}
              onClick={() => setOpenMenu(openMenu === "impressos" ? null : "impressos")}
            >
              {canAccess(5) && <Option onClick={() => navigate("/inserir-impresso")}>Registar Novo</Option>}
              {canAccess(6) && <Option onClick={() => navigate("/listar-impresso")}>Consultar Lista</Option>}
              {canAccess(7) && <Option onClick={() => navigate("/estatistica-impresso")}>Estatísticas</Option>}
            </MenuBox>
          )}

          {/* Emails - IDs 9, 10 */}
          {hasAccessToCategory([9]) && (
            <MenuBox
              title="Emails"
              isOpen={openMenu === "emails"}
              onClick={() => setOpenMenu(openMenu === "emails" ? null : "emails")}
            >
              {canAccess(8) && <Option onClick={() => navigate("/inserir-email")}>Registar Novo</Option>}
              {canAccess(9) && <Option onClick={() => navigate("/listar-email")}>Consultar Lista</Option>}
              {canAccess(10) && <Option onClick={() => navigate("/estatistica-email")}>Estatísticas</Option>}
            </MenuBox>
          )}

          {/* EXPORTAR DADOS - ID 11 */}
          {hasAccessToCategory([11]) && (
            <MenuBox
              title="Exportar Dados"
              isOpen={openMenu === "exportar"}
              onClick={() => setOpenMenu(openMenu === "exportar" ? null : "exportar")}
            >
              {canAccess(11) && <Option onClick={() => navigate("/exportar-questionario")}>Exportar Questionario</Option>}
              {canAccess(12) && <Option onClick={() => navigate("/exportar-impresso")}>Exportar Impressos</Option>}
            </MenuBox>
          )}
          
          {/* UTILIZADORES - Geralmente idmenu 1 ou apenas se idcategoria for 1 (Admin) */}
          {hasAccessToCategory([14]) && (
            <MenuBox
              title="Utilizadores"
              isOpen={openMenu === "utilizadores"}
              onClick={() => setOpenMenu(openMenu === "utilizadores" ? null : "utilizadores")}
            >
              {canAccess(13) && <Option onClick={() => navigate("/inserir-utilizador")}>Registar Novo</Option>}
              {canAccess(14) && <Option onClick={() => navigate("/gerir-utilizadores")}>Consultar Lista</Option>}
            </MenuBox>
          )}
          
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

// Componentes internos
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
  return <div className="option" onClick={onClick}>{children}</div>;
}