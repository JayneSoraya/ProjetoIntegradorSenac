import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  ChevronDown,
  Edit3,
  Trash2,
  Receipt,
  Image as ImageIcon,
  ImageOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useProdutos } from '../../hooks/useProdutos';
import type { Produto } from '../../types';

const CORES_CATEGORIA: Record<string, string> = {
  Alimentos: 'bg-orange-500',
  Bebidas: 'bg-blue-500',
  'Higiene e Limpeza': 'bg-teal-500',
  'Carnes e Peixes': 'bg-red-500',
  Laticínios: 'bg-yellow-500',
  Snacks: 'bg-purple-500',
  Hortifruti: 'bg-green-500',
  Padaria: 'bg-amber-800',
};

export function AdminProdutosScreen() {
  const navigate = useNavigate();

  // Camada Controller (estados de dados, filtros e API isolados no hook)
  const {
    produtos,
    produtosFiltrados,
    contadores,
    carregando,
    excluindo,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    filtroImagem,
    setFiltroImagem,
    feedback,
    setFeedback,
    recarregar,
    excluirProduto,
    statusDe,
    temImagem,
  } = useProdutos();

  // Estados puramente visuais (controle de UI local)
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);

  const labelStatus = (status: string) => {
    if (status === 'CONCLUIDO') {
      return { texto: 'Concluído', dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500' };
    }
    if (status === 'ENRIQUECIDO') {
      return { texto: 'Enriquecido', dot: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-500' };
    }
    return { texto: 'Pendente', dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-500' };
  };

  const confirmarExclusao = async () => {
    if (!produtoParaExcluir) return;
    await excluirProduto(produtoParaExcluir);
    setProdutoParaExcluir(null);
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans pb-12">
      {/* Header */}
      <header className="border-b border-border-main bg-bg-main/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg hover:bg-econoway-green/10 text-text-main hover:text-econoway-green transition-colors cursor-pointer"
              title="Voltar ao Painel Admin"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-text-heading leading-none">Produtos</h1>
              <span className="text-[11px] text-text-main/60">Curadoria e Catálogo (RF30 • RF47)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={recarregar}
            disabled={carregando}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-econoway-green hover:bg-econoway-green/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-6">
        {/* Alertas de Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-5 p-3.5 rounded-xl border flex items-center justify-between text-sm font-medium ${
                feedback.tipo === 'sucesso'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.tipo === 'sucesso' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                <span>{feedback.texto}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs underline opacity-80 hover:opacity-100 cursor-pointer"
              >
                Fechar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de Busca */}
        <div className="relative mb-5">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-econoway-green"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto, marca ou código de barras..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all"
          />
        </div>

        {/* Filtros (Chips) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl border border-border-main bg-bg-main/50">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-main/60 mb-2">
              Status Enriquecimento
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: `Todos (${produtos.length})`, valor: 'TODOS' },
                { label: `Pendente (${contadores.pendentes})`, valor: 'PENDENTE' },
                { label: `Enriquecido (${contadores.enriquecidos})`, valor: 'ENRIQUECIDO' },
                { label: `Concluído (${contadores.concluidos})`, valor: 'CONCLUIDO' },
              ].map((chip) => (
                <button
                  key={chip.valor}
                  type="button"
                  onClick={() => setFiltroStatus(chip.valor)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filtroStatus === chip.valor
                      ? 'bg-econoway-green text-white shadow-sm'
                      : 'bg-text-main/5 text-text-main/80 hover:bg-text-main/10'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-main/60 mb-2">
              Status Imagem
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Todas', valor: 'TODAS' },
                { label: `Sem imagem (${contadores.semImagem})`, valor: 'SEM_IMAGEM' },
                { label: `Com imagem (${contadores.comImagem})`, valor: 'COM_IMAGEM' },
              ].map((chip) => (
                <button
                  key={chip.valor}
                  type="button"
                  onClick={() => setFiltroImagem(chip.valor)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filtroImagem === chip.valor
                      ? 'bg-econoway-green text-white shadow-sm'
                      : 'bg-text-main/5 text-text-main/80 hover:bg-text-main/10'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contador */}
        {!carregando && (
          <p className="text-xs text-text-main/60 mb-3">
            Exibindo <strong className="text-text-heading">{produtosFiltrados.length}</strong> de{' '}
            {produtos.length} produtos
          </p>
        )}

        {/* Lista de Produtos */}
        {carregando ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl border border-border-main bg-text-main/5 animate-pulse"
              />
            ))}
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border-main rounded-2xl">
            <p className="text-sm text-text-main/60">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {produtosFiltrados.map((p) => {
              const categoria = p.categoria || 'Outros';
              const corBarra = CORES_CATEGORIA[categoria] || 'bg-gray-400';
              const statusInfo = labelStatus(statusDe(p));
              const possuiImagem = temImagem(p);
              const aberto = expandidoId === p.id_produto;
              const menorPreco = Number(p.menor_preco ?? 0).toFixed(2);

              return (
                <div
                  key={p.id_produto}
                  className="rounded-2xl border border-border-main bg-bg-main overflow-hidden transition-all hover:border-econoway-green/40"
                >
                  <button
                    type="button"
                    onClick={() => setExpandidoId(aberto ? null : p.id_produto)}
                    className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`w-2 h-12 rounded-full shrink-0 ${corBarra}`} />

                      <div className="min-w-0">
                        <h3 className="font-bold text-sm md:text-base text-text-heading truncate">
                          {p.nome_produto}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.texto}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-text-main/5 text-text-main/70">
                            {possuiImagem ? (
                              <>
                                <ImageIcon size={12} className="text-econoway-green" /> Com imagem
                              </>
                            ) : (
                              <>
                                <ImageOff size={12} /> Sem imagem
                              </>
                            )}
                          </span>

                          <span className="text-[11px] text-text-main/50 hidden sm:inline">
                            • {categoria}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronDown
                      size={20}
                      className={`text-text-main/50 shrink-0 transition-transform duration-200 ${
                        aberto ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {aberto && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border-main bg-text-main/2 px-5 py-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-xs text-text-main/50 block">Categoria</span>
                            <strong className="text-text-heading">{categoria}</strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-main/50 block">Código de Barras</span>
                            <strong className="text-text-heading font-mono">
                              {p.codigo_barras || '-'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-main/50 block">Marca</span>
                            <strong className="text-text-heading">{p.marca || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-main/50 block">Nome Original</span>
                            <strong className="text-text-heading">{p.nome_original || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-main/50 block">Peso / Medida</span>
                            <strong className="text-text-heading">
                              {p.peso ? `${p.peso} ${p.unidade_medida || ''}` : '-'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-xs text-text-main/50 block">
                              Mercados / Menor preço
                            </span>
                            <strong className="text-econoway-green">
                              {p.total_mercados ?? 0} mercados · R$ {menorPreco}
                            </strong>
                          </div>
                        </div>

                        {p.ultima_chave_nfce && (
                          <div className="mt-4 p-2.5 rounded-xl bg-bg-main border border-border-main flex items-center gap-2 text-xs">
                            <Receipt size={15} className="text-econoway-green shrink-0" />
                            <span className="text-text-main/60 shrink-0">NFC-e de Origem:</span>
                            <span className="font-mono text-text-heading truncate">
                              {p.ultima_chave_nfce}
                            </span>
                          </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-border-main/60 flex flex-wrap items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setProdutoParaExcluir(p)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                            Excluir Produto
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate('/admin/produtos/editar', { state: { produto: p } })
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-econoway-green text-white hover:bg-econoway-light transition-colors cursor-pointer shadow-sm"
                          >
                            <Edit3 size={15} />
                            Editar Produto
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão (RF47) */}
      <AnimatePresence>
        {produtoParaExcluir && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !excluindo && setProdutoParaExcluir(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full bg-bg-main border border-border-main rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-500 mb-3">
                <div className="p-2.5 rounded-full bg-red-500/10">
                  <AlertTriangle size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-text-heading">Excluir Produto?</h3>
              </div>

              <p className="text-sm text-text-main/80 leading-relaxed">
                Tem certeza que deseja remover{' '}
                <strong className="text-text-heading">{produtoParaExcluir.nome_produto}</strong> do
                catálogo? Essa ação não pode ser desfeita.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={() => setProdutoParaExcluir(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-border-main hover:bg-text-main/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={confirmarExclusao}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}