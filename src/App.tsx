import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import TurmaDetail from './pages/TurmaDetail';
import Acompanhamento from './pages/Acompanhamento';
import Desempenho from './pages/Desempenho';
import Ajustes from './pages/Ajustes';
import Layout from './components/Layout';
import { SoundProvider } from './contexts/SoundContext';
import './index.css';

function App() {
  return (
    <SoundProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/desempenho" element={<Desempenho />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/turma/:id" element={<TurmaDetail />} />
            <Route path="/turma/:id/semana/:semanaId" element={<Acompanhamento />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SoundProvider>
  );
}

export default App;
