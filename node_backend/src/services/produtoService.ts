import { ProdutoRepository } from "../repositories/produtoRepository";

export class ProdutoService {

  static async buscar(termo: string) {
    return await ProdutoRepository.buscar(termo);
  }

  static async buscarDetalhe(id: number) {
    return await ProdutoRepository.buscarDetalhe(id);
  }

  // Normalizador de nome do produto
  static normalizarNome(nome: string): string {
    if (!nome) return '';

    return nome
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  static extrairMedida(nome: string) {
    const match = nome.match(/(\d+(?:[.,]\d+)?)\s*(KG|G|ML|L|LI|UN|CM)\b/i);

    if (match) {
      let unidade = match[2].toUpperCase();
      if (unidade === 'LI') unidade = 'L';

      return {
        quantidade: Number(match[1].replace(',', '.')),
        unidade: unidade,
      };
    }

    const somenteUnidade = nome.match(/\b(KG|G|ML|L|LI|UN)\b/i);

    if (somenteUnidade) {
      let unidade = somenteUnidade[1].toUpperCase();
      if (unidade === 'LI') unidade = 'L';

      return {
        quantidade: null,
        unidade: unidade,
      };
    }

    return null;
  }

  // Classificador automático por palavras-chave
  static classificarCategoria(nome: string): string {
    const n = nome.toLowerCase();

    if (/refrig|suco|agua|mineral|cerveja|vinho|achoc|cafe|cha |chá |energet|isoton|whisky|vodka|rum|drink|guarana|coca|pepsi|fanta/.test(n))
      return 'Bebidas';

    if (/deterg|sanit|desinf|limpeza|amaciante|sabao|sabonete|shampoo|creme|dental|escova|papel hig|fralda|absorv|desodor|perfume/.test(n))
      return 'Higiene e Limpeza';
    
    if (/peixe|frango|carne|file|linguica|salsicha|presunto|bacon|atum|sardinha|camarao/.test(n))
      return 'Carnes e Peixes';

    if (/arroz|feijao|macarr|farinha|acucar|sal|oleo|azeite|vinagre|molho|extrato|tempero|maionese|ketchup|mostarda|cuscuz/.test(n))
      return 'Alimentos';

    if (/biscoito|bolacha|salgadin|batata palh|chocolate|bala |chicle|sorvete|wafer/.test(n))
      return 'Snacks';

    if (/pao |torrada|bolo |massa |croissant/.test(n))
      return 'Padaria';

    if (/queijo|iogurt|iogurte|manteiga|margarina|requeijao|nata|creme de leite|leite/.test(n))
      return 'Laticínios';

    if (/banana|maca|maçã|laranja|limao|limão|uva|mamao|mamão|tomate|alface|cenoura|batata|cebola|alho/.test(n))
      return 'Hortifruti';

    return 'Não classificado';
  }
}