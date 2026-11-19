import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SpaceBackground from './components/SpaceBackground';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import AppFeatures from './components/AppFeatures';
import AppBenefits from './components/AppBenefits';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import { RotaProtegida } from './components/RotaProtegida';
import { AdminScreen } from './pages/admin/AdminScreen';
import { AdminProdutosScreen } from './pages/admin/AdminProdutosScreen';
import { AdminEditarProdutoScreen } from './pages/admin/AdminEditarProdutoScreen';

function LandingPage() {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="min-h-screen text-text-main font-sans selection:bg-econoway-green/30 antialiased overflow-x-hidden relative">
      {/* 🌌 CANVAS DE FUNDO */}
      <SpaceBackground />

      {/* NAVBAR */}
      <Header onOpenLogin={() => setModalAberto(true)} />

      {/* SEÇÕES PRINCIPAIS */}
      <Hero />
      <About />

      {/* 📊 FUNCIONALIDADES E BENEFÍCIOS */}
      <AppFeatures />
      <AppBenefits />

      <hr className="border-border-main max-w-5xl mx-auto my-8" />

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/admin"
        element={
          <RotaProtegida>
            <AdminScreen />
          </RotaProtegida>
        }
      />

      <Route
        path="/admin/produtos"
        element={
          <RotaProtegida>
            <AdminProdutosScreen />
          </RotaProtegida>
        }
      />
      <Route
  path="/admin/produtos/editar"
  element={
    <RotaProtegida>
      <AdminEditarProdutoScreen />
    </RotaProtegida>
  }
/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;