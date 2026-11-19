import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-titulo"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center px-6 pt-24 pb-16 text-text-main transition-colors duration-300"
    >
      {/* Badge de Ancoragem Regional */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-econoway-green/10 text-econoway-green border border-econoway-green/25 backdrop-blur-sm"
      >
        <Sparkles size={14} />
        Inteligência de preços em Araraquara
      </motion.div>

      {/* Container da Ilustração Animada */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.1,
        }}
        className="mb-8 relative"
      >
        <motion.div
          className="relative h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 flex items-center justify-center"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <img
            src="/img/logoSaveMoney.svg"
            alt="Ilustração do EconoWay mostrando economia nas compras"
            className="object-contain w-full h-full drop-shadow-md"
          />
        </motion.div>

        {/* Aura ambiental suave */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-econoway-green/15 rounded-full blur-[50px] -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Título Principal */}
      <motion.h1
        id="hero-titulo"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-text-heading via-text-heading to-text-main/50"
      >
        EconoWay
      </motion.h1>

      {/* Proposta de Valor */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-5 max-w-2xl text-base sm:text-lg md:text-xl text-text-main leading-relaxed font-medium"
      >
        Economia inteligente para suas compras. Compare preços reais via{' '}
        <strong className="text-text-heading font-bold">NFC-e</strong>, monte seu carrinho e reduza gastos no supermercado.
      </motion.p>

      {/* CTAs Principais (Lei de Fitts) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
      >
        <a
          href="#funcionalidades"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-econoway-green text-white hover:bg-econoway-light transition-all shadow-lg shadow-econoway-green/20"
        >
          Como funciona
          <ArrowRight size={17} />
        </a>

        <a
          href="#beneficios"
          className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-bold bg-bg-main/80 text-text-heading border border-border-main hover:border-econoway-green/50 backdrop-blur-md transition-all"
        >
          Ver economia real
        </a>
      </motion.div>

      {/* Indicador de Scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-14"
      >
        <a
          href="#sobre"
          aria-label="Rolar para a seção Sobre"
          className="inline-flex w-6 h-10 border-2 border-text-main/30 hover:border-econoway-green/60 rounded-full items-start justify-center p-2 transition-colors"
        >
          <motion.span
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 bg-econoway-green rounded-full block"
          />
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;