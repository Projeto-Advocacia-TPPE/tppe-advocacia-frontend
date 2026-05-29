import Navbar     from './components/Navbar/Navbar';
import Hero       from './components/Hero/Hero';
import Escritorio from './components/Escritorio/Escritorio';
import Diferenciais from './components/Diferenciais/Diferenciais';
import Areas      from './components/Areas/Areas';
import Sobre      from './components/Sobre/Sobre';
import Artigos    from './components/Artigos/Artigos';
import Contato    from './components/Contato/Contato';
import Footer     from './components/Footer/Footer';

export default function App() {
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
