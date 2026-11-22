import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Link2,
  Image as ImageIcon,
  ImageOff,
  Receipt,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useProdutos } from '../../hooks/useProdutos';
import type { Produto, StatusEnriquecimento } from '../../types';

const CATEGORIAS = [
  'Alimentos',
  'Bebidas',
  'Higiene e Limpeza',
  'Carnes e Peixes',
  'Laticínios',
  'Snacks',
  'Hortifruti',
  'Padaria',
  'Outros',
];

function sanitizarUrlImagem(url: string): string | null {
  const valorLimpo = url.trim();
  if (!valorLimpo) return null;

  try {
    const parsed = new URL(valorLimpo);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

export function AdminEditarProdutoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const produtoInicial = location.state?.produto as Produto | undefined;

  const { atualizarProduto, salvando, feedback } = useProdutos();

  // Proteção caso o usuário acesse /admin/produtos/editar diretamente pela URL
  useEffect(() => {
    if (!produtoInicial) {
      navigate('/admin/produtos', { replace: true });
    }
  }, [produtoInicial, navigate]);

  const [nomeProduto, setNomeProduto] = useState(produtoInicial?.nome_produto ?? '');
  const [marca, setMarca] = useState(produtoInicial?.marca ?? '');
  const [peso, setPeso] = useState(produtoInicial?.peso?.toString() ?? '');
  const [unidadeMedida, setUnidadeMedida] = useState(produtoInicial?.unidade_medida ?? '');
  const [imagemUrl, setImagemUrl] = useState(produtoInicial?.imagem_url ?? '');
  const [erroImagemPreview, setErroImagemPreview] = useState(false);

  const [statusEnriquecimento, setStatusEnriquecimento] = useState<StatusEnriquecimento>(
    produtoInicial?.status_enriquecimento ?? 'PENDENTE'
  );

  const categoriaInicial =
    produtoInicial?.categoria && CATEGORIAS.includes(produtoInicial.categoria)
      ? produtoInicial.categoria
      : 'Outros';
  const [categoria, setCategoria] = useState(categoriaInicial);

  if (!produtoInicial) return null;

  const urlImagemSegura = sanitizarUrlImagem(imagemUrl);
  const possuiImagem = Boolean(urlImagemSegura) && !erroImagemPreview;

  const badgeStatus = () => {
    if (statusEnriquecimento === 'CONCLUIDO') {
      return {
        texto: 'Concluído',
        dot: 'bg-emerald-500',
        classe: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      };
    }
    if (statusEnriquecimento === 'ENRIQUECIDO') {
      return {
        texto: 'Enriquecido',
        dot: 'bg-blue-500',
        classe: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      };
    }
    return {
      texto: 'Pendente',
      dot: 'bg-orange-500',
      classe: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeProduto.trim()) return;

    const pesoNumerico = peso.trim() ? Number(peso.replace(',', '.')) : null;

    const ok = await atualizarProduto(produtoInicial.id_produto, {
      nome_produto: nomeProduto.trim(),
      marca: marca.trim(),
      categoria,
      peso: pesoNumerico !== null && !Number.isNaN(pesoNumerico) ? pesoNumerico : null,
      unidade_medida: unidadeMedida.trim(),
      imagem_url: urlImagemSegura,
      status_enriquecimento: statusEnriquecimento,
    });

    if (ok) {
      navigate('/admin/produtos');
    }
  };

  const statusInfo = badgeStatus();

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans pb-14">
      {/* Header */}
      <header className="border-b border-border-main bg-bg-main/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/produtos')}
              className="p-2 rounded-lg hover:bg-econoway-green/10 text-text-main hover:text-econoway-green transition-colors cursor-pointer"
              title="Voltar para Produtos"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-text-heading leading-none">
                Editar Produto #{produtoInicial.id_produto}
              </h1>
              <span className="text-[11px] text-text-main/60">
                Curadoria e Enriquecimento (RF30)
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-6">
        {feedback?.tipo === 'erro' && (
          <div className="mb-5 p-3.5 rounded-xl border bg-red-500/10 border-red-500/30 text-red-500 flex items-center gap-2 text-sm font-medium">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{feedback.texto}</span>
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Card Superior: Badges + Preview da Imagem */}
          <div className="p-5 rounded-2xl border border-border-main bg-bg-main flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl border border-border-main bg-text-main/5 flex items-center justify-center overflow-hidden shrink-0">
              {possuiImagem && urlImagemSegura ? (
                <img
                  src={urlImagemSegura}
                  alt={nomeProduto}
                  onError={() => setErroImagemPreview(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-text-main/40">
                  <ImageOff size={32} className="mx-auto mb-1" />
                  <span className="text-[10px] block">Sem preview</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.classe}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.texto}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-text-main/5 text-text-main/80 border border-border-main">
                  {possuiImagem ? (
                    <>
                      <ImageIcon size={13} className="text-econoway-green" /> Com imagem
                    </>
                  ) : (
                    <>
                      <ImageOff size={13} /> Sem imagem
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-text-main/60">
                {imagemUrl.trim()
                  ? !urlImagemSegura
                    ? 'URL inválida. Utilize um endereço iniciado com http:// ou https://.'
                    : erroImagemPreview
                      ? 'Não foi possível carregar a URL informada.'
                      : 'Imagem personalizada vinculada ao catálogo.'
                  : 'Nenhuma URL informada — o app exibirá o placeholder da categoria.'}
              </p>
            </div>
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
              URL da Imagem
            </label>
            <div className="relative">
              <Link2
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-main/50"
              />
              <input
                type="url"
                value={imagemUrl}
                onChange={(e) => {
                  setErroImagemPreview(false);
                  setImagemUrl(e.target.value);
                }}
                placeholder="https://exemplo.com/imagem-produto.jpg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all"
              />
            </div>
          </div>

          {/* Campos Somente Leitura (Rastreabilidade NFC-e) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-main/60 mb-1.5">
                <Lock size={12} /> Código de Barras (EAN)
              </label>
              <input
                type="text"
                readOnly
                value={produtoInicial.codigo_barras || '-'}
                className="w-full px-4 py-2.5 rounded-xl bg-text-main/5 border border-border-main text-sm font-mono text-text-main/70 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-main/60 mb-1.5">
                <Lock size={12} /> Nome Original da NFC-e
              </label>
              <input
                type="text"
                readOnly
                value={produtoInicial.nome_original || '-'}
                className="w-full px-4 py-2.5 rounded-xl bg-text-main/5 border border-border-main text-sm text-text-main/70 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Nome Comercial */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
              Nome Comercial *
            </label>
            <input
              type="text"
              required
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              placeholder="Ex: Arroz Branco Tipo 1 Camil 5kg"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all"
            />
          </div>

          {/* Status de Enriquecimento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
              Status de Enriquecimento
            </label>
            <select
              value={statusEnriquecimento}
              onChange={(e) => setStatusEnriquecimento(e.target.value as StatusEnriquecimento)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all cursor-pointer"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="ENRIQUECIDO">Enriquecido</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>

          {/* Marca + Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                Marca
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Camil"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all cursor-pointer"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Peso + Unidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                Peso / Volume
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 500 ou 1.5"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                Unidade de Medida
              </label>
              <input
                type="text"
                value={unidadeMedida}
                onChange={(e) => setUnidadeMedida(e.target.value)}
                placeholder="Ex: g, kg, ml, L, un"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green outline-none text-sm text-text-heading transition-all"
              />
            </div>
          </div>

          {/* Card de Auditoria de Origem */}
          <div className="p-4 rounded-2xl border border-econoway-green/25 bg-econoway-green/5 space-y-2">
            <div className="flex items-center gap-2 text-econoway-green font-bold text-sm">
              <Receipt size={17} />
              <span>Auditoria de Origem</span>
            </div>
            <p className="text-xs text-text-main/80">
              Total de notas vinculadas:{' '}
              <strong className="text-text-heading">{produtoInicial.total_notas ?? 0}</strong>
            </p>
            <div className="text-xs text-text-main/80">
              <span className="font-semibold block">Última chave NFC-e:</span>
              <span className="font-mono text-[11px] text-text-heading break-all">
                {produtoInicial.ultima_chave_nfce || 'N/A'}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/produtos')}
              className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-border-main hover:bg-text-main/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-econoway-green text-white hover:bg-econoway-light transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save size={16} />
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </motion.form>
      </main>
    </div>
  );
}