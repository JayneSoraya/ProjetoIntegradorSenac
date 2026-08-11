import { useEffect, useState } from 'react';
import type { PortalUser } from '../../../lib/api';
import { portalApi, type AdminMarket } from '../../../lib/portalApi';
import { PortalShell } from '../../../components/portal/PortalShell';

export function MarketsPage({ user }: { user: PortalUser }) {
  const [items, setItems] = useState<AdminMarket[]>([]); const [status, setStatus] = useState(''); const [message, setMessage] = useState('');
  const load = async (filter = status) => { try { setItems(await portalApi.adminMarkets(filter)); } catch { setMessage('Falha ao carregar supermercados.'); } };
  useEffect(() => {
    let cancelled = false;
    void portalApi.adminMarkets('').then((result) => {
      if (!cancelled) setItems(result);
    }).catch(() => {
      if (!cancelled) setMessage('Falha ao carregar supermercados.');
    });
    return () => { cancelled = true; };
  }, []);
  const change = async (item: AdminMarket, next: AdminMarket['status_cadastro']) => { try { await portalApi.setMarketStatus(item.id_supermercado, next); setMessage(`${item.nome_fantasia}: status alterado para ${next}.`); await load(); } catch { setMessage('Não foi possível alterar o supermercado.'); } };
  return <PortalShell user={user} mode="admin" title="Gerenciar supermercados" subtitle="Aprovação e suspensão de estabelecimentos que alimentam o mapa de preços."><div className="flex items-center gap-3"><select value={status} onChange={(e) => { setStatus(e.target.value); void load(e.target.value); }} className="rounded-xl border border-border-main bg-white px-4 py-3"><option value="">Todos</option><option>PENDENTE</option><option>APROVADO</option><option>SUSPENSO</option></select></div>{message && <p className="mt-4 rounded-xl border border-border-main bg-white p-3 text-sm">{message}</p>}<div className="mt-6 grid gap-4">{items.map((item) => <article key={item.id_supermercado} className="rounded-2xl border border-border-main bg-white p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h2 className="font-bold text-text-heading">{item.nome_fantasia}</h2><p className="mt-1 text-sm">CNPJ {item.cnpj} · {item.endereco_completo}</p><p className="mt-2 text-xs">{item.produtos_com_preco} produtos com preço · {item.responsaveis_ativos} responsáveis ativos</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-bold">{item.status_cadastro}</span>{item.status_cadastro !== 'APROVADO' && <button onClick={() => change(item, 'APROVADO')} className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">Aprovar</button>}{item.status_cadastro !== 'SUSPENSO' && <button onClick={() => change(item, 'SUSPENSO')} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">Suspender</button>}</div></div></article>)}</div></PortalShell>;
}
