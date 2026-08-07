import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { socialLinks } from '../lib/data';
import type { SocialLink } from '../types';

const BehanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
  </svg>
);

const iconMap: Record<string, React.ElementType> = {
  mail: Mail,
  phone: Phone,
  behance: BehanceIcon
};

const Contact: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200 };
  const lightX = useSpring(mouseX, springConfig);
  const lightY = useSpring(mouseY, springConfig);

  const backgroundLight = useTransform(
    [lightX, lightY],
    ([x, y]) => `radial-gradient(500px circle at ${x}px ${y}px, rgba(46, 117, 89, 0.15), transparent 70%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  return (
    <section 
      id="redes-sociais" 
      className="py-32 text-center relative overflow-hidden bg-bg-main text-text-main transition-colors duration-300"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Efeito Lanterna Rastreadora */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ background: backgroundLight }}
      />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-extrabold mb-16 tracking-tighter uppercase relative z-10 text-text-heading"
      >
        <span className="text-econoway-green">/ </span>CONECTAR_
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="flex justify-center gap-12 flex-wrap relative z-10 max-w-2xl mx-auto px-4"
      >
        {socialLinks.map((link: SocialLink, index: number) => {
          const Icon = iconMap[link.icon];
          if (!Icon) return null;

          return (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group p-2"
            >
              {/* Ícone Principal */}
              <motion.div 
                className="text-text-main/60 group-hover:text-econoway-green transition-colors relative z-10"
                whileHover={{
                  rotate: [-1, 1, -1, 1, 0],
                  x: [-1.5, 1.5, -1.5, 1.5, 0],
                  transition: { duration: 0.4, repeat: Infinity, repeatDelay: 0.1 }
                }}
              >
                <Icon size={44} />
              </motion.div>
              
              <motion.div
                className="absolute inset-0 p-2 text-econoway-light opacity-0 group-hover:opacity-40 -z-10"
                animate={{
                  x: [-2, 2, -1, 2, 0],
                  opacity: [0, 0.4, 0, 0.4, 0]
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <Icon size={44} />
              </motion.div>
              
              <motion.div
                className="absolute inset-0 p-2 text-emerald-700 opacity-0 group-hover:opacity-30 -z-10"
                animate={{
                  x: [2, -2, 2, -1, 0],
                  opacity: [0, 0.3, 0, 0.3, 0]
                }}
                transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
              >
                <Icon size={44} />
              </motion.div>

              {/* Aura de fundo Pulsante */}
              <motion.div
                className="absolute inset-0 bg-econoway-light/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Tag com Nome da Rede */}
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-bold font-mono tracking-widest text-econoway-green uppercase whitespace-nowrap pointer-events-none"
              >
                {link.name}
              </motion.span>
            </motion.a>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Contact;