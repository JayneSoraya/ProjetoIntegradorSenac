import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Coins, Radar, Crown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BenefitItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  metric: string;
  icon: LucideIcon;
}

const appBenefits: BenefitItem[] = [
  {
    id: 'loss-aversion',
    badge: 'Economia Protegida',
    title: 'Não pague a "taxa de desatenção"',
    description:
      'Nas últimas 4 semanas, moradores de Araraquara economizaram em média R$ 87,00 no mercado. O EconoWay garante que esse dinheiro continue no seu bolso.',
    progressLabel: 'Retenção de Economia',
    progressValue: 100,
    metric: 'R$ 87/mês recuperados',
    icon: ShieldCheck,
  },
  {
    id: 'dopamine-loop',
    badge: 'Recompensa Imediata',
    title: 'EconoCoins: Ganhe enquanto economiza',
    description:
      'Cada scan de nota fiscal gera EconoCoins instantâneos. Antecipe recompensas e troque seus pontos por descontos em parceiros locais.',
    progressLabel: 'Multiplicador de Recompensa',
    progressValue: 85,
    metric: '+300 coins por scan',
    icon: Coins,
  },
  {
    id: 'visible-progress',
    badge: 'Meta da Cidade',
    title: 'Mapeamento Coletivo de Preços',
    description:
      'Acompanhe em tempo real o preenchimento do mapa de preços da sua região. Faltam poucas notas para desbloquear o raio total da cidade.',
    progressLabel: 'Mapa de Araraquara',
    progressValue: 64,
    metric: '64% Desbloqueado',
    icon: Radar,
  },
  {
    id: 'social-identity',
    badge: 'Reconhecimento',
    title: 'Torne-se um EconoWayer Ouro',
    description:
      'Escaneie suas notas e suba de nível no clube. Além de economizar no seu carrinho, você ajuda toda a comunidade a encontrar os menores preços.',
    progressLabel: 'Engajamento da Comunidade',
    progressValue: 92,
    metric: 'Nível Ouro (21+ notas)',
    icon: Crown,
  },
];

const AppBenefits: React.FC = () => {
  return (
    <section
      id="beneficios"
      aria-labelledby="beneficios-titulo"
      className="relative z-10 w-full py-24 text-text-main transition-colors duration-300"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Cabeçalho */}
        <div className="max-w-3xl mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-econoway-green/10 text-econoway-green border border-econoway-green/20"
          >
            <TrendingUp size={13} />
            Benefícios do EconoWay
          </motion.div>

          <motion.h2
            id="beneficios-titulo"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-text-heading"
          >
            <span className="text-econoway-green">/ </span>
            Vantagens reais para o seu{' '}
            <span className="text-econoway-green">bolso</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-base md:text-lg text-text-main leading-relaxed"
          >
            Descubra como a gamificação e a inteligência de dados transformam cada compra em economia direta e sustentável.
          </motion.p>
        </div>

        {/* Grid de Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {appBenefits.map((item, index) => {
            const Icone = item.icon;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="p-7 rounded-2xl bg-bg-main/80 backdrop-blur-md border border-border-main hover:border-econoway-green/45 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg group"
              >
                <div>
                  {/* Linha superior: Ícone + Badge + Métrica */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-econoway-green/10 text-econoway-green flex items-center justify-center group-hover:bg-econoway-green group-hover:text-white transition-colors">
                        <Icone size={22} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-text-main/70">
                        {item.badge}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-econoway-green bg-econoway-green/10 border border-econoway-green/25 px-3 py-1 rounded-full">
                      {item.metric}
                    </span>
                  </div>

                  {/* Título e Descrição */}
                  <h3 className="text-xl font-extrabold mb-2.5 text-text-heading tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-text-main">
                    {item.description}
                  </p>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-2 pt-4 border-t border-border-main/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-main/70">
                      {item.progressLabel}
                    </span>
                    <span className="font-mono font-bold text-econoway-green">
                      {item.progressValue}%
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full overflow-hidden bg-text-main/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progressValue}%` }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                      className="h-full rounded-full bg-linear-to-r from-econoway-green to-econoway-light"
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

export default AppBenefits;