import { pool } from '../database';
import { CacheStatusConta, StatusConta } from '../domain/statusConta';

// Status e perfil são revalidados no banco, com cache curto, para que uma conta
// bloqueada ou com perfil alterado perca o acesso sem esperar o token expirar.
const cache = new CacheStatusConta(30_000);

export class StatusContaService {
  static async consultar(idConta: number): Promise<StatusConta | null> {
    const emCache = cache.obter(idConta);
    if (emCache !== undefined) return emCache;

    const result = await pool.query<{ tipo_conta: StatusConta['perfil']; status_conta: boolean }>(
      'SELECT tipo_conta, status_conta FROM conta WHERE id_conta = $1',
      [idConta],
    );
    const row = result.rows[0];
    const status = row ? { ativa: row.status_conta === true, perfil: row.tipo_conta } : null;
    cache.guardar(idConta, status);
    return status;
  }

  static invalidar(idConta: number): void {
    cache.invalidar(idConta);
  }
}
