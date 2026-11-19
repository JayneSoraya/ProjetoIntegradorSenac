import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, ShoppingCart, MapPin, Award, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureItem {
  id: string;
  name: string;
  category: string;
  metricLabel: string;
  completionRate: number;
  description: string;
  highlight: string;
  icon: LucideIcon;
}

const featuresData: FeatureItem[] = [
  {
    id: 'receipt-scan',
    name: 'Leitura Instantânea de QR Code / NF-e',
    category: 'Automação Instantânea',
    metricLabel: 'Velocidade de extração',
    completionRate: 100,
    description:
      'Basta apontar a câmera para a nota fiscal. O aplicativo extrai os preços automaticamente em menos de 2 segundos, sem digitação manual.',
    highlight: '+100 EconoCoins',
    icon: QrCode,
  },
  {
    id: 'cart-comparator',
    name: 'Comparador Automático de Carrinho',
    category: 'Economia Inteligente',
    metricLabel: 'Precisão na comparação',
    completionRate: 95,
    description:
      'Monte sua lista de compras e descubra em tempo real qual supermercado de Araraquara entrega o menor valor total para todo o seu carrinho.',
    highlight: 'Menor Custo Real',
    icon: ShoppingCart,
  },
  {
    id: 'price-map',
    name: 'Mapeamento Colaborativo de Ofertas',
    category: 'Comunidade Ativa',
    metricLabel: 'Cobertura regional',
    completionRate: 88,
    description:
      'Acompanhe a atualização diária dos preços alimentada pela própria comunidade de compradores da cidade em um raio inteligente.',
    highlight: 'Raio de 15km',
    icon: MapPin,
  },
  {
    id: 'rewards-club',
    name: 'Clube EconoWayer & Descontos',
    category: 'Clube de Vantagens',
    metricLabel: 'Engajamento dos membros',
    completionRate: 78,
    description:
      'Acumule pontos a cada escaneamento e desbloqueie benefícios e cupons exclusivos em estabelecimentos parceiros da região.',
    highlight: 'Status Ouro',
    icon: Award,
  },
];

const AppFeatures: React.FC = () => {
  return (
    <section
      id="funcionalidades"
      aria-labelledby="funcionalidades-titulo"
      className="relative z-10 w-full py-24 text-text-main transition-colors duration-300"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Cabeçalho com Ancoragem Social */}
        <div className="max-w-3xl mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-econoway-green/10 text-econoway-green border border-econoway-green/20"
          >
            <Sparkles size={13} />
            Por que usar o EconoWay?
          </motion.div>

          <motion.h2
            id="funcionalidades-titulo"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-text-heading"
          >
            <span className="text-econoway-green">/ </span>
            Sua inteligência de compras em{' '}
            <span className="text-econoway-green">Araraquara</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-base md:text-lg text-text-main leading-relaxed"
          >
            Moradores da região já economizaram{' '}
            <strong className="text-text-heading font-bold underline decoration-econoway-green/50 decoration-2 underline-offset-4">
              R$ 1.240 este mês
            </strong>{' '}
            escaneando notas. Nosso algoritmo elimina o esforço mental de comparar preço por preço.
          </motion.p>
        </div>

        {/* Grid de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featuresData.map((feature, index) => {
            const Icone = feature.icon;

            return (
              <motion.article
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="p-7 rounded-2xl bg-bg-main/80 backdrop-blur-md border border-border-main hover:border-econoway-green/45 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg group"
              >
                <div>
                  {/* Linha superior: Ícone + Categoria + Tag de Recompensa */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-econoway-green/10 text-econoway-green flex items-center justify-center group-hover:bg-econoway-green group-hover:text-white transition-colors">
                        <Icone size={22} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-text-main/70">
                        {feature.category}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-econoway-green bg-econoway-green/10 border border-econoway-green/25 px-3 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>

                  {/* Título e Descrição */}
                  <h3 className="font-extrabold text-xl text-text-heading mb-2.5 tracking-tight">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-text-main leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Barra de Progresso / Indicador Visual */}
                <div className="space-y-2 pt-4 border-t border-border-main/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-main/70">
                      {feature.metricLabel}
                    </span>
                    <span className="text-econoway-green font-mono font-bold">
                      {feature.completionRate}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-text-main/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${feature.completionRate}%` }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                      className="h-full bg-linear-to-r from-econoway-green to-econoway-light rounded-full"
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AppFeatures;