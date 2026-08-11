import { apiFetch } from './api';

export interface ManagedMarket {
  id_supermercado: number;
  cnpj: string;
  nome_fantasia: string;
  endereco_completo: string;
  status_cadastro: 'PENDENTE' | 'APROVADO' | 'SUSPENSO';
  esta_aberto: boolean;
  papel: string;
  status_vinculo: string;
  produtos_com_preco: number;
}

export interface MarketProduct {
  id_produto: number;
  codigo_barras: string;
  nome_produto: string;
  marca: string | null;
  categoria: string | null;
  unidade_medida: string | null;
  preco_atual: string | number | null;
  preco_fidelidade: string | number | null;
  fonte: string | null;
  data_atualizacao: string | null;
}


export interface PageInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface MarketProductPage {
  items: MarketProduct[];
  pagination: PageInfo;
}


export type CatalogInconsistencyType = 'SEM_PRECO' | 'PRECO_DESATUALIZADO' | 'FIDELIDADE_MAIOR';

export interface CatalogInconsistency {
  id_produto: number;
  codigo_barras: string;
  nome_produto: string;
  marca: string | null;
  categoria: string | null;
  preco_atual: string | number | null;
  preco_fidelidade: string | number | null;
  data_atualizacao: string | null;
  problemas: CatalogInconsistencyType[];
}

export interface InconsistencyPage {
  resumo: {
    sem_preco: number;
    preco_desatualizado: number;
    fidelidade_maior: number;
    produtos_com_inconsistencia: number;
    janela_frescor_horas: number;
  };
  items: CatalogInconsistency[];
  pagination: PageInfo;
}

export interface ImportValidation {
  checksum: string;
  total_registros: number;
  registros_validos: number;
  registros_invalidos: number;
  preview: Array<Record<string, unknown>>;
  erros: Array<{ linha: number; codigo: string; mensagem: string; registro: unknown }>;
}

export interface ImportHistoryItem {
  id_importacao: number;
  formato: 'CSV' | 'JSON';
  nome_arquivo: string;
  checksum_sha256: string;
  status: string;
  total_registros: number;
  registros_validos: number;
  registros_invalidos: number;
  criada_em: string;
  concluida_em: string | null;
}

export interface AdminUser {
  id_conta: number;
  nome: string;
  email: string;
  tipo_conta: string;
  status_conta: boolean;
  dt_cadastro: string;
  ultimo_login: string | null;
}

export interface AdminMarket {
  id_supermercado: number;
  cnpj: string;
  nome_fantasia: string;
  endereco_completo: string;
  status_cadastro: 'PENDENTE' | 'APROVADO' | 'SUSPENSO';
  esta_aberto: boolean;
  reputacao_media: string | number;
  criado_em: string;
  responsaveis_ativos: number;
  produtos_com_preco: number;
}

export interface AuditItem {
  id_auditoria: number;
  id_conta: number | null;
  ator_nome: string | null;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  dados: unknown;
  criado_em: string;
}

export const portalApi = {
  managedMarkets: () => apiFetch<ManagedMarket[]>('/supermercados/me'),
  marketProducts: (marketId: number, search = '', page = 1, pageSize = 50) => {
    const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) query.set('busca', search);
    return apiFetch<MarketProductPage>(`/supermercados/${marketId}/produtos?${query.toString()}`);
  },
  updatePrice: (marketId: number, productId: number, price: number, loyaltyPrice?: number | null) =>
    apiFetch<void>(`/supermercados/${marketId}/produtos/${productId}/preco`, {
      method: 'PUT',
      body: JSON.stringify({ preco: price, preco_fidelidade: loyaltyPrice ?? null }),
    }),
  validateImport: (marketId: number, records: unknown[]) =>
    apiFetch<ImportValidation>(`/supermercados/${marketId}/importacoes/validar`, {
      method: 'POST',
      body: JSON.stringify({ registros: records }),
    }),
  applyImport: (marketId: number, format: 'CSV' | 'JSON', fileName: string, records: unknown[]) =>
    apiFetch<{ id_importacao: number; status: string }>(`/supermercados/${marketId}/importacoes`, {
      method: 'POST',
      body: JSON.stringify({ formato: format, nome_arquivo: fileName, registros: records }),
    }),
  importHistory: (marketId: number) => apiFetch<ImportHistoryItem[]>(`/supermercados/${marketId}/importacoes`),
  inconsistencies: (marketId: number, type: CatalogInconsistencyType | '' = '', page = 1, pageSize = 50) => {
    const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (type) query.set('tipo', type);
    return apiFetch<InconsistencyPage>(`/supermercados/${marketId}/inconsistencias?${query.toString()}`);
  },
  adminUsers: (search = '') => apiFetch<AdminUser[]>(`/admin/usuarios${search ? `?busca=${encodeURIComponent(search)}` : ''}`),
  setUserActive: (accountId: number, active: boolean) => apiFetch<AdminUser>(`/admin/usuarios/${accountId}/status`, {
    method: 'PATCH', body: JSON.stringify({ ativo: active }),
  }),
  adminMarkets: (status = '') => apiFetch<AdminMarket[]>(`/admin/supermercados${status ? `?status=${status}` : ''}`),
  setMarketStatus: (marketId: number, status: AdminMarket['status_cadastro']) => apiFetch<AdminMarket>(`/admin/supermercados/${marketId}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }),
  audit: () => apiFetch<AuditItem[]>('/admin/auditoria'),
};
