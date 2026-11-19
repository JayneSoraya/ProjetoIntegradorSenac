import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Compass, HeartHandshake, Sparkles } from 'lucide-react';
import { aboutText } from '../lib/data';

const VALORES = [
  'Transparência',
  'Compromisso Social',
  'Acessibilidade',
  'Colaboração',
];

const PILARES = [
  {
    id: 'missao',
    titulo: 'Missão',
    icon: Target,
    descricao:
      'Facilitar o acesso à informação de preços em mercados e supermercados, promovendo uma plataforma que torna a comparação simples, rápida e acessível a todos, favorecendo a redução no custo de vida das pessoas.',
  },
  {
    id: 'visao',
    titulo: 'Visão',
    icon: Compass,
    descricao:
      'Sermos uma das principais plataformas de comparação de preços do Brasil, reconhecida por transformar e fortalecer o poder de compra dos brasileiros.',
  },
];

const About: React.FC = () => {
  const refNarrativa = useRef<HTMLDivElement>(null);
  const refPilares = useRef<HTMLDivElement>(null);

  const narrativaVisivel = useInView(refNarrativa, { once: true, margin: '-60px' });
  const pilaresVisiveis = useInView(refPilares, { once: true, margin: '-60px' });

  return (
    <section
      id="sobre"
      aria-labelledby="sobre-titulo"
      className="relative z-10 py-24 container mx-auto px-6 max-w-6xl"
    >
      {/* ── BLOCO 1: Narrativa e Ancoragem Visual (Z-Pattern) ── */}
      <div
        ref={refNarrativa}
        className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16"
      >
        {/* Lado Esquerdo — Imagem + Órbita */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={narrativaVisivel ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative shrink-0"
        >
          <motion.div
            className="relative z-10"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4 }}
          >
            {/* Card da Foto */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl p-2 backdrop-blur-sm overflow-hidden border-2 border-econoway-green/30 shadow-2xl bg-econoway-green/10">
              <img
                src="/img/womanSupermarket.jpg"
                alt="Consumidora utilizando o EconoWay no corredor do supermercado"
                className="w-full h-full object-cover object-center rounded-2xl relative z-10"
              />
              {/* Gradiente sutil na base para dar profundidade */}
              <div className="absolute inset-x-2 bottom-2 h-20 rounded-b-2xl bg-linear-to-t from-black/60 to-transparent pointer-events-none z-20" />
              <span className="absolute bottom-5 left-5 z-30 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-main/90 text-text-heading border border-border-main shadow-md backdrop-blur-md">
                <Sparkles size={13} className="text-econoway-green" />
                Inteligência colaborativa
              </span>
            </div>

            {/* Órbita giratória suave (sem fadiga periférica) */}
            <motion.div
              aria-hidden="true"
              className="absolute -inset-5 rounded-full z-0 pointer-events-none border border-econoway-light/25"
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-6 left-8 w-3.5 h-3.5 rounded-full bg-econoway-light shadow-[0_0_14px_#2ECC71]" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Lado Direito — Texto Institucional */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={narrativaVisivel ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="max-w-xl space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-econoway-green/10 border border-econoway-green/20 text-econoway-green text-xs font-bold uppercase tracking-wider">
            Quem Somos
          </div>

          <h2
            id="sobre-titulo"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-heading"
          >
            <span className="text-econoway-green">/ </span>
            {aboutText.title}
          </h2>

          <p className="text-base md:text-lg text-text-main leading-relaxed">
            {aboutText.description}
          </p>

          <blockquote className="text-sm md:text-base text-text-main/90 leading-relaxed italic pl-4 py-1 border-l-4 border-econoway-green bg-econoway-green/5 rounded-r-xl">
            {aboutText.detailedDescription}
          </blockquote>

          {/* Linha divisória progressiva */}
          <div className="pt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={narrativaVisivel ? { width: '100%' } : {}}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="h-0.5 bg-linear-to-r from-econoway-green via-econoway-light/50 to-transparent"
            />
          </div>
        </motion.div>
      </div>

      {/* ── BLOCO 2: Missão, Visão e Valores (Gestalt + Chunking) ── */}
      <div
        ref={refPilares}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Cards de Missão e Visão */}
        {PILARES.map((pilar, index) => {
          const Icone = pilar.icon;
          return (
            <motion.article
              key={pilar.id}
              initial={{ opacity: 0, y: 24 }}
              animate={pilaresVisiveis ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="p-7 rounded-2xl bg-bg-main/80 backdrop-blur-md border border-border-main hover:border-econoway-green/40 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-econoway-green/10 text-econoway-green flex items-center justify-center mb-5 group-hover:bg-econoway-green group-hover:text-white transition-colors">
                  <Icone size={24} />
                </div>

                <h3 className="text-xl font-extrabold text-text-heading mb-3 tracking-tight">
                  {pilar.titulo}
                </h3>

                <p className="text-sm text-text-main leading-relaxed">
                  {pilar.descricao}
                </p>
              </div>
            </motion.article>
          );
        })}

        {/* Card de Valores (Chunking em Pills para leitura rápida) */}
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={pilaresVisiveis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="p-7 rounded-2xl bg-bg-main/80 backdrop-blur-md border border-border-main hover:border-econoway-green/40 transition-all shadow-lg flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-econoway-green/10 text-econoway-green flex items-center justify-center mb-5 group-hover:bg-econoway-green group-hover:text-white transition-colors">
              <HeartHandshake size={24} />
            </div>

            <h3 className="text-xl font-extrabold text-text-heading mb-3 tracking-tight">
              Valores
            </h3>

            <p className="text-sm text-text-main leading-relaxed mb-5">
              Os pilares éticos e humanos que guiam cada decisão da plataforma:
            </p>

            <ul className="flex flex-wrap gap-2" aria-label="Valores do EconoWay">
              {VALORES.map((valor) => (
                <li
                  key={valor}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-econoway-green/10 text-econoway-green border border-econoway-green/20"
                >
                  {valor}
                </li>
              ))}
            </ul>
          </div>
        </motion.article>
      </div>
    </section>
  );
};

export default About;