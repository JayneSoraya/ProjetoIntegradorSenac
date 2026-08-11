import { useEffect, useState } from 'react';
import { CheckCircle2, FileJson, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { PortalUser } from '../../../lib/api';
import { parseCsv } from '../../../lib/csv';
import { portalApi, type ImportValidation, type ManagedMarket } from '../../../lib/portalApi';
import { PortalShell } from '../../../components/portal/PortalShell';

export function ImportPage({ user }: { user: PortalUser }) {
  const [params, setParams] = useSearchParams(); const [markets, setMarkets] = useState<ManagedMarket[]>([]);
  const [file, setFile] = useState<File | null>(null); const [records, setRecords] = useState<unknown[]>([]); const [format, setFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [validation, setValidation] = useState<ImportValidation | null>(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const marketId = Number(params.get('market') || markets[0]?.id_supermercado || 0);
  useEffect(() => { portalApi.managedMarkets().then((items) => { setMarkets(items); if (!params.get('market') && items[0]) setParams({ market: String(items[0].id_supermercado) }, { replace: true }); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = async (selected: File | null) => {
    setValidation(null); setMessage(''); setRecords([]); setFile(selected); if (!selected) return;
    try {
      if (selected.size > 4 * 1024 * 1024) throw new Error('Arquivo excede o limite de 4 MB do alpha.');
      const lowerName = selected.name.toLowerCase();
      if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.json')) throw new Error('Use um arquivo .csv ou .json.');
      const text = await selected.text();
      const detected = lowerName.endsWith('.json') ? 'JSON' : 'CSV';
      setFormat(detected);
      const parsed = detected === 'JSON' ? JSON.parse(text) : parseCsv(text);
      if (!Array.isArray(parsed)) throw new Error('JSON deve conter uma lista de registros.');
      if (parsed.length > 5000) throw new Error('O alpha aceita no máximo 5.000 registros por importação.');
      setRecords(parsed);
      setMessage(`${parsed.length} registro(s) carregado(s). Valide antes de importar.`);
    } catch (error) {
      setFile(null);
      setMessage(error instanceof Error ? error.message : 'Arquivo inválido.');
    }
  };
  const validate = async () => { if (!marketId || !records.length) return; setBusy(true); setMessage(''); try { const result = await portalApi.validateImport(marketId, records); setValidation(result); setMessage(result.registros_invalidos ? 'Há registros inválidos. Corrija o arquivo antes de confirmar.' : 'Validação concluída. Nenhuma alteração foi publicada ainda.'); } catch { setMessage('Não foi possível validar o arquivo.'); } finally { setBusy(false); } };
  const apply = async () => { if (!marketId || !file || !records.length || !validation || validation.registros_invalidos) return; setBusy(true); try { const result = await portalApi.applyImport(marketId, format, file.name, records); setMessage(`Importação #${result.id_importacao} concluída com sucesso.`); setFile(null); setRecords([]); setValidation(null); } catch { setMessage('Falha ao publicar a importação. Nenhuma importação parcial deve ser considerada válida.'); } finally { setBusy(false); } };

  return <PortalShell user={user} mode="supermarket" title="Importar tabela de preços" subtitle="Fluxo em duas etapas: validar e revisar primeiro; publicar somente após confirmação. CSV e JSON no MVP.">
    {markets.length > 1 && <select value={marketId} onChange={(e) => setParams({ market: e.target.value })} className="mb-5 rounded-xl border border-border-main bg-white px-4 py-3">{markets.map((item) => <option key={item.id_supermercado} value={item.id_supermercado}>{item.nome_fantasia}</option>)}</select>}
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-border-main bg-white p-6 shadow-sm"><div className="flex gap-3"><span className={`rounded-xl px-4 py-2 text-sm font-bold ${format === 'CSV' ? 'bg-econoway-green text-white' : 'bg-gray-100'}`}><FileSpreadsheet className="mr-2 inline" size={17}/> CSV</span><span className={`rounded-xl px-4 py-2 text-sm font-bold ${format === 'JSON' ? 'bg-econoway-green text-white' : 'bg-gray-100'}`}><FileJson className="mr-2 inline" size={17}/> JSON</span></div><label className="mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-main bg-gray-50 p-8 text-center hover:border-econoway-green"><UploadCloud className="text-econoway-green" size={35}/><strong className="mt-4 text-text-heading">Selecione o arquivo</strong><span className="mt-2 text-sm">Cabeçalhos esperados: codigo_produto ou ean, nome_produto, preco; unidade, marca, categoria e preco_fidelidade são opcionais. CSV com vírgula ou ponto e vírgula é aceito.</span><input type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(e) => void choose(e.target.files?.[0] ?? null)}/></label>{file && <p className="mt-4 text-sm"><strong>{file.name}</strong> · {records.length} registro(s)</p>}<button disabled={!records.length || busy} onClick={validate} className="mt-5 w-full rounded-xl bg-econoway-green px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Processando...' : 'Validar arquivo'}</button></div>
      <aside className="rounded-3xl border border-border-main bg-white p-6 shadow-sm"><h2 className="font-bold text-text-heading">Resultado da validação</h2>{!validation ? <p className="mt-3 text-sm">Nenhum arquivo validado.</p> : <><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-gray-50 p-3"><strong className="block text-xl text-text-heading">{validation.total_registros}</strong><span className="text-xs">total</span></div><div className="rounded-xl bg-green-50 p-3"><strong className="block text-xl text-green-700">{validation.registros_validos}</strong><span className="text-xs">válidos</span></div><div className="rounded-xl bg-red-50 p-3"><strong className="block text-xl text-red-600">{validation.registros_invalidos}</strong><span className="text-xs">erros</span></div></div>{validation.erros.length > 0 && <div className="mt-5 max-h-56 overflow-auto text-xs">{validation.erros.map((error) => <p key={`${error.linha}-${error.codigo}`} className="border-b border-border-main py-2"><strong>Linha {error.linha}</strong> · {error.mensagem}</p>)}</div>}<button onClick={apply} disabled={validation.registros_invalidos > 0 || busy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-econoway-green px-4 py-3 font-bold text-white disabled:opacity-40"><CheckCircle2 size={18}/> Confirmar e publicar</button></>}</aside>
    </div>{message && <p className="mt-5 rounded-xl border border-border-main bg-white p-4 text-sm">{message}</p>}
  </PortalShell>;
}
