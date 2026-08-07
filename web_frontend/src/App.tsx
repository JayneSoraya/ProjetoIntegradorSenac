import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SpaceBackground from './components/SpaceBackground';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';       
import HardSkills from './components/HardSkills'; 
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

function App() {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="min-h-screen text-text-main font-sans selection:bg-econoway-green/30 antialiased overflow-x-hidden relative">
      
      {/* 🌌 CANVAS DE FUNDO */}
      <SpaceBackground />

      {/* NAVBAR */}
      <Header onOpenLogin={() => setModalAberto(true)} />

      {/* SEÇÕES */}
      <Hero />
      <About />
      
      {/* 📊 ÁREA DE COMPETÊNCIAS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rodando em grid nas telas grandes elas ficam lado a lado, o que poupa rolagem! */}
        <HardSkills />
        <Skills />
      </div>
      
      <hr className="border-border-main max-w-5xl mx-auto" />
      
      {/* 📬 FORMULÁRIO DE CONTATO */}
      <ContactForm />

      {/* 🏁 RODAPÉ */}
      <Footer />

      {/* MODAL DE AUTENTICAÇÃO */}
      <AnimatePresence>
        {modalAberto && (
          <LoginModal isOpen={modalAberto} onClose={() => setModalAberto(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;