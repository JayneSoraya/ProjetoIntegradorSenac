import { HistoricoRepository } from '../repositories/historicoRepository';
import { processarNotaPorUrl } from './sefazService';

export class HistoricoService {
  static async listarCompras(idUsuario: number) {
    const resultado = await HistoricoRepository.listarCompras(idUsuario);
    return resultado.rows;
  }

  static async detalheCompra(idNota: string, idUsuario: number) {
    const notaExiste = await HistoricoRepository.buscarNota(idNota, idUsuario);

    if (notaExiste.rows.length === 0) {
      throw new Error('NOTA_NAO_ENCONTRADA');
    }

    // Otimização de performance (N+1 evitado / consultas paralelas)
    const [cabecalho, itens] = await Promise.all([
      HistoricoRepository.buscarCabecalhoNota(idNota),
      HistoricoRepository.buscarItensNota(idNota),
    ]);

    return {
      nota: cabecalho.rows[0],
      itens: itens.rows,
    };
  }

  static async historicoPrecoProduto(idProduto: string) {
    const [precoAtual, historico, produto] = await Promise.all([
      HistoricoRepository.buscarPrecosAtuaisProduto(idProduto),
      HistoricoRepository.buscarHistoricoPreco(idProduto),
      HistoricoRepository.buscarProdutoPorId(idProduto),
    ]);

    if (produto.rows.length === 0) {
      throw new Error('PRODUTO_NAO_ENCONTRADO');
    }

    return {
      produto: produto.rows[0],
      precos_atuais: precoAtual.rows,
      historico: historico.rows,
    };
  }

  static async resumoEconomia(idUsuario: number) {
    const [gastoMensal, totalGeral, favoritoResult] = await Promise.all([
      HistoricoRepository.buscarGastoMensal(idUsuario),
      HistoricoRepository.buscarTotalGeral(idUsuario),
      HistoricoRepository.buscarSupermercadoFavorito(idUsuario),
    ]);

    const rowsGastoMensal = gastoMensal.rows;

    return {
      gasto_mensal: rowsGastoMensal,
      total_geral: parseFloat(totalGeral.rows[0].total),
      supermercado_favorito: favoritoResult.rows[0]?.nome_fantasia ?? null,
      total_notas: rowsGastoMensal.reduce(
        (acc: number, row: any) => acc + parseInt(row.total_compras), 0
      ),
    };
  }

  static async sincronizarNotaContingencia(idNota: string, idUsuario: number) {
    const result = await HistoricoRepository.buscarNota(idNota, idUsuario);

    if (result.rows.length === 0) {
      throw new Error('NOTA_NAO_ENCONTRADA');
    }

    const nota = result.rows[0];

    if (nota.status !== 'CONTINGENCIA') {
      throw new Error('NOTA_JA_PROCESSADA');
    }

    // Tenta o scraping normal
    const resultado = await processarNotaPorUrl(nota.chave_nfce, idUsuario, Number(nota.id_nota));

    return {
      ...resultado,
      sucesso: true,
      mensagem: 'Nota sincronizada com sucesso!',
    };
  }

  static async obterChaveNfce(idNota: string) {
    const notaRes = await HistoricoRepository.buscarChaveNfcePorId(idNota);
    return notaRes.rows[0]?.chave_nfce;
  }
}