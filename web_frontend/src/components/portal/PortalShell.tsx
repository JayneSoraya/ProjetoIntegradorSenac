import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Shield, Store } from 'lucide-react';
import { logout, type PortalUser } from '../../lib/api';

interface PortalShellProps {
  user: PortalUser;
  title: string;
  subtitle?: string;
  children: ReactNode;
  mode: 'admin' | 'supermarket';
}

const navByMode = {
  admin: [
    ['/admin', 'Visão geral'],
    ['/admin/usuarios', 'Usuários'],
    ['/admin/supermercados', 'Supermercados'],
    ['/admin/auditoria', 'Auditoria'],
  ],
  supermarket: [
    ['/supermercado', 'Visão geral'],
    ['/supermercado/precos', 'Preços'],
    ['/supermercado/importar', 'Importar preços'],
    ['/supermercado/importacoes', 'Histórico'],
  ],
} as const;

export function PortalShell({ user, title, subtitle, children, mode }: PortalShellProps) {
  const navigate = useNavigate();
  const nav = navByMode[mode];
  const Icon = mode === 'admin' ? Shield : Store;

  const leave = async () => {
    await logout();
    navigate('/portal', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border-main bg-white/70 px-5 py-5 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-econoway-green text-white"><Icon size={21} /></div>
          <div><strong className="text-text-heading">EconoWay</strong><p className="text-xs">{mode === 'admin' ? 'Administração' : 'Portal do supermercado'}</p></div>
        </div>
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
          {nav.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === `/${mode === 'admin' ? 'admin' : 'supermercado'}`} className={({ isActive }) => `whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-econoway-green text-white' : 'hover:bg-econoway-green/10 hover:text-econoway-green'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 hidden rounded-2xl border border-border-main p-4 lg:block">
          <p className="font-semibold text-text-heading">{user.nome}</p><p className="mt-1 break-all text-xs">{user.email}</p>
          <button onClick={leave} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600"><LogOut size={16}/> Sair</button>
        </div>
      </aside>
      <main className="min-w-0">
        <header className="border-b border-border-main bg-bg-main/90 px-6 py-7 backdrop-blur md:px-10">
          <div className="mx-auto max-w-7xl"><h1 className="text-3xl font-extrabold text-text-heading">{title}</h1>{subtitle && <p className="mt-2 max-w-3xl">{subtitle}</p>}</div>
        </header>
        <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">{children}</section>
      </main>
    </div>
  );
}
