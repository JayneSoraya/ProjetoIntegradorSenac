import React, { useState } from 'react';
import SpaceBackground from '../components/SpaceBackground';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import HardSkills from '../components/HardSkills';
import Supermarkets from '../components/Supermarkets'; 
import ContactForm from '../components/ContactForm';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal'; // Certifique-se de importar o modal

export function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-bg-main text-text-main overflow-x-hidden transition-colors duration-300">
      <SpaceBackground />
      <Header onOpenLogin={() => setIsLoginOpen(true)} />
      
      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <HardSkills />
        <Supermarkets /> 
        <ContactForm />
        <Contact />
      </main>

      <Footer />

      {/* Modal de Login controlado pelo estado */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </div>
  );
}