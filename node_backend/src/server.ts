import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './database';
import notaRoutes from './routes/notaRoutes';
import adminRoutes from './routes/adminRoutes';

import authRoutes from './routes/authRoutes';
import supermercadoRoutes from './routes/supermercadoRoutes';
import produtoRoutes from './routes/produto.routes';
import comparacaoRoutes from './routes/comparacao.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

//  Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/notas', notaRoutes);
app.use('/api/comparacao', comparacaoRoutes,
  );
app.use('/api/admin', adminRoutes);

// ROTA DE TESTE 
app.get('/api/status', (req, res) => {
  console.log("📱 Celular conectou na API ");
  res.json({ 
    status: "online", 
    mensagem: "API EconoWay funcionando!" 
  });
});

// ROTAS PRINCIPAIS
app.use('/api/auth', authRoutes);
app.use('/api/supermercados', supermercadoRoutes);
app.use('/api/produtos', produtoRoutes);
// INICIAR SERVIDOR (aceita celular)
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 EconoWay API rodando na porta ${PORT}`);
});
