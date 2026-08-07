import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen flex-col items-center justify-center text-center px-4 pt-20 bg-bg-main text-text-main transition-colors duration-300"
    >
      {/* Container da Imagem Animada */}
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.6, 0.05, 0.01, 0.9],
          delay: 0.2
        }}
        className="mb-8 relative"
      >
        <motion.div
          className="relative h-40 w-40 md:h-52 md:w-52 flex items-center justify-center"
          animate={{
            y: [0, -15, 0], 
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <img
            src="/img/inomeado.svg" 
            alt="EconoWay Ilustração"
            className="object-contain w-full h-full"
          />
        </motion.div>
        
        <motion.div
          className="absolute inset-0 bg-econoway-green/20 rounded-full blur-[60px] -z-10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 0.5,
          ease: [0.6, 0.05, 0.01, 0.9]
        }}
        className="text-6xl md:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-text-heading to-text-main/40"
      >
        EconoWay
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-lg md:text-xl text-econoway-green font-bold uppercase tracking-[0.25em] mt-6 max-w-2xl font-sans"
      >
        Inteligência de preços, economia real e pegada de CO₂ reduzida. 🛒🌱
      </motion.p>

      <motion.div
        className="absolute w-125 h-125 bg-econoway-light/5 rounded-full blur-[120px] -z-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-text-main/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 bg-econoway-green rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;