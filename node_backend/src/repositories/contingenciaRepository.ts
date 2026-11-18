import { pool } from '../database';

export class ContingenciaRepository {
  static async buscarNotaPorIdEUsuario(idNota: string | number, idUsuario: number) {
    return pool.query(
      `SELECT id_nota, chave_nfce, status 
       FROM nota_fiscal 
       WHERE id_nota = $1 AND id_usuario = $2`,
      [idNota, idUsuario]
    );
  }

  static async buscarNotasContingencia() {
    return pool.query(
      `SELECT id_nota, id_usuario, chave_nfce 
       FROM nota_fiscal 
       WHERE status = 'CONTINGENCIA' AND chave_nfce LIKE 'http%'
       LIMIT 10;`
    );
  }
}