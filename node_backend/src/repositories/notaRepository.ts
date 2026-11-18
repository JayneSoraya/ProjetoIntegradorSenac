import { pool } from '../database';

export class NotaRepository {
  static async buscarSupermercadoPorCnpj(cnpj: string) {
    return pool.query(
      `
      SELECT id_supermercado
      FROM supermercado
      WHERE cnpj = $1
      `,
      [cnpj]
    );
  }

  static async criarSupermercadoContingencia(cnpj: string) {
    return pool.query(
      `
      INSERT INTO supermercado (
        cnpj,
        nome_fantasia,
        endereco_completo
      )
      VALUES (
        $1,
        $2,
        $3
      )
      RETURNING id_supermercado
      `,
      [
        cnpj,
        'Estabelecimento em Contingência',
        'Endereço não disponível',
      ]
    );
  }

  static async salvarNotaContingencia(
    idUsuario: number,
    idSupermercado: number | null,
    valorTotal: number,
    urlQrCode: string
  ) {
    return pool.query(
      `
      INSERT INTO nota_fiscal
      (
        id_usuario,
        id_supermercado,
        data_compra,
        valor_total,
        chave_nfce,
        status
      )
      VALUES
      (
        $1,
        $2,
        NOW(),
        $3,
        $4,
        'CONTINGENCIA'
      )
      `,
      [
        idUsuario,
        idSupermercado,
        valorTotal,
        urlQrCode,
      ]
    );
  }

  static async buscarNotaUsuario(idNota: number, idUsuario: number) {
    return pool.query(
      `
      SELECT
        id_nota,
        status
      FROM nota_fiscal
      WHERE
        id_nota = $1
        AND id_usuario = $2
      `,
      [idNota, idUsuario]
    );
  }
}