import { useEffect, useState } from 'react';
import type { PortalUser } from '../../../lib/api';
import { portalApi, type AdminUser } from '../../../lib/portalApi';
import { PortalShell } from '../../../components/portal/PortalShell';

export function UsersPage({ user }: { user: PortalUser }) {
  const [items, setItems] = useState<AdminUser[]>([]); const [search, setSearch] = useState(''); const [message, setMessage] = useState('');
  const load = async () => { try { setItems(await portalApi.adminUsers(search)); } catch { setMessage('Falha ao carregar contas.'); } };
  useEffect(() => {
    let cancelled = false;
    void portalApi.adminUsers('').then((result) => {
      if (!cancelled) setItems(result);
    }).catch(() => {
      if (!cancelled) setMessage('Falha ao carregar contas.');
    });
    return () => { cancelled = true; };
  }, []);
  const toggle = async (item: AdminUser) => { try { await portalApi.setUserActive(item.id_conta, !item.status_conta); setMessage(`Conta ${!item.status_conta ? 'ativada' : 'bloqueada'}.`); await load(); } catch { setMessage('Não foi possível alterar a conta.'); } };
  return <PortalShell user={user} mode="admin" title="Gerenciar usuários" subtitle="Consulta e bloqueio de contas. O tipo de conta não é alterado nesta tela para evitar escalonamento acidental de privilégios."><div className="flex max-w-2xl gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void load()} placeholder="Nome ou e-mail" className="flex-1 rounded-xl border border-border-main bg-white px-4 py-3"/><button onClick={load} className="rounded-xl bg-econoway-green px-5 font-bold text-white">Buscar</button></div>{message && <p className="mt-4 rounded-xl border border-border-main bg-white p-3 text-sm">{message}</p>}<div className="mt-6 overflow-x-auto rounded-2xl border border-border-main bg-white"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-border-main bg-gray-50 text-xs uppercase"><tr><th className="p-4">Conta</th><th className="p-4">Papel</th><th className="p-4">Cadastro</th><th className="p-4">Status</th><th className="p-4">Ação</th></tr></thead><tbody>{items.map((item) => <tr key={item.id_conta} className="border-b border-border-main"><td className="p-4"><strong className="text-text-heading">{item.nome}</strong><p className="text-xs">{item.email}</p></td><td className="p-4">{item.tipo_conta}</td><td className="p-4">{new Date(item.dt_cadastro).toLocaleDateString('pt-BR')}</td><td className="p-4">{item.status_conta ? 'Ativa' : 'Bloqueada'}</td><td className="p-4"><button disabled={item.id_conta === user.id_conta} onClick={() => toggle(item)} className={`rounded-lg px-3 py-2 font-semibold ${item.status_conta ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} disabled:opacity-30`}>{item.status_conta ? 'Bloquear' : 'Ativar'}</button></td></tr>)}</tbody></table></div></PortalShell>;
}
