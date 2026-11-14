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
import { apiLimiter } from './middleware/rateLimitMiddleware';

dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log('REQ CHEGOU:', req.method, req.url);
  next();
});
app.get('/ping', (req, res) => {
  console.log('PING FUNCIONOU');
  return res.end('pong');
});
const PORT = process.env.PORT || 3333;

// -- Middlewares Globais --
app.use(cors());
app.use(express.json());
//app.use('/api/', apiLimiter);

// -- Agendamento (Cron Job) ---------------------
if (process.env.NODE_ENV !== 'test') {
  cron.schedule('0 */2 * * *', () => {
    reprocessarNotasContingencia();
  });
}

// -- Rota Manual de Contingência ----------------
app.post('/api/admin/reprocessar-contingencia', autenticar, async (req, res) => {
  try {
    await reprocessarNotasContingencia();
    res.json({ mensagem: 'Rotina de reprocessamento disparada com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao executar reprocessamento.' });
  }
});

// -- Registro de Rotas da API -------------------
app.use('/api/auth', authRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/comparacao', comparacaoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/supermercados', supermercadoRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/progresso', progressoRoutes);

// -- Rota de Teste / Status ---------------------
app.get('/api/status', (req, res) => {
  logger.info("?? Celular conectou na API");
  res.json({ 
    status: "online", 
    mensagem: "API SaveMoney funcionando!" 
  });
});
// -- Exportação do App para testes --------------
export default app;


// -- Inicialização Única do Servidor (Apenas se não for teste) ------------
if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(`?? SaveMoney API rodando na porta ${PORT}`);
  });
}

