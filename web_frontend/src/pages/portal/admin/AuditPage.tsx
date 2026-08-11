import { useEffect, useState } from 'react';
import type { PortalUser } from '../../../lib/api';
import { portalApi, type AuditItem } from '../../../lib/portalApi';
import { PortalShell } from '../../../components/portal/PortalShell';

export function AuditPage({ user }: { user: PortalUser }) {
  const [items, setItems] = useState<AuditItem[]>([]); const [error, setError] = useState('');
  useEffect(() => { portalApi.audit().then(setItems).catch(() => setError('Falha ao carregar auditoria.')); }, []);
  return <PortalShell user={user} mode="admin" title="Auditoria" subtitle="Eventos administrativos e operacionais registrados pelo backend.">{error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<div className="overflow-x-auto rounded-2xl border border-border-main bg-white"><table className="w-full min-w-[840px] text-left text-sm"><thead className="border-b border-border-main bg-gray-50 text-xs uppercase"><tr><th className="p-4">Data</th><th className="p-4">Ator</th><th className="p-4">Ação</th><th className="p-4">Entidade</th><th className="p-4">Identificador</th></tr></thead><tbody>{items.map((item) => <tr key={item.id_auditoria} className="border-b border-border-main"><td className="p-4">{new Date(item.criado_em).toLocaleString('pt-BR')}</td><td className="p-4">{item.ator_nome || 'Sistema'}</td><td className="p-4 font-semibold text-text-heading">{item.acao}</td><td className="p-4">{item.entidade}</td><td className="p-4 font-mono text-xs">{item.entidade_id || '—'}</td></tr>)}</tbody></table></div></PortalShell>;
}
