import { api } from './api';
import type { Produto } from '../types';

export interface FiltrosProdutoAdmin {
  busca?: string;
  status_enriquecimento?: string;
  status_imagem?: 'sem_imagem' | 'com_imagem';
  pagina?: number;
  limite?: number;
}

export const produtoService = {
  async listarAdmin(filtros: FiltrosProdutoAdmin = {}): Promise<Produto[]> {
    const params: Record<string, string | number> = {
      pagina: filtros.pagina ?? 1,
      limite: filtros.limite ?? 500,
    };

    if (filtros.busca?.trim()) {
      params.busca = filtros.busca.trim();
    }
    if (filtros.status_enriquecimento && filtros.status_enriquecimento !== 'TODOS') {
      params.status_enriquecimento = filtros.status_enriquecimento;
    }
    if (filtros.status_imagem) {
      params.status_imagem = filtros.status_imagem;
    }

    const { data } = await api.get('/admin/produtos', { params });
    return Array.isArray(data) ? data : data.produtos || [];
  },

  async atualizar(id: number, dados: Partial<Produto>): Promise<Produto> {
    const { data } = await api.put(`/admin/produtos/${id}`, dados);
    return data;
  },

  async excluir(id: number): Promise<void> {
    // Atende ao RF47 (Administração de Produtos - apagar produto)
    await api.delete(`/admin/produtos/${id}`);
  },
};