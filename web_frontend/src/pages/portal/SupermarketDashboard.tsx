import { useEffect, useState } from 'react';
import { FileClock, FileUp, PackageSearch, PencilLine, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PortalUser } from '../../lib/api';
import { portalApi, type ManagedMarket } from '../../lib/portalApi';
import { PortalShell } from '../../components/portal/PortalShell';

export function SupermarketDashboard({ user }: { user: PortalUser }) {
  const [markets, setMarkets] = useState<ManagedMarket[]>([]);
  const [error, setError] = useState('');
  const [inconsistencyCount, setInconsistencyCount] = useState<number | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);

  useEffect(() => {
    portalApi.managedMarkets()
      .then((result) => {
        setMarkets(result);
        setSelectedMarketId((current) => current ?? result[0]?.id_supermercado ?? null);
      })
      .catch(() => setError('Não foi possível carregar os supermercados vinculados à sua conta.'));
  }, []);

  const market = markets.find((item) => item.id_supermercado === selectedMarketId) ?? markets[0];
  const activeMarketId = market?.id_supermercado ?? null;

  useEffect(() => {
    if (!activeMarketId) return;
    portalApi.inconsistencies(activeMarketId, '', 1, 10)
      .then((result) => setInconsistencyCount(result.resumo.produtos_com_inconsistencia))
      .catch(() => setInconsistencyCount(null));
  }, [activeMarketId]);
  const actions = market ? [
    { title: 'Atualizar preços', description: 'Pesquise produtos e edite preços unitários com auditoria.', icon: PencilLine, to: `/supermercado/precos?market=${market.id_supermercado}` },
    { title: 'Importar tabela', description: 'CSV ou JSON com validação, prévia e confirmação antes de publicar.', icon: FileUp, to: `/supermercado/importar?market=${market.id_supermercado}` },
    { title: 'Inconsistências', description: 'Priorize produtos sem preço, desatualizados ou com regra de fidelidade suspeita.', icon: TriangleAlert, to: `/supermercado/inconsistencias?market=${market.id_supermercado}` },
    { title: 'Histórico de importações', description: 'Consulte envios anteriores, status e quantidade de registros.', icon: FileClock, to: `/supermercado/importacoes?market=${market.id_supermercado}` },
  ] : [];

  return (
    <PortalShell user={user} mode="supermarket" title="Painel do supermercado" subtitle="Operação de preços e catálogo. Alterações são autorizadas no backend pelo vínculo da conta com o supermercado.">
      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600">{error}</p>}
      {!error && !market && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900"><strong>Nenhum supermercado ativo vinculado.</strong><p className="mt-2 text-sm">Um administrador precisa aprovar o cadastro e vincular sua conta antes da operação.</p></div>}
      {market && (
        <>
          <article className="rounded-3xl border border-border-main bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div><p className="text-xs font-bold uppercase tracking-wider text-econoway-green">Supermercado ativo</p><h2 className="mt-2 text-2xl font-extrabold text-text-heading">{market.nome_fantasia}</h2><p className="mt-1 text-sm">CNPJ {market.cnpj} · {market.status_cadastro.toLowerCase()}</p></div>
              <div className="grid min-w-48 grid-cols-2 gap-3"><div className="rounded-2xl bg-econoway-green/10 p-4"><PackageSearch className="text-econoway-green"/><strong className="mt-3 block text-2xl text-text-heading">{market.produtos_com_preco}</strong><span className="text-xs">produtos com preço</span></div><div className="rounded-2xl bg-amber-50 p-4"><TriangleAlert className="text-amber-600"/><strong className="mt-3 block text-2xl text-text-heading">{inconsistencyCount ?? '—'}</strong><span className="text-xs">inconsistências</span></div></div>
            </div>
          </article>
          {markets.length > 1 && <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border-main bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-sm text-text-heading">Unidade em operação</strong><p className="text-xs text-slate-500">Sua conta possui {markets.length} supermercados vinculados.</p></div><select value={market.id_supermercado} onChange={(event) => setSelectedMarketId(Number(event.target.value))} className="rounded-xl border border-border-main bg-white px-4 py-2 text-sm font-semibold text-text-heading outline-none focus:border-econoway-green">{markets.map((item) => <option key={item.id_supermercado} value={item.id_supermercado}>{item.nome_fantasia}</option>)}</select></div>}
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {actions.map(({ title, description, icon: Icon, to }) => <Link key={title} to={to} className="rounded-2xl border border-border-main bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-econoway-green"><Icon className="text-econoway-green"/><h3 className="mt-5 font-bold text-text-heading">{title}</h3><p className="mt-2 text-sm leading-relaxed">{description}</p><span className="mt-5 inline-block text-xs font-bold uppercase tracking-wider text-econoway-green">Abrir</span></Link>)}
          </div>
        </>
      )}
    </PortalShell>
  );
}
