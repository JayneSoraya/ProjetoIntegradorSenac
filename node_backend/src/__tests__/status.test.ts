import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { logger } from '../utils/logger';

const app = express();
app.use(express.json());

app.get('/api/status', (req, res) => {
  logger.info("📱 Teste conectou na API");
  res.json({ 
    status: "online", 
    mensagem: "API SaveMoney funcionando!" 
  });
});

describe('GET /api/status', () => {
  it('deve retornar status online', async () => {
    const response = await request(app).get('/api/status');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('online');
  });
});