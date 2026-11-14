import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../server';

describe('GET /api/status', () => {
  it('deve retornar status online', async () => {
    const response = await request(app).get('/api/status');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "online",
      mensagem: "API SaveMoney funcionando!"
    });
  });
});