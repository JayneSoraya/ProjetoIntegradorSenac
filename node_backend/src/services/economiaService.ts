import { EconomiaRepository }
from '../repositories/economiaRepository';

export class EconomiaService {

  static async buscarResumo(
    idUsuario: number,
  ) {

    const [
      economiaMes,
      ultimaComparacao,
      totalComparacoes,
      mercadoMaisBarato,
      economiaTotal,
      progressoMapa,
    ] = await Promise.all([
      EconomiaRepository.buscarEconomiaMes(
        idUsuario,
      ),
      EconomiaRepository.buscarUltimaComparacao(
        idUsuario,
      ),
      EconomiaRepository.buscarTotalComparacoes(
        idUsuario,
      ),
      EconomiaRepository.buscarMercadoMaisBarato(
        idUsuario,
      ),
      EconomiaRepository.buscarEconomiaTotal(
        idUsuario,
      ),
      EconomiaRepository.buscarProgressoMapa(),
    ]);

    const scans = Number(
      totalComparacoes.rows[0].total,
    );

    let coins = 50;

    coins += scans * 100;

    if (scans >= 5) {
      coins += 200;
    }

    if (scans >= 20) {
      coins += 300;
    }

    const meta = 50;

    const produtosComPreco =
      Number(
        progressoMapa.rows[0]
          .produtos_com_preco,
      );

    return {
      economia_mes:
          Number(
            economiaMes.rows[0].total,
          ),

      economia_total:
          Number(
            economiaTotal.rows[0].total,
          ),

      economia_potencial:
          Number(
            ultimaComparacao.rows[0]
              ?.economia_potencial ??
              0,
          ),

      mercado_mais_barato:
        mercadoMaisBarato.rows[0]
          ?.nome_supermercado_mais_barato ??
        null,

      total_comparacoes:
          scans,

      econo_coins:
          coins,

      mapa: {
        produtos_com_preco:
            produtosComPreco,

        meta,

        progresso:
            Math.min(
              produtosComPreco /
                  meta,
              1,
            ),
      },
    };
  }
}