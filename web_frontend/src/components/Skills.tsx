import React from 'react';
import { motion } from 'framer-motion';
import { skills } from '../lib/data';

const Skills: React.FC = () => {
  return (
    <section id="habilidades" className="py-20 bg-bg-main container mx-auto px-6 relative overflow-hidden">
      {/* Título adaptado para o padrão EconoWay (Verde + Caixa Alta) */}
      <motion.h2
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-extrabold mb-12 tracking-tighter text-text-heading uppercase font-mono"
      >
        <span className="text-econoway-green">/ </span>HABILIDADES_
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-end">
              <span className="font-bold text-base md:text-lg uppercase tracking-wider text-text-heading">
                {skill.name}
              </span>
              {/* Texto com a cor Eco Mint */}
              <span className="text-econoway-light font-mono font-bold">{skill.level}%</span>
            </div>
            
            {/* Barra de Progresso com as cores do tema */}
            <div className="h-2 w-full bg-border-main/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-econoway-green rounded-full shadow-lg shadow-econoway-green/30"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Skills;