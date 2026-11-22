/**
 * Progresso de contribuição do usuário para o mapa de preços.
 * A gamificação é informativa: nenhuma funcionalidade de comparação é bloqueada por ela.
 */

export const META_NOTAS = 10;
export const META_PRODUTOS = 50;
const PESO_NOTAS = 0.8;
const PESO_PRODUTOS = 0.2;

export interface ProgressoEntrada {
  notasImportadas: number;
  produtosComPreco: number;
  totalMercados: number;
}

export interface ProgressoContribuicao {
  progresso: number;
  notas_importadas: number;
  meta_notas: number;
  notas_restantes: number;
  produtos_com_preco: number;
  meta_produtos: number;
  total_mercados: number;
  concluido: boolean;
  mensagem_progresso: string;
}

function contagemSegura(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function calcularProgresso(entrada: ProgressoEntrada): ProgressoContribuicao {
  const notas = contagemSegura(entrada.notasImportadas);
  const produtos = contagemSegura(entrada.produtosComPreco);
  const mercados = contagemSegura(entrada.totalMercados);

  const fracaoNotas = Math.min(notas / META_NOTAS, 1);
  const fracaoProdutos = Math.min(produtos / META_PRODUTOS, 1);
  const progresso = Math.round((fracaoNotas * PESO_NOTAS + fracaoProdutos * PESO_PRODUTOS) * 100) / 100;
  const notasRestantes = Math.max(0, META_NOTAS - notas);

  let mensagem: string;
  if (notasRestantes === 0) {
    mensagem = 'Você já ajudou a mapear os preços da sua cidade. Continue importando notas para manter o mapa atualizado.';
  } else if (notas === 0) {
    mensagem = 'Importe sua primeira NFC-e para ajudar a mapear os preços da sua cidade.';
  } else {
    const rotulo = notasRestantes === 1 ? 'nota' : 'notas';
    mensagem = `Faltam ${notasRestantes} ${rotulo} para completar sua meta de contribuição.`;
  }

  return {
    progresso,
    notas_importadas: notas,
    meta_notas: META_NOTAS,
    notas_restantes: notasRestantes,
    produtos_com_preco: produtos,
    meta_produtos: META_PRODUTOS,
    total_mercados: mercados,
    concluido: notasRestantes === 0,
    mensagem_progresso: mensagem,
  };
}
