import { Router } from 'express';
import { autenticar } from '../middleware/authMiddleware';
import {
  listarCompras,
  detalheCompra,
  historicoPrecoProduto,
  resumoEconomia,
} from '../controllers/historicoController';

const router = Router();

// Todas protegidas por JWT
router.use(autenticar);

// Histórico de compras do usuário
router.get('/compras',           listarCompras);
router.get('/compras/:id',       detalheCompra);

// Histórico de preço de um produto
router.get('/precos/:id_produto', historicoPrecoProduto);

// Resumo de economia (HomeScreen)
router.get('/resumo',            resumoEconomia);

export default router;