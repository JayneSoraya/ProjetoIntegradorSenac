import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { logger } from '../lib/logger';

export async function resumoAdmin(_req: Request, res: Response) {
  try {
    return res.status(200).json(await AdminService.resumo());
  } catch (error) {
    logger.error('admin_summary_failed', error, { requestId: _req.requestId });
    return res.status(500).json({ erro: 'Erro ao carregar painel administrativo.' });
  }
}

export async function listarUsuarios(req: Request, res: Response) {
  const busca = typeof req.query.busca === 'string' ? req.query.busca : '';
  const limit = Number(req.query.limit ?? 50) || 50;
  try {
    return res.status(200).json(await AdminService.listarUsuarios(busca, limit));
  } catch (error) {
    logger.error('admin_users_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
}

export async function alterarStatusConta(req: Request, res: Response) {
  const accountId = Number(req.params.id);
  const active = req.body?.ativo;
  if (!Number.isInteger(accountId) || accountId <= 0 || typeof active !== 'boolean') {
    return res.status(400).json({ erro: 'Dados de conta inválidos.' });
  }
  if (req.auth?.accountId === accountId && active === false) {
    return res.status(409).json({ erro: 'Administrador não pode bloquear a própria conta por este endpoint.' });
  }

  try {
    const changed = await AdminService.alterarStatusConta(req.auth!.accountId, accountId, active);
    return res.status(200).json(changed);
  } catch (error) {
    if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
      return res.status(404).json({ erro: 'Conta não encontrada.' });
    }
    logger.error('admin_account_status_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao alterar conta.' });
  }
}

export async function listarSupermercadosAdmin(req: Request, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : '';
  if (status && !['PENDENTE', 'APROVADO', 'SUSPENSO'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }
  try {
    return res.status(200).json(await AdminService.listarSupermercados(status));
  } catch (error) {
    logger.error('admin_markets_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao listar supermercados.' });
  }
}

export async function alterarStatusSupermercado(req: Request, res: Response) {
  const marketId = Number(req.params.id);
  const status = String(req.body?.status ?? '').toUpperCase();
  if (!Number.isInteger(marketId) || marketId <= 0 || !['PENDENTE', 'APROVADO', 'SUSPENSO'].includes(status)) {
    return res.status(400).json({ erro: 'Dados do supermercado inválidos.' });
  }

  try {
    const changed = await AdminService.alterarStatusSupermercado(req.auth!.accountId, marketId, status);
    return res.status(200).json(changed);
  } catch (error) {
    if (error instanceof Error && error.message === 'MARKET_NOT_FOUND') {
      return res.status(404).json({ erro: 'Supermercado não encontrado.' });
    }
    logger.error('admin_market_status_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao alterar supermercado.' });
  }
}

export async function listarAuditoria(req: Request, res: Response) {
  const limit = Number(req.query.limit ?? 50) || 50;
  try {
    return res.status(200).json(await AdminService.listarAuditoria(limit));
  } catch (error) {
    logger.error('admin_audit_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao listar auditoria.' });
  }
}
