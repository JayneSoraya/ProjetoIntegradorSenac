import { useEffect, useState } from 'react';
import { Building2, CircleAlert, PackageSearch, Users } from 'lucide-react';
import type { PortalUser } from '../../lib/api';
import { apiFetch } from '../../lib/api';
import { PortalShell } from '../../components/portal/PortalShell';

interface AdminSummary { usuarios_ativos: number; supermercados: number; produtos: number; importacoes_com_erro: number; }

export function AdminDashboard({ user }: { user: PortalUser }) {
  const [summary, setSummary] = useState<AdminSummary | null>(null); const [error, setError] = useState('');
  useEffect(() => { apiFetch<AdminSummary>('/admin/resumo').then(setSummary).catch(() => setError('Não foi possível carregar os indicadores administrativos.')); }, []);
  const cards = [
    { label: 'Usuários ativos', value: summary?.usuarios_ativos, icon: Users },
    { label: 'Supermercados', value: summary?.supermercados, icon: Building2 },
    { label: 'Produtos cadastrados', value: summary?.produtos, icon: PackageSearch },
    { label: 'Importações com erro', value: summary?.importacoes_com_erro, icon: CircleAlert },
  ];
  return <PortalShell user={user} mode="admin" title="Painel administrativo" subtitle="Gestão de contas, supermercados e rastreabilidade operacional.">{error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-border-main bg-white p-5 shadow-sm"><Icon className="text-econoway-green"/><p className="mt-5 text-sm">{label}</p><strong className="mt-1 block text-3xl text-text-heading">{value ?? '—'}</strong></article>)}</div><div className="mt-8 rounded-2xl border border-border-main bg-white p-6"><h2 className="font-bold text-text-heading">Princípio operacional</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed">A interface pode ocultar ações por papel, mas toda autorização também é validada pela API. Alterações administrativas relevantes geram eventos de auditoria.</p></div></PortalShell>;
}
