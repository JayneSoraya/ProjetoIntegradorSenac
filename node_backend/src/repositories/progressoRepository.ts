import { pool } from '../database';

export class ProgressoRepository {

  static async buscarTotalScans(
    idUsuario: number,
  ) {
    return pool.query(
      `
      SELECT COUNT(*) AS total
      FROM nota_fiscal
      WHERE id_usuario = $1
      `,
      [idUsuario],
    );
  }

  static async buscarTotalProdutos() {
    return pool.query(
      `
      SELECT COUNT(DISTINCT id_produto)
      AS total
      FROM oferta_supermercado
      `
    );
  }

  static async buscarTotalMercados() {
    return pool.query(
      `
      SELECT COUNT(*) AS total
      FROM supermercado
      WHERE esta_aberto = true
      `
    );
  }
}