declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      auth?: {
        accountId: number;
        userId: number | null;
        role: 'USUARIO' | 'SUPERMERCADO' | 'ADMIN';
      };
    }
  }
}

export {};
