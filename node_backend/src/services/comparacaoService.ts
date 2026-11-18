import { ComparacaoRepository } from '../repositories/comparacaoRepository';

export class ComparacaoService {
  static async comparar(itens: any[]) {
    const supermercados = await ComparacaoRepository.listarMercados();
    const resultado = [];

    for (const mercado of supermercados.rows) {
      let total = 0;
      const encontrados = [];
      const faltando = [];

      for (const item of itens) {
        const idsProdutos =
    itens.map(
      i => i.idProduto,
    );

        const oferta = await ComparacaoRepository.buscarOfertasMercado(
          mercado.id_supermercado,
          idsProdutos,
        );

        if (oferta.rows.length > 0) {
          const preco = Number(oferta.rows[0].preco_atual);
          total += preco * item.quantidade;

          encontrados.push({
            idProduto: item.idProduto,
            nomeProduto: oferta.rows[0].nome_produto,
            quantidade: item.quantidade,
            preco,
          });
        } else {
          const produto = await ComparacaoRepository.buscarProduto(item.idProduto);

          faltando.push({
            idProduto: item.idProduto,
            nomeProduto: produto.rows[0]?.nome_produto ?? 'Produto',
          });
        }
      }

      resultado.push({
        id_supermercado: mercado.id_supermercado,
        nome_fantasia: mercado.nome_fantasia,
        total,
        total_itens: itens.length,
        itens_encontrados: encontrados.length,
        itens_faltando: faltando.length,
        carrinho_completo: faltando.length === 0,
        encontrados,
        faltando,
      });
    }

    resultado.sort((a, b) => {
      if (a.carrinho_completo && !b.carrinho_completo) {
        return -1;
      }
      if (!a.carrinho_completo && b.carrinho_completo) {
        return 1;
      }
      return a.total - b.total;
    });

    return {
      resultado,
      totalMercadosAvaliados: supermercados.rows.length,
      totalItensCarrinho: itens.length,
    };
  }
}