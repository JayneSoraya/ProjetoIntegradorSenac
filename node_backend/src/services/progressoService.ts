import { pool } from '../database';
import { ProgressoContribuicao, calcularProgresso } from '../domain/progresso';

export class ProgressoService {
  static async buscarProgresso(userId: number): Promise<ProgressoContribuicao> {
    const result = await pool.query<{
      notas_importadas: number | string;
      produtos_com_preco: number | string;
      total_mercados: number | string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM nota_fiscal WHERE id_usuario = $1 AND status = 'VALIDA') AS notas_importadas,
         (SELECT COUNT(DISTINCT o.id_produto)
            FROM oferta_supermercado o
            INNER JOIN supermercado s ON s.id_supermercado = o.id_supermercado
            WHERE s.status_cadastro = 'APROVADO') AS produtos_com_preco,
         (SELECT COUNT(*) FROM supermercado WHERE status_cadastro = 'APROVADO') AS total_mercados`,
      [userId],
    );

    const row = result.rows[0];
    return calcularProgresso({
      notasImportadas: Number(row?.notas_importadas ?? 0),
      produtosComPreco: Number(row?.produtos_com_preco ?? 0),
      totalMercados: Number(row?.total_mercados ?? 0),
    });
  }
}
