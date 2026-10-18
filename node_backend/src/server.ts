import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import './database';
import notaRoutes from './routes/notaRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import supermercadoRoutes from './routes/supermercadoRoutes';
import produtoRoutes from './routes/produtoRoutes';
import comparacaoRoutes from './routes/comparacaoRoutes';
import historicoRoutes from './routes/historicoRoutes';
import progressoRoutes from './routes/progressoRoutes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições feitas a partir deste IP, por favor tente novamente mais tarde.',
});

//  Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/', globalLimiter);
app.use('/api/notas', notaRoutes);
app.use('/api/comparacao', comparacaoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/supermercados',supermercadoRoutes);
app.use('/api/progresso', progressoRoutes);
import { logger } from './utils/logger';


// ROTA DE TESTE 
app.get('/api/status', (req, res) => {
  logger.info("📱 Celular conectou na API ");
  res.json({ 
    status: "online", 
    mensagem: "API SaveMoneyfuncionando!" 
  });
});

// ROTAS PRINCIPAIS
app.use('/api/auth', authRoutes);
app.use('/api/supermercados', supermercadoRoutes);
app.use('/api/produtos', produtoRoutes);
// INICIAR SERVIDOR (aceita celular)
app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`🚀 SaveMoney API rodando na porta ${PORT}`);
});
