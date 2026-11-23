export type PerfilConta = 'USUARIO' | 'SUPERMERCADO' | 'ADMIN';

export interface StatusConta {
  ativa: boolean;
  perfil: PerfilConta;
}

interface Entrada {
  status: StatusConta | null;
  expiraEm: number;
}

/**
 * Cache curto do status das contas. Evita uma consulta ao banco a cada requisição,
 * mas garante que bloqueios e mudanças de perfil passem a valer em poucos segundos,
 * sem esperar a expiração do token.
 */
export class CacheStatusConta {
  private readonly entradas = new Map<number, Entrada>();

  constructor(
    private readonly ttlMs: number,
    private readonly agora: () => number = Date.now,
    private readonly capacidade = 10_000,
  ) {}

  obter(idConta: number): StatusConta | null | undefined {
    const entrada = this.entradas.get(idConta);
    if (!entrada) return undefined;
    if (entrada.expiraEm <= this.agora()) {
      this.entradas.delete(idConta);
      return undefined;
    }
    return entrada.status;
  }

  guardar(idConta: number, status: StatusConta | null): void {
    if (this.entradas.size >= this.capacidade) {
      const agora = this.agora();
      for (const [chave, valor] of this.entradas) {
        if (valor.expiraEm <= agora) this.entradas.delete(chave);
      }
      if (this.entradas.size >= this.capacidade) this.entradas.clear();
    }
    this.entradas.set(idConta, { status, expiraEm: this.agora() + this.ttlMs });
  }

  invalidar(idConta: number): void {
    this.entradas.delete(idConta);
  }
}
