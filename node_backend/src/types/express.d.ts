import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        accountId: number;
        userId: number | null;
        role: 'USUARIO' | 'SUPERMERCADO' | 'ADMIN';
      };
      usuario?: {
        id_conta: number;
        id_usuario?: number | null;
        tipo_conta: 'USUARIO' | 'SUPERMERCADO' | 'ADMIN';
      };
    }
  }
}