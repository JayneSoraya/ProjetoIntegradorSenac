import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  Package,
  ReceiptText,
  LogOut,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import type { Produto } from '../../types';

interface DashboardKpis {
  totalProdutos: number;
  produtosSemCategoria: number;
  totalMercados: number;
  totalUsuarios: number | null;
  totalNotas: number | null;
}

export function AdminScreen() {
  const navigate = useNavigate();

  const usuarioRaw = localStorage.getItem('@EconoWay:usuario');
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : { nome: 'Gestor', tipo_conta: 'ADMIN' };
  const isAdmin = usuario.tipo_conta === 'ADMIN';

  const [carregandoKpis, setCarregandoKpis] = useState(true);
  const [kpis, setKpis] = useState<DashboardKpis>({
    totalProdutos: 0,
    produtosSemCategoria: 0,
    totalMercados: 0,
    totalUsuarios: null,
    totalNotas: null,
  });
useEffect(() => {
    let ativo = true;

    async function carregarMetricas() {
      setCarregandoKpis(true);

      const [resProdutos, resMercados, resUsuarios] = await Promise.allSettled([
        api.get('/admin/produtos'),
        api.get('/admin/mercados'),
        isAdmin ? api.get('/admin/usuarios') : Promise.reject('restrito'),
      ]);

      if (!ativo) return;

      const listaProdutos: Produto[] =
        resProdutos.status === 'fulfilled'
          ? Array.isArray(resProdutos.value.data)
            ? resProdutos.value.data
            : resProdutos.value.data?.produtos || []
          : [];

      const listaMercados =
        resMercados.status === 'fulfilled'
          ? Array.isArray(resMercados.value.data)
            ? resMercados.value.data
            : resMercados.value.data?.mercados || resMercados.value.data?.supermercados || []
          : [];

      const listaUsuarios =
        resUsuarios.status === 'fulfilled'
          ? Array.isArray(resUsuarios.value.data)
            ? resUsuarios.value.data
            : resUsuarios.value.data?.usuarios || []
          : null;

      const semCategoria = listaProdutos.filter(
        (p) => !p.categoria || p.categoria.trim() === '' || p.categoria.toLowerCase() === 'outros'
      ).length;

      setKpis({
        totalProdutos: listaProdutos.length,
        produtosSemCategoria: semCategoria,
        totalMercados: listaMercados.length,
        totalUsuarios: listaUsuarios ? listaUsuarios.length : null,
        totalNotas: null,
      });

      setCarregandoKpis(false);
    }

    carregarMetricas();
    return () => {
      ativo = false;
    };
  }, [isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('@EconoWay:token');
    localStorage.removeItem('@EconoWay:usuario');
    navigate('/');
  };

  const miniCardsKpi = [
    {
      label: 'Produtos no Catálogo',
      valor: kpis.totalProdutos,
      icon: Package,
      alerta:
        kpis.produtosSemCategoria > 0
          ? `${kpis.produtosSemCategoria} sem categoria`
          : 'Catálogo categorizado',
      temPendencia: kpis.produtosSemCategoria > 0,
      onClick: () => navigate('/admin/produtos'),
    },
    {
      label: 'Mercados Ativos',
      valor: kpis.totalMercados,
      icon: Store,
      alerta: 'Base georreferenciada',
      temPendencia: false,
      onClick: () => navigate('/admin/supermercados'),
    },
    {
      label: 'Usuários Cadastrados',
      valor: kpis.totalUsuarios ?? '—',
      icon: Users,
      alerta: isAdmin ? 'Contas ativas' : 'Visão restrita',
      temPendencia: false,
      onClick: isAdmin ? () => navigate('/admin/usuarios') : undefined,
    },
    {
      label: 'Notas Processadas',
      valor: kpis.totalNotas ?? '—',
      icon: ReceiptText,
      alerta: 'Leituras NFC-e',
      temPendencia: false,
      onClick: undefined,
    },
  ];

  const cards = [
    {
      titulo: 'Usuários',
      subtitulo: 'Ver e gerenciar contas',
      rf: 'RF30.1',
      icon: Users,
      rota: '/admin/usuarios',
      desabilitado: !isAdmin,
      badge: !isAdmin ? 'Apenas Admin' : undefined,
    },
    {
      titulo: 'Mercados',
      subtitulo: 'RF21 — Cadastro e CSV',
      rf: 'RF21',
      icon: Store,
      rota: '/admin/supermercados',
      desabilitado: false,
    },
    {
      titulo: 'Produtos',
      subtitulo: 'Corrigir categorias e excluir',
      rf: 'RF30 • RF47',
      icon: Package,
      rota: '/admin/produtos',
      desabilitado: false,
    },
    {
      titulo: 'Notas',
      subtitulo: 'Auditoria NFC-e (Em breve)',
      rf: 'RF32',
      icon: ReceiptText,
      rota: '/admin/notas',
      desabilitado: true,
      badge: 'Em breve',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans">
      <header className="border-b border-border-main bg-bg-main/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-econoway-green tracking-tight">
              EconoWay
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-econoway-green/10 text-econoway-green">
              <ShieldCheck size={13} />
              {usuario.tipo_conta}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-text-heading">Painel Admin</h1>
          <p className="text-sm text-text-main/70 mt-1">Visão executiva e gestão do EconoWay</p>
        </div>

        {/* Linha de 4 Mini-Cards de Métricas (KPIs) */}
        <section aria-label="Indicadores principais" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {miniCardsKpi.map((kpi, idx) => {
            const IconeKpi = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={kpi.onClick}
                className={`p-4 rounded-2xl border transition-all ${
                  kpi.temPendencia
                    ? 'bg-amber-500/5 border-amber-500/40 hover:border-amber-500'
                    : 'bg-bg-main border-border-main hover:border-econoway-green/40'
                } ${kpi.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between text-text-main/60 mb-2">
                  <span className="text-xs font-semibold">{kpi.label}</span>
                  <IconeKpi
                    size={16}
                    className={kpi.temPendencia ? 'text-amber-500' : 'text-econoway-green'}
                  />
                </div>

                {carregandoKpis ? (
                  <div className="h-8 w-16 rounded-md bg-text-main/10 animate-pulse my-1" />
                ) : (
                  <div className="text-2xl font-extrabold text-text-heading tracking-tight">
                    {kpi.valor}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-1 text-[11px] font-medium">
                  {kpi.temPendencia ? (
                    <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                      <AlertCircle size={12} />
                      {kpi.alerta}
                    </span>
                  ) : (
                    <span className="text-text-main/50">{kpi.alerta}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Grid Principal de Módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card, index) => {
            const Icone = card.icon;
            return (
              <motion.button
                key={card.titulo}
                type="button"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                disabled={card.desabilitado}
                onClick={() => !card.desabilitado && navigate(card.rota)}
                className={`text-left p-6 rounded-2xl border transition-all group flex flex-col justify-between ${
                  card.desabilitado
                    ? 'bg-bg-main/40 border-border-main/50 opacity-55 cursor-not-allowed'
                    : 'bg-econoway-green/5 border-econoway-green/20 hover:border-econoway-green hover:shadow-lg cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div
                    className={`p-3 rounded-xl ${
                      card.desabilitado
                        ? 'bg-text-main/10 text-text-main/50'
                        : 'bg-econoway-green/15 text-econoway-green'
                    }`}
                  >
                    <Icone size={26} />
                  </div>

                  {card.badge ? (
                    <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-text-main/10 text-text-main/70">
                      {card.badge}
                    </span>
                  ) : (
                    <ArrowUpRight
                      size={20}
                      className="text-econoway-green opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>

                <div className="mt-5">
                  <h2 className="text-lg font-bold text-text-heading">{card.titulo}</h2>
                  <p className="text-sm text-text-main/70 mt-1">{card.subtitulo}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}