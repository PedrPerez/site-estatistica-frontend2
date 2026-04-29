import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from "./pages/HomePage";
import HomePageAdmin from './pages/HomePageAdmin';
import LogIn from "./pages/LogIn";
import InserirEmail from "./pages/InserirEmail";
import ListarEmail from './pages/ListarEmail';
import EditarEmail from './pages/EditarEmail';
import InserirImpresso from "./pages/InserirImpresso";
import ListarImpresso from './pages/ListarImpresso';
import EditarImpresso from './pages/EditarImpresso';
import EnviarEmail from './pages/EnviarEmail';
import InserirQuestionario from './pages/InserirQuestionario';
import ListarQuestionario from './pages/ListarQuestionario';
import EditarQuestionario from './pages/EditarQuestionario';
import EstatisticaQuestionario from './pages/EstatisticaQuestionario';
import EstatisticaImpresso from './pages/EstatisticaImpresso';
import EstatisticaEmail from './pages/EstatisticaEmail';
import ExportarDados from './pages/ExportarDados';
import LogInAdmin from "./pages/LogInAdmin";
import EditarUser from './pages/EditarUser';
import ListarUser from './pages/ListarUser';
import InserirUser from './pages/InserirUser';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTA PÚBLICA */}
        <Route path="/" element={<LogIn />} />

        {/* GRUPO DE ROTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute />}>
          <Route path="/principal" element={<HomePage />} />
          <Route path="/HomePageAdmin" element={<HomePageAdmin />} /> 
          
          {/* Emails */}
          <Route path="/inserir-email" element={<InserirEmail />} />
          <Route path="/listar-email" element={<ListarEmail />} />
          <Route path="/editar-email/:id" element={<EditarEmail />} />
          
          {/* Impressos */}
          <Route path="/inserir-impresso" element={<InserirImpresso />} />
          <Route path="/listar-impresso" element={<ListarImpresso />} />
          <Route path="/editar-impresso/:id" element={<EditarImpresso />} />
          <Route path="/enviar-email" element={<EnviarEmail />} />

          {/* Questionários */}
          <Route path="/inserir-questionario" element={<InserirQuestionario />} />
          <Route path="/listar-questionario" element={<ListarQuestionario />} />
          <Route path="/editar-questionario/:id" element={<EditarQuestionario />} />

          {/* Estatísticas */}
          <Route path="/estatistica-questionario" element={<EstatisticaQuestionario />} />
          <Route path="/estatistica-impresso" element={<EstatisticaImpresso />} />
          <Route path="/estatistica-email" element={<EstatisticaEmail />} />
          {/* Exportar Dados */}
          <Route path="/exportar" element={<ExportarDados />} />

          {/* Gerir Utilizadores */}
          <Route path="/gerir-utilizadores" element={<ListarUser />} />
          <Route path="/inserir-utilizador" element={<InserirUser />} /> 
          <Route path="/editar-utilizador/:id" element={<EditarUser />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;