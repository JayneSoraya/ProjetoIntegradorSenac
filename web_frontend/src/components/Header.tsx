import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Smartphone, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Início', href: '#inicio' },
    { name: 'Como funciona', href: '#como-funciona' },
    { name: 'Supermercados', href: '#supermercados' },
    { name: 'Contato', href: '#contato' },
  ];

  const handleAndroid = () => {
    document.getElementById('android')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b border-border-main bg-bg-main/80">
      <nav className="flex justify-between items-center p-6 container mx-auto">
        <a href="#inicio" className="text-econoway-green font-extrabold text-2xl tracking-tighter">EconoWay</a>
        <ul className="hidden md:flex gap-7 text-xs uppercase tracking-widest font-medium items-center text-text-main">
          {menuItems.map((item) => <li key={item.name}><a href={item.href} className="hover:text-econoway-green font-semibold">{item.name}</a></li>)}
          <li>
            <button onClick={handleAndroid} className="flex items-center gap-2 border border-econoway-green text-econoway-green px-4 py-2 rounded-lg font-bold hover:bg-econoway-green hover:text-white">
              <Smartphone size={16} /> Android
            </button>
          </li>
          <li>
            <Link to="/portal" className="flex items-center gap-2 bg-econoway-green text-white px-5 py-2 rounded-lg font-bold hover:bg-econoway-light">
              <Store size={16} /> Portal
            </Link>
          </li>
        </ul>
        <button aria-label="Abrir menu" className="md:hidden text-text-heading" onClick={() => setIsMenuOpen((value) => !value)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden bg-bg-main border-b border-border-main px-6 pb-6">
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => <a key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>{item.name}</a>)}
            <Link to="/portal" onClick={() => setIsMenuOpen(false)} className="rounded-lg bg-econoway-green px-4 py-3 text-center font-bold text-white">Portal do supermercado / admin</Link>
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
