import React from 'react';
import { motion } from 'framer-motion';
import { hardSkills } from '../lib/data';

const HardSkills: React.FC = () => {
  return (
    <section id="hardskills" className="py-20 container mx-auto px-6 bg-bg-main text-text-main transition-colors duration-300">
      {/* Título com o indicador em Verde Adam Banks */}
      <motion.h2
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-bold mb-12 tracking-tighter text-text-heading"
      >
        <span className="text-econoway-green">/ </span>HARD SKILLS_
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hardSkills.map((hardSkill, index) => (
          <motion.div
            key={hardSkill.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            {/* Informações da Skill */}
            <div className="flex justify-between items-end">
              <span className="font-bold text-base md:text-lg uppercase tracking-wider text-text-heading">
                {hardSkill.name}
              </span>
              {/* Nível destacado em Verde Menta */}
              <span className="text-econoway-light font-mono font-bold">
                {hardSkill.level}%
              </span>
            </div>
            
            {/* Trilho da Barra de Progresso adaptável */}
            <div className="h-2 w-full bg-border-main/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${hardSkill.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-econoway-green rounded-full shadow-sm"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HardSkills;