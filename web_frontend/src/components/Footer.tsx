import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 text-center text-text-main/50 text-xs font-mono uppercase border-t border-border-main relative overflow-hidden bg-bg-main transition-colors duration-300">
      <motion.div
        className="absolute top-0 left-0 h-[1.5px] bg-linear-to-r from-transparent via-econoway-green to-transparent"
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{ width: '50%' }}
      />

      <div className="space-y-2 relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Powered by <span className="text-econoway-green font-bold">JSSYSTEM</span> Copyright © {currentYear}. All Rights Reserved.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-text-main/70"
        >
          Construído com <span className="text-econoway-light font-bold">♥</span> por <span className="text-econoway-green font-bold">Jayne Soraya</span>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;