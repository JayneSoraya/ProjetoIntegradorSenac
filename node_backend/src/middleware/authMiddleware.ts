import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

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

export const autenticar = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('⚠️ Token não fornecido.');

    return res.status(401).json({
      erro: 'Token não fornecido.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret'
    ) as {
      id_conta: number;
      id_usuario: number;
      tipo_conta?: string;
    };

    req.usuario = payload;

    logger.info(
      `✅ Usuário autenticado | id_conta: ${payload.id_conta} | tipo_conta: ${payload.tipo_conta}`
    );

    next();

  } catch (erro) {

    logger.warn('⚠️ Token inválido ou expirado.');

    return res.status(401).json({
      erro: 'Token inválido ou expirado.',
    });
  }
};

export const apenasAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  logger.info(
    `🔍 ROTA: ${req.method} ${req.originalUrl}`
  );

  logger.info(
    `🔍 Tipo recebido no token: ${req.usuario?.tipo_conta}`
  );

  if (req.usuario?.tipo_conta !== 'ADMIN') {

    logger.warn(
      `⛔ Acesso negado na rota ${req.originalUrl}`
    );

    return res.status(403).json({
      erro: 'Acesso restrito a administradores.'
    });
  }

  next();
};

export const apenasMercado = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  logger.info(
    `🔍 Verificando perfil | tipo_conta: ${req.usuario?.tipo_conta}`
  );

  if (req.usuario?.tipo_conta !== 'MERCADO') {

    logger.warn(
      `⛔ Acesso negado | tipo_conta recebido: ${req.usuario?.tipo_conta}`
    );

    return res.status(403).json({
      erro: 'Acesso restrito a mercados.',
    });
  }

  logger.info('✅ Acesso autorizado para mercado.');

  next();
};

export const apenasAdminOuMercado = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  logger.info(
    `🔍 Verificando perfil | tipo_conta: ${req.usuario?.tipo_conta}`
  );

  if (
    req.usuario?.tipo_conta !== 'ADMIN' &&
    req.usuario?.tipo_conta !== 'MERCADO'
  ) {

    logger.warn(
      `⛔ Acesso negado | tipo_conta recebido: ${req.usuario?.tipo_conta}`
    );

    return res.status(403).json({
      erro: 'Acesso restrito.',
    });
  }

  logger.info('✅ Acesso autorizado.');

  next();
};