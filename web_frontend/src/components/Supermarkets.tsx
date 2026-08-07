import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion'; // Correção: Import de tipo obrigatório resolvido! 🚀
import { projects } from '../lib/data';
import { ExternalLink } from 'lucide-react';
import type { Project } from '../types';

const Supermarkets: React.FC = () => {
  // Mantive os filtros caso você queira categorizar os mercados (ex: Atacado, Premium, etc.)
  const [filter, setFilter] = useState<'all' | 'desenvolvimento' | 'impactoSocial' | 'automacao'>('all');

  const categories: Array<'all' | 'desenvolvimento' | 'impactoSocial' | 'automacao'> = ['all', 'desenvolvimento', 'impactoSocial', 'automacao'];
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter((p: Project) => p.category === filter);

  // Animações suaves do Framer Motion mantidas
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, 0.05, 0.01, 0.9]
      }
    }
  };

  const categoryLabels = {
    all: 'Todos',
    desenvolvimento: 'Atacados',
    impactoSocial: 'Proximidade',
    automacao: 'Destaques'
  };

  return (
    <section id="supermercados" className="py-32 container mx-auto px-6">
      {/* Título adaptado com o Verde Adam Banks */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter text-text-heading"
      >
        <span className="text-econoway-green">/ </span>SUPERMERCADOS_
      </motion.h2>

      {/* Botões de Filtro */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex flex-wrap gap-4 mb-16"
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => setFilter(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest font-semibold transition-all cursor-pointer ${
              filter === category
                ? 'bg-econoway-green text-white shadow-md' // Verde Adam Banks no botão ativo
                : 'bg-border-main/40 text-text-main hover:bg-border-main'
            }`}
          >
            {categoryLabels[category]}
          </motion.button>
        ))}
      </motion.div>

      {/* Grid de Cards de Mercados */}
      <motion.div
        key={filter}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {filteredProjects.map((project: Project) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            className="group relative overflow-hidden bg-bg-main rounded-2xl border border-border-main shadow-md hover:shadow-xl hover:shadow-econoway-light/10 transition-all duration-500"
          >
            {/* Imagem do Card */}
            <div className="relative aspect-video overflow-hidden bg-linear-to-br from-econoway-green to-econoway-light/40 flex items-center justify-center">
              {/* Tag de imagem padrão do HTML consertada para o Vite 🚀 */}
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Botão de Link Externo com Verde Adam Banks mudando para Verde Menta no Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-econoway-green --color-white p-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-econoway-light text-white duration-300"
                >
                  <ExternalLink size={24} />
                </a>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-6 space-y-4 text-left">
              <h3 className="text-2xl font-bold text-text-heading group-hover:text-econoway-green transition-colors">
                {project.title}
              </h3>
              <p className="text-text-main leading-relaxed text-sm">
                {project.description}
              </p>
              
              {/* Tags de Menor Preço / CO2 Reduzido usando o Verde Menta */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-econoway-light/10 text-econoway-light rounded-full border border-econoway-light/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Detalhe decorativo no canto superior do card */}
            <div
              className="absolute top-0 right-0 w-20 h-20 bg-econoway-green/5 pointer-events-none group-hover:bg-econoway-light/10 transition-colors duration-500"
              style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Supermarkets;