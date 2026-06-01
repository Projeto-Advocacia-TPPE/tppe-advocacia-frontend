import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';

// Landing page components
import Navbar           from './components/Navbar/Navbar';
import Hero             from './components/Hero/Hero';
import Escritorio       from './components/Escritorio/Escritorio';
import Diferenciais     from './components/Diferenciais/Diferenciais';
import Areas            from './components/Areas/Areas';
import Sobre            from './components/Sobre/Sobre';
import Artigos          from './components/Artigos/Artigos';
import Contato          from './components/Contato/Contato';
import Footer           from './components/Footer/Footer';

// Sistema
import SistemaLayout    from './layouts/SistemaLayout';
import Usuarios         from './pages/sistema/Usuarios/Usuarios';
import LandingPageConfig from './pages/sistema/LandingPage/LandingPage';
import Notificacoes     from './pages/sistema/Notificacoes/Notificacoes';
import Leads            from './pages/sistema/Leads';
import Clientes         from './pages/sistema/Clientes';
import Agenda           from './pages/sistema/Agenda';
import Processos        from './pages/sistema/Processos';
import Tarefas          from './pages/sistema/Tarefas';

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Escritorio />
        <Diferenciais />
        <Areas />
        <Sobre />
        <Artigos />
        <Contato />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Sistema */}
        <Route path="/sistema" element={<SistemaLayout />}>
          <Route index element={<Navigate to="usuarios" replace />} />
          <Route path="usuarios"     element={<Usuarios />} />
          <Route path="landing-page" element={<LandingPageConfig />} />
          <Route path="artigos"      element={<div><h1>Artigos</h1></div>} />
          <Route path="leads"        element={<Leads />} />
          <Route path="clientes"     element={<Clientes />} />
          <Route path="agenda"       element={<Agenda />} />
          <Route path="processos"    element={<Processos />} />
          <Route path="tarefas"      element={<Tarefas />} />
          <Route path="notificacoes" element={<Notificacoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
