import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Smartphone } from 'lucide-react';

// 🌟 Tipagem para receber a função que abre o modal
interface HeaderProps {
  onOpenLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDownloadApp = () => {
    const downloadSection = document.getElementById('download-app');
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('Links para download nas lojas Android e iOS estarão disponíveis em breve!');
    }
  };

  const menuItems = [
    { name: 'Início', href: '#inicio' },
    { name: 'Sobre', href: '#sobre' },
    { name: 'Supermercados', href: '#supermercados' },
    { name: 'Serviços', href: '#servico' },
    { name: 'Contato', href: '#contato' }
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b border-border-main bg-bg-main/80"
      >
        <nav className="flex justify-between items-center p-6 container mx-auto">
          {/* Logo atualizada */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-econoway-green font-extrabold text-2xl tracking-tighter uppercase font-mono"
          >
            / ECONOWAY_
          </motion.div>

          {/* Menu Desktop */}
          <ul className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-medium items-center text-text-main">
            {menuItems.map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <a
                  href={item.href}
                  className="hover:text-econoway-green transition-colors duration-300 font-semibold"
                >
                  {item.name}
                </a>
              </motion.li>
            ))}
            
            {/* Botão de baixar o Aplicativo */}
            <motion.li
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleDownloadApp}
                className="flex items-center gap-2 bg-econoway-green/10 border border-econoway-green text-econoway-green px-4 py-2 rounded-lg font-bold hover:bg-econoway-green hover:text-white transition-all duration-300 cursor-pointer"
              >
                <Smartphone size={16} />
                BAIXAR APP
              </button>
            </motion.li>

            {/* Botão de Entrar (Dispara o Modal no App.tsx) */}
            <motion.li
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={onOpenLogin}
                className="bg-econoway-green text-white px-5 py-2 rounded-lg font-bold hover:bg-econoway-light transition-all duration-300 block text-center shadow-md cursor-pointer"
              >
                ENTRAR
              </button>
            </motion.li>
          </ul>

          {/* Mobile */}
          <button
            className="md:hidden text-text-heading cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-main/95 backdrop-blur-lg border-b border-border-main"
          >
            <ul className="flex flex-col gap-4 p-6">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-text-heading hover:text-econoway-green transition-colors text-sm uppercase tracking-widest font-medium block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              
              <li>
                <button
                  onClick={() => {
                    handleDownloadApp();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 bg-econoway-green/10 border border-econoway-green text-econoway-green px-4 py-2 rounded-lg font-bold hover:bg-econoway-green hover:text-white transition-all w-full text-sm uppercase cursor-pointer"
                >
                  <Smartphone size={16} />
                  BAIXAR APP
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    onOpenLogin();
                    setIsMenuOpen(false);
                  }}
                  className="bg-econoway-green text-white px-4 py-2 rounded-lg font-bold hover:bg-econoway-light transition-all w-full text-sm uppercase block text-center cursor-pointer"
                >
                  ENTRAR
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </motion.header>
    </>
  );
};

export default Header;