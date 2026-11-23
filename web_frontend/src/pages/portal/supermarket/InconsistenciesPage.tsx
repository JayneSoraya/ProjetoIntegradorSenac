import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock3, RefreshCcw, Tag, TriangleAlert } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { PortalUser } from '../../../lib/api';
import { PortalShell } from '../../../components/portal/PortalShell';
import { portalApi, type CatalogInconsistency, type CatalogInconsistencyType, type InconsistencyPage } from '../../../lib/portalApi';

type Filter = '' | CatalogInconsistencyType;

function money(value: string | number | null) {
  if (value == null) return '—';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function issueLabel(issue: CatalogInconsistencyType) {
  if (issue === 'SEM_PRECO') return 'Sem preço';
  if (issue === 'PRECO_DESATUALIZADO') return 'Preço desatualizado';
  return 'Fidelidade maior que preço normal';
}

function IssueIcon({ issue }: { issue: CatalogInconsistencyType }) {
  if (issue === 'SEM_PRECO') return <Tag size={15} />;
  if (issue === 'PRECO_DESATUALIZADO') return <Clock3 size={15} />;
  return <TriangleAlert size={15} />;
}

export function InconsistenciesPage({ user }: { user: PortalUser }) {
  const [params] = useSearchParams();
  const marketId = Number(params.get('market'));
  const [filter, setFilter] = useState<Filter>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InconsistencyPage | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validMarket = Number.isInteger(marketId) && marketId > 0;

  const load = async () => {
    if (!validMarket) return;
    setLoading(true);
    setError('');
    try {
      setData(await portalApi.inconsistencies(marketId, filter, page, 50));
    } catch {
      setError('Não foi possível carregar as inconsistências do catálogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!validMarket) return;
    let cancelled = false;
    void portalApi.inconsistencies(marketId, filter, page, 50).then((result) => {
      if (!cancelled) { setData(result); setError(''); }
    }).catch(() => {
      if (!cancelled) setError('NÃ£o foi possÃ­vel carregar as inconsistÃªncias do catÃ¡logo.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [marketId, filter, page, validMarket]);

  const filters = useMemo<Array<{ key: Filter; label: string; count?: number }>>(() => [
    { key: '', label: 'Todas', count: data?.resumo.produtos_com_inconsistencia },
    { key: 'SEM_PRECO', label: 'Sem preço', count: data?.resumo.sem_preco },
    { key: 'PRECO_DESATUALIZADO', label: 'Desatualizados', count: data?.resumo.preco_desatualizado },
    { key: 'FIDELIDADE_MAIOR', label: 'Fidelidade suspeita', count: data?.resumo.fidelidade_maior },
  ], [data]);

  return (
    <PortalShell
      user={user}
      mode="supermarket"
      title="Inconsistências de catálogo"
      subtitle="Fila operacional baseada em regras objetivas. O sistema não tenta deduplicar produtos por nome automaticamente."
    >
      {!validMarket && <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">Supermercado não informado. Volte ao painel e selecione uma unidade.</p>}
      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600">{error}</p>}

      {validMarket && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {filters.map(({ key, label, count }) => (
              <button
                key={key || 'all'}
                onClick={() => { setFilter(key); setPage(1); }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === key ? 'border-econoway-green bg-econoway-green text-white' : 'border-border-main bg-white text-text-heading hover:border-econoway-green'}`}
              >
                {label}{count == null ? '' : ` · ${count}`}
              </button>
            ))}
            <button onClick={() => void load()} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border-main bg-white px-4 py-2 text-sm font-semibold hover:border-econoway-green">
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Atualizar
            </button>
          </div>

          {data && (
            <div className="mb-6 rounded-2xl border border-border-main bg-white p-5 text-sm text-text-main shadow-sm">
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} /><div><strong className="text-text-heading">O que entra nesta fila?</strong><p className="mt-1 leading-relaxed">Produto sem preço nesta unidade; preço sem atualização há mais de {data.resumo.janela_frescor_horas} horas; ou preço de fidelidade maior que o preço normal. Duplicidades por similaridade de nome não são alteradas automaticamente porque isso produziria falsos positivos.</p></div></div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border-main bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Produto</th><th className="px-5 py-4">Preço</th><th className="px-5 py-4">Última atualização</th><th className="px-5 py-4">Problemas</th></tr></thead>
                <tbody className="divide-y divide-border-main">
                  {data?.items.map((item: CatalogInconsistency) => (
                    <tr key={item.id_produto}>
                      <td className="px-5 py-4"><strong className="block text-text-heading">{item.nome_produto}</strong><span className="text-xs text-slate-500">{item.codigo_barras}{item.marca ? ` · ${item.marca}` : ''}</span></td>
                      <td className="px-5 py-4"><span className="font-semibold text-text-heading">{money(item.preco_atual)}</span>{item.preco_fidelidade != null && <span className="block text-xs text-slate-500">Fidelidade: {money(item.preco_fidelidade)}</span>}</td>
                      <td className="px-5 py-4 text-slate-600">{item.data_atualizacao ? new Date(item.data_atualizacao).toLocaleString('pt-BR') : 'Nunca'}</td>
                      <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{item.problemas.map((issue) => <span key={issue} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"><IssueIcon issue={issue}/>{issueLabel(issue)}</span>)}</div></td>
                    </tr>
                  ))}
                  {!loading && data?.items.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">Nenhuma inconsistência encontrada para este filtro.</td></tr>}
                  {loading && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">Carregando...</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.pagination.total_pages > 1 && <div className="mt-5 flex items-center justify-between text-sm"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border px-4 py-2 disabled:opacity-40">Anterior</button><span>Página {data.pagination.page} de {data.pagination.total_pages} · {data.pagination.total} registros</span><button disabled={page >= data.pagination.total_pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Próxima</button></div>}
        </>
      )}
    </PortalShell>
  );
}
