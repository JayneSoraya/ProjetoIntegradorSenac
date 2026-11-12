import rateLimit from 'express-rate-limit';

// Limitador Global (para todas as rotas da API) 100 requisições a cada 15 minutos por IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: 'Muitas requisições vindas deste IP, tente novamente mais tarde.',
  },
});

//Limitador Crítico (para login, notas fiscais) Apenas 10 tentativas a cada 5 minutos por IP
export const criticoLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: 'Muitas tentativas nesta operação sensível. Tente novamente em alguns minutos.',
  },
});