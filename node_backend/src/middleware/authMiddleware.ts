import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id_conta: number;
        id_usuario: number;
        tipo_conta?: string;
      };
    }
  }
}

export const autenticar = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret'
    ) as { 
      id_conta: number; id_usuario:number; tipo_conta?: string
    };

    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

export const apenasAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.usuario?.tipo_conta !== 'ADMIN')
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  next();
}