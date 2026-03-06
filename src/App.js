import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import LogIn from "./pages/LogIn";
import InserirEmail from "./pages/InserirEmail";
import InserirImpresso from "./pages/InserirImpresso";
import InserirQuestionario from './pages/InserirQuestionario';
import ListarEmail from './pages/ListarEmail';
import ListarImpresso from './pages/ListarImpresso';
import ListarQuestionario from './pages/ListarQuestionario';
import EstatisticaQuestionario from './pages/EstatisticaQuestionario';
import EditarQuestionario from './pages/EditarQuestionario';
import EditarImpresso from './pages/EditarImpresso';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial é o Login */}
        <Route path="/" element={<LogIn />} />
        
        {/* Rotas das páginas principais */}
        <Route path="/principal" element={<HomePage />} />

        {/* Emails */}
        <Route path="/inserir-email" element={<InserirEmail />} />
        <Route path="/listar-email" element={<ListarEmail />} />
        
        {/* Impressos */}
        <Route path="/inserir-impresso" element={<InserirImpresso />} />
        <Route path="/listar-impresso" element={<ListarImpresso />} />
        <Route path="/editar-impresso/:id" element={<EditarImpresso />} />

        {/* Questionários */}
        <Route path="/inserir-questionario" element={<InserirQuestionario />} />
        <Route path="/listar-questionario" element={<ListarQuestionario />} />
        <Route path="/editar-questionario/:id" element={<EditarQuestionario />} />

        {/* Rotas de estatísticas */}
        <Route path="/estatistica-questionario" element={<EstatisticaQuestionario />} />

        {/* Redirecionar rotas inexistentes para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;