import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Landing page components
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Escritorio from './components/Escritorio/Escritorio';
import Diferenciais from './components/Diferenciais/Diferenciais';
import Areas from './components/Areas/Areas';
import Sobre from './components/Sobre/Sobre';
import Artigos from './components/Artigos/Artigos';
import Contato from './components/Contato/Contato';
import Footer from './components/Footer/Footer';
import { OfficeConfigProvider } from './contexts/OfficeConfigContext';

// Sistema
import SistemaLayout from './layouts/SistemaLayout';
import Usuarios from './pages/sistema/Usuarios/Usuarios';
import LandingPageConfig from './pages/sistema/LandingPage/LandingPage';
import Notificacoes from './pages/sistema/Notificacoes/Notificacoes';
import Leads from './pages/sistema/Leads';
import Clientes from './pages/sistema/Clientes';
import Agenda from './pages/sistema/Agenda/Agenda';
import Processos from './pages/sistema/Processos/Processos';
import Tarefas from './pages/sistema/Tarefas';
import Dashboard from './pages/sistema/Dashboard/Dashboard';
import Artigos_ from './pages/sistema/Artigos_/Artigos';

function LandingPage() {
  return (
    <OfficeConfigProvider>
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
    </OfficeConfigProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page pública */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Sistema */}
        <Route element={<ProtectedRoute />}>
          <Route path="/sistema" element={<SistemaLayout />}>
            <Route index element={<Dashboard />} />
            <Route element={<AdminRoute />}>
              <Route path="usuarios" element={<Usuarios />} />
            </Route>
            <Route path="landing-page" element={<LandingPageConfig />} />
            <Route path="artigos" element={<Artigos_ />} />
            <Route path="leads" element={<Leads />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="processos" element={<Processos />} />
            <Route path="tarefas" element={<Tarefas />} />
            <Route path="notificacoes" element={<Notificacoes />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
