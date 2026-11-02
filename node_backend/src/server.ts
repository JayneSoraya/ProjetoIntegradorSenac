import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import './database';
import notaRoutes from './routes/notaRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import supermercadoRoutes from './routes/supermercadoRoutes';
import produtoRoutes from './routes/produtoRoutes';
import comparacaoRoutes from './routes/comparacaoRoutes';
import historicoRoutes from './routes/historicoRoutes';
import progressoRoutes from './routes/progressoRoutes';
import { reprocessarNotasContingencia } from './services/contingenciaService';
import { logger } from './utils/logger';
import { autenticar } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// ── Middlewares Globais (Devem vir antes das rotas) ──
app.use(cors());
app.use(express.json());

// ── Agendamento (Cron Job) ─────────────────────
cron.schedule('0 */2 * * *', () => {
  reprocessarNotasContingencia();
});

// ── Rota Manual de Contingência ────────────────
app.post('/api/admin/reprocessar-contingencia', autenticar, async (req, res) => {
  try {
    await reprocessarNotasContingencia();
    res.json({ mensagem: 'Rotina de reprocessamento disparada com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao executar reprocessamento.' });
  }
});

// ── Registro de Rotas da API ───────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/comparacao', comparacaoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/supermercados', supermercadoRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/progresso', progressoRoutes);

// ── Rota de Teste / Status ─────────────────────
app.get('/api/status', (req, res) => {
  logger.info("📱 Celular conectou na API");
  res.json({ 
    status: "online", 
    mensagem: "API SaveMoney funcionando!" 
  });
});

// ── Inicialização Única do Servidor ────────────
app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`🚀 SaveMoney API rodando na porta ${PORT}`);
});