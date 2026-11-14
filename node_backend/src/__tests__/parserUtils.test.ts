import { describe, it, expect } from '@jest/globals';
import { parseMoeda, parseDataSefaz } from '../utils/parserUtils';

describe('Utilitários de Parsing (Moeda e Data SEFAZ)', () => {
  
  describe('parseMoeda()', () => {
    it('deve converter valores no padrão brasileiro simples (vírgula)', () => {
      expect(parseMoeda('12,99')).toBe(12.99);
      expect(parseMoeda('0,50')).toBe(0.5);
      expect(parseMoeda('100,00')).toBe(100);
    });

    it('deve converter valores com símbolo R$, espaços e separador de milhar', () => {
      expect(parseMoeda('R$ 1.250,75')).toBe(1250.75);
      expect(parseMoeda('  R$   45,10 \n')).toBe(45.1);
      expect(parseMoeda('12.345.678,90')).toBe(12345678.9);
    });

    it('deve converter valores que já vêm no padrão americano (ponto)', () => {
      expect(parseMoeda('19.99')).toBe(19.99);
      expect(parseMoeda(25.5)).toBe(25.5);
    });

    it('deve lidar com valores negativos (descontos na nota)', () => {
      expect(parseMoeda('-5,40')).toBe(-5.4);
      expect(parseMoeda('- R$ 10,00')).toBe(-10);
    });

    it('deve retornar 0 para entradas vazias, nulas ou inválidas', () => {
      expect(parseMoeda('')).toBe(0);
      expect(parseMoeda(null)).toBe(0);
      expect(parseMoeda(undefined)).toBe(0);
      expect(parseMoeda('texto inválido')).toBe(0);
    });
  });

  describe('parseDataSefaz()', () => {
    it('deve converter data brasileira completa com hora, minuto e segundo', () => {
      const data = parseDataSefaz('13/11/2026 17:45:30');
      expect(data).not.toBeNull();
      expect(data?.getFullYear()).toBe(2026);
      expect(data?.getMonth()).toBe(10); // Novembro = 10
      expect(data?.getDate()).toBe(13);
      expect(data?.getHours()).toBe(17);
      expect(data?.getMinutes()).toBe(45);
      expect(data?.getSeconds()).toBe(30);
    });

    it('deve converter data brasileira apenas com dia, mês e ano', () => {
      const data = parseDataSefaz('05/01/2026');
      expect(data).not.toBeNull();
      expect(data?.getFullYear()).toBe(2026);
      expect(data?.getMonth()).toBe(0); // Janeiro = 0
      expect(data?.getDate()).toBe(5);
      expect(data?.getHours()).toBe(0);
    });

    it('deve converter data no formato ISO (padrão XML/QR Code de alguns estados)', () => {
      const data = parseDataSefaz('2026-11-13T14:20:00-03:00');
      expect(data).not.toBeNull();
      expect(data?.getFullYear()).toBe(2026);
      expect(data?.getMonth()).toBe(10);
      expect(data?.getDate()).toBe(13);
    });

    it('deve retornar null para datas inexistentes ou strings malformadas', () => {
      expect(parseDataSefaz('31/02/2026')).toBeNull(); // Fevereiro não tem dia 31
      expect(parseDataSefaz('data-invalida')).toBeNull();
      expect(parseDataSefaz('')).toBeNull();
      expect(parseDataSefaz(null)).toBeNull();
    });
  });

});