import { Request, Response } from 'express';
import { normalizeCartItems } from '../domain/cart';
import { CartService } from '../services/cartService';
import { logger } from '../lib/logger';

function requireUserId(req: Request): number {
  const userId = req.auth?.userId;
  if (!userId) throw new Error('USER_REQUIRED');
  return userId;
}

export async function obterCarrinho(req: Request, res: Response) {
  try {
    const cart = await CartService.getOpenCart(requireUserId(req));
    return res.status(200).json(cart);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'USER_REQUIRED') return res.status(403).json({ erro: 'Carrinho disponível apenas para usuários.' });
    logger.error('cart_get_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao consultar carrinho.' });
  }
}

export async function substituirCarrinho(req: Request, res: Response) {
  try {
    const items = normalizeCartItems(req.body?.itens);
    const cartId = await CartService.replaceOpenCart(requireUserId(req), items);
    return res.status(200).json({ id_carrinho: cartId, itens: items });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INVALID_ITEMS' || code === 'PRODUCT_NOT_FOUND') return res.status(400).json({ erro: 'Itens do carrinho inválidos ou inexistentes.' });
    if (code === 'USER_REQUIRED') return res.status(403).json({ erro: 'Carrinho disponível apenas para usuários.' });
    logger.error('cart_replace_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao atualizar carrinho.' });
  }
}

export async function limparCarrinho(req: Request, res: Response) {
  try {
    await CartService.clearOpenCart(requireUserId(req));
    return res.status(204).send();
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'USER_REQUIRED') return res.status(403).json({ erro: 'Carrinho disponível apenas para usuários.' });
    logger.error('cart_clear_failed', error, { requestId: req.requestId });
    return res.status(500).json({ erro: 'Erro ao limpar carrinho.' });
  }
}
