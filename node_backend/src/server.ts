import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { checkDatabase, pool } from './database';
import notaRoutes from './routes/notaRoutes';
import authRoutes from './routes/authRoutes';
import supermercadoRoutes from './routes/supermercadoRoutes';
import produtoRoutes from './routes/produto.routes';
import comparacaoRoutes from './routes/comparacao.routes';
import economiaRoutes from './routes/economiaRoutes';
import adminRoutes from './routes/adminRoutes';
import cartRoutes from './routes/cartRoutes';
import userRoutes from './routes/userRoutes';
import historicoRoutes from './routes/historicoRoutes';
import progressoRoutes from './routes/progressoRoutes';
import { baselineSecurityHeaders, browserCsrfGuard, fixedWindowRateLimit, requestAccessLog, requestContext } from './middleware/securityMiddleware';
import { logger } from './lib/logger';

const app = express();

app.disable('x-powered-by');
if (env.trustProxyHops > 0) {
  // Configure apenas o número conhecido de proxies reversos. Nunca confie cegamente
  // em X-Forwarded-For vindo diretamente da Internet.
  app.set('trust proxy', env.trustProxyHops);
}
app.use(requestContext);
app.use(requestAccessLog);
app.use(baselineSecurityHeaders);

const allowedOrigins = new Set(env.corsOrigins);
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin.toLowerCase())) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
    },
  }),
);
// Importações de preço podem enviar lotes maiores que o restante da API.
// O limite funcional continua sendo aplicado pelo domínio (máx. 5.000 registros).
app.use('/api/supermercados', express.json({ limit: '5mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(browserCsrfGuard);

// Teto geral por IP para toda a API; rotas sensíveis mantêm limites próprios mais restritos.
app.use('/api', fixedWindowRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 900,
  scope: 'ip',
  message: 'Muitas requisições em pouco tempo. Aguarde alguns minutos e tente novamente.',
}));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/ready', async (_req, res) => {
  try {
    await checkDatabase();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error('readiness_check_failed', error);
    res.status(503).json({ status: 'not_ready' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/carrinho', cartRoutes);
app.use('/api/usuario', userRoutes);
app.use('/api/comparacao', comparacaoRoutes);
app.use('/api/economia', economiaRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/supermercados', supermercadoRoutes);
app.use('/api/produtos', produtoRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error.message === 'CORS_ORIGIN_NOT_ALLOWED') {
    res.status(403).json({ erro: 'Origem não permitida.' });
    return;
  }

  logger.error('unhandled_request_error', error, { requestId: _req.requestId });
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const server = app.listen(env.port, '0.0.0.0', () => {
  logger.info('api_started', { port: env.port, environment: env.nodeEnv });
});

async function shutdown(signal: string) {
  logger.info('shutdown_requested', { signal });
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
