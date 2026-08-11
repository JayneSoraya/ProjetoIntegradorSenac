import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Save } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { PortalUser } from '../../../lib/api';
import { portalApi, type ManagedMarket, type MarketProduct, type PageInfo } from '../../../lib/portalApi';
import { PortalShell } from '../../../components/portal/PortalShell';

const emptyPagination: PageInfo = { page: 1, page_size: 50, total: 0, total_pages: 1 };

export function PricesPage({ user }: { user: PortalUser }) {
  const [params, setParams] = useSearchParams();
  const [markets, setMarkets] = useState<ManagedMarket[]>([]);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [pagination, setPagination] = useState<PageInfo>(emptyPagination);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const marketId = Number(params.get('market') || markets[0]?.id_supermercado || 0);
  const market = useMemo(() => markets.find((item) => item.id_supermercado === marketId), [markets, marketId]);

  useEffect(() => {
    portalApi.managedMarkets()
      .then((items) => {
        setMarkets(items);
        if (!params.get('market') && items[0]) setParams({ market: String(items[0].id_supermercado) }, { replace: true });
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProducts = async (page = 1, term = search) => {
    if (!marketId) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await portalApi.marketProducts(marketId, term, page);
      setProducts(response.items);
      setPagination(response.pagination);
    } catch {
      setMessage('Falha ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!marketId) return;
    let cancelled = false;
    void portalApi.marketProducts(marketId, '', 1).then((response) => {
      if (cancelled) return;
      setProducts(response.items);
      setPagination(response.pagination);
      setMessage('');
    }).catch(() => {
      if (!cancelled) setMessage('Falha ao carregar produtos.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [marketId]);

  const runSearch = () => void loadProducts(1, search);
  const save = async (product: MarketProduct, priceRaw: string, loyaltyRaw: string) => {
    const price = Number(priceRaw.replace(',', '.'));
    const loyalty = loyaltyRaw ? Number(loyaltyRaw.replace(',', '.')) : null;
    if (!Number.isFinite(price) || price <= 0 || (loyalty != null && (!Number.isFinite(loyalty) || loyalty <= 0))) {
      setMessage('Informe preços válidos.');
      return;
    }
    try {
      await portalApi.updatePrice(marketId, product.id_produto, price, loyalty);
      setMessage(`Preço de ${product.nome_produto} atualizado.`);
      await loadProducts(pagination.page, search);
    } catch {
      setMessage('Não foi possível atualizar o preço.');
    }
  };

  return <PortalShell user={user} mode="supermarket" title="Atualizar preços" subtitle={market ? `${market.nome_fantasia} · edição manual auditável` : 'Selecione um supermercado vinculado.'}>
    {markets.length > 1 && <select value={marketId} onChange={(e) => setParams({ market: e.target.value })} className="mb-5 rounded-xl border border-border-main bg-white px-4 py-3">{markets.map((item) => <option key={item.id_supermercado} value={item.id_supermercado}>{item.nome_fantasia}</option>)}</select>}
    <div className="flex max-w-2xl gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50" size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch()} placeholder="Produto ou código de barras" className="w-full rounded-xl border border-border-main bg-white py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-econoway-green"/></div><button onClick={runSearch} className="rounded-xl bg-econoway-green px-5 font-bold text-white">Buscar</button></div>
    {message && <p className="mt-4 rounded-xl bg-econoway-green/10 p-3 text-sm text-text-heading">{message}</p>}
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border-main bg-white"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-border-main bg-gray-50 text-xs uppercase"><tr><th className="p-4">Produto</th><th className="p-4">Código</th><th className="p-4">Preço</th><th className="p-4">Fidelidade</th><th className="p-4">Fonte</th><th className="p-4">Ação</th></tr></thead><tbody>{loading ? <tr><td className="p-6" colSpan={6}>Carregando...</td></tr> : products.length === 0 ? <tr><td className="p-6" colSpan={6}>Nenhum produto encontrado.</td></tr> : products.map((product) => <PriceRow key={product.id_produto} product={product} onSave={save}/>)}</tbody></table></div>
    <div className="mt-4 flex flex-col justify-between gap-3 text-sm sm:flex-row sm:items-center">
      <span>{pagination.total} produto(s) · página {pagination.page} de {pagination.total_pages}</span>
      <div className="flex gap-2"><button disabled={pagination.page <= 1 || loading} onClick={() => void loadProducts(pagination.page - 1, search)} className="inline-flex items-center gap-1 rounded-lg border border-border-main bg-white px-3 py-2 font-semibold disabled:opacity-40"><ChevronLeft size={16}/> Anterior</button><button disabled={pagination.page >= pagination.total_pages || loading} onClick={() => void loadProducts(pagination.page + 1, search)} className="inline-flex items-center gap-1 rounded-lg border border-border-main bg-white px-3 py-2 font-semibold disabled:opacity-40">Próxima <ChevronRight size={16}/></button></div>
    </div>
  </PortalShell>;
}

function PriceRow({ product, onSave }: { product: MarketProduct; onSave: (product: MarketProduct, price: string, loyalty: string) => void }) {
  const [price, setPrice] = useState(product.preco_atual == null ? '' : String(product.preco_atual));
  const [loyalty, setLoyalty] = useState(product.preco_fidelidade == null ? '' : String(product.preco_fidelidade));
  return <tr className="border-b border-border-main last:border-0"><td className="p-4"><strong className="text-text-heading">{product.nome_produto}</strong><p className="text-xs">{product.marca || 'Sem marca'} · {product.categoria || 'Sem categoria'}</p></td><td className="p-4 font-mono text-xs">{product.codigo_barras}</td><td className="p-4"><input value={price} inputMode="decimal" onChange={(e) => setPrice(e.target.value)} className="w-28 rounded-lg border border-border-main px-3 py-2"/></td><td className="p-4"><input value={loyalty} inputMode="decimal" onChange={(e) => setLoyalty(e.target.value)} placeholder="opcional" className="w-28 rounded-lg border border-border-main px-3 py-2"/></td><td className="p-4">{product.fonte || 'Sem preço'}</td><td className="p-4"><button onClick={() => onSave(product, price, loyalty)} className="inline-flex items-center gap-2 rounded-lg bg-econoway-green px-3 py-2 font-semibold text-white"><Save size={15}/> Salvar</button></td></tr>;
}
