import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { produtoService } from '../services/produtoService';
import type { Produto } from '../types';

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroImagem, setFiltroImagem] = useState<string>('TODAS');

  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Debounce de 400ms para evitar requisições a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await produtoService.listarAdmin({
        busca: buscaDebounced,
        status_enriquecimento: filtroStatus,
        status_imagem:
          filtroImagem === 'SEM_IMAGEM'
            ? 'sem_imagem'
            : filtroImagem === 'COM_IMAGEM'
              ? 'com_imagem'
              : undefined,
      });
      setProdutos(lista);
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Erro ao carregar lista de produtos.' });
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, filtroStatus, filtroImagem]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Helpers e contadores centralizados
  const statusDe = (p: Produto) => p.status_enriquecimento || 'PENDENTE';
  const temImagem = (p: Produto) => Boolean(p.imagem_url && p.imagem_url.trim() !== '');

  const contadores = useMemo(() => {
    const pendentes = produtos.filter((p) => statusDe(p) === 'PENDENTE').length;
    const enriquecidos = produtos.filter((p) => statusDe(p) === 'ENRIQUECIDO').length;
    const concluidos = produtos.filter((p) => statusDe(p) === 'CONCLUIDO').length;
    const comImagem = produtos.filter(temImagem).length;
    const semImagem = produtos.length - comImagem;

    return { pendentes, enriquecidos, concluidos, comImagem, semImagem };
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const passouStatus = filtroStatus === 'TODOS' || statusDe(p) === filtroStatus;
      const possuiImg = temImagem(p);
      const passouImagem =
        filtroImagem === 'TODAS'
          ? true
          : filtroImagem === 'COM_IMAGEM'
            ? possuiImg
            : !possuiImg;

      return passouStatus && passouImagem;
    });
  }, [produtos, filtroStatus, filtroImagem]);

  const atualizarProduto = async (id: number, dados: Partial<Produto>): Promise<boolean> => {
    setSalvando(true);
    setFeedback(null);
    try {
      const atualizado = await produtoService.atualizar(id, dados);
      setProdutos((prev) =>
        prev.map((item) => (item.id_produto === id ? { ...item, ...atualizado, ...dados } : item))
      );
      setFeedback({ tipo: 'sucesso', texto: 'Produto atualizado com sucesso!' });
      return true;
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.erro || 'Erro ao atualizar produto.'
        : 'Falha de comunicação com o servidor.';
      setFeedback({ tipo: 'erro', texto: msg });
      return false;
    } finally {
      setSalvando(false);
    }
  };

  // RF47: Exclusão segura
  const excluirProduto = async (produto: Produto): Promise<boolean> => {
    setExcluindo(true);
    setFeedback(null);
    try {
      await produtoService.excluir(produto.id_produto);
      setProdutos((prev) => prev.filter((item) => item.id_produto !== produto.id_produto));
      setFeedback({
        tipo: 'sucesso',
        texto: `Produto "${produto.nome_produto}" removido com sucesso.`,
      });
      return true;
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.erro ||
          'Não foi possível excluir. Verifique se há notas fiscais vinculadas.'
        : 'Erro inesperado ao excluir produto.';
      setFeedback({ tipo: 'erro', texto: msg });
      return false;
    } finally {
      setExcluindo(false);
    }
  };

  return {
    produtos,
    produtosFiltrados,
    contadores,
    carregando,
    salvando,
    excluindo,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    filtroImagem,
    setFiltroImagem,
    feedback,
    setFeedback,
    recarregar: carregar,
    atualizarProduto,
    excluirProduto,
    statusDe,
    temImagem,
  };
}