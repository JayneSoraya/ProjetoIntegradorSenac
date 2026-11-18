import { ProgressoRepository }
from '../repositories/progressoRepository';

export class ProgressoService {

  static async buscarResumo(
    idUsuario: number,
  ) {

    const [
      scansResult,
      produtosResult,
      mercadosResult,
    ] = await Promise.all([
      ProgressoRepository.buscarTotalScans(
        idUsuario,
      ),

      ProgressoRepository.buscarTotalProdutos(),

      ProgressoRepository.buscarTotalMercados(),
    ]);

    const scansFeitos =
      Number(
        scansResult.rows[0].total,
      );

    const produtosComPreco =
      Number(
        produtosResult.rows[0].total,
      );

    const totalMercados =
      Number(
        mercadosResult.rows[0].total,
      );

    const metaScans = 10;
    const metaProdutos = 50;

    const progressoScans =
      Math.min(
        scansFeitos / metaScans,
        1,
      );

    const progressoProdutos =
      Math.min(
        produtosComPreco / metaProdutos,
        1,
      );

    const progresso =
      (progressoScans * 0.8) +
      (progressoProdutos * 0.2);

    const scansRestantes =
      Math.max(
        0,
        metaScans - scansFeitos,
      );

    const mensagemProgresso =
      scansRestantes > 0
        ? `Faltam ${scansRestantes} ${
            scansRestantes === 1
              ? 'scan'
              : 'scans'
          } para desbloquear a comparação com TODOS os mercados.`
        : '🎉 Você desbloqueou a comparação completa da cidade!';

    const economiaCidade = 0;

    return {
      progresso:
        Math.round(
          progresso * 100,
        ) / 100,

      scans_feitos:
        scansFeitos,

      meta_scans:
        metaScans,

      produtos_com_preco:
        produtosComPreco,

      meta_produtos:
        metaProdutos,

      scans_restantes:
        scansRestantes,

      mensagem_progresso:
        mensagemProgresso,

      economia_cidade:
        economiaCidade,

      total_mercados:
        totalMercados,

      frase_social:
        economiaCidade > 0
          ? `Moradores de Araraquara já economizaram R$ ${economiaCidade.toFixed(
              2,
            )} escaneando notas. Você ainda não.`
          : 'Seja o primeiro a mapear os preços de Araraquara!',
    };
  }
}