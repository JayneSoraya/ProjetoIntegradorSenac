import React from 'react';
import { motion } from 'framer-motion';
import { aboutText } from '../lib/data'; // Ajuste o caminho se necessário

const About: React.FC = () => {
  return (
    <section id="sobre" className="py-24 container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center gap-16 justify-center">
        
        {/* Lado Esquerdo - Foto */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* CONTAINER COM AS CORES ECONOWAY */}
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl border-2 border-[#0B5345]/30 p-2 bg-[#0B5345]/10 backdrop-blur-sm shadow-2xl shadow-[#2ECC71]/10 overflow-hidden z-10">
              <img 
                src="/img/jayne.png" 
                alt="Foto de Jayne Soraya"
                className="w-full h-full object-cover rounded-xl relative z-10" 
              />
              
              {/* Overlay decorativo */}
              <div className="absolute inset-0 border border-[#2ECC71]/20 rounded-xl pointer-events-none z-20" />
            </div>

            {/* ÓRBITA CORRIGIDA: Agora é um círculo perfeito (rounded-full) */}
            <motion.div
              className="absolute -inset-6 rounded-full border border-econoway-green/30 z-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            >
              {/* Bolinha Verde Menta suave que gira ao redor da foto */}
              <div className="absolute top-6 left-8 w-4 h-4 bg-econoway-light rounded-full shadow-[0_0_15px_#2ECC71]" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Lado Direito - Textos */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl space-y-6 text-left"
        >
          <motion.h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#F9FAFB]">
            <span className="ligth">/ </span>
            {aboutText.title}
          </motion.h2>

          <motion.p className="text-[#F9FAFB]/80 text-lg leading-relaxed">
            {aboutText.description}
          </motion.p>

          <motion.p className="text-[#F9FAFB]/70 text-lg leading-relaxed italic border-l-4 border-[#0B5345] pl-4">
            {aboutText.detailedDescription}
          </motion.p>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-0.5 bg-linear-r from-econoway-light to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default About;