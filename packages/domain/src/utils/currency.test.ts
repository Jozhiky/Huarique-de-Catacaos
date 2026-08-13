import { describe, it, expect } from 'vitest';
import { formatPEN, toCents, fromCents, sumPEN } from './currency';

describe('Utilidades de Moneda Peruana (PEN)', () => {
  it('formatea montos enteros a dos decimales con prefijo S/', () => {
    expect(formatPEN(30)).toBe('S/ 30.00');
    expect(formatPEN(0)).toBe('S/ 0.00');
    expect(formatPEN(100)).toBe('S/ 100.00');
  });

  it('formatea montos con decimales correctamente', () => {
    expect(formatPEN(38.5)).toBe('S/ 38.50');
    expect(formatPEN(120.99)).toBe('S/ 120.99');
  });

  it('formatea montos superiores a mil con separadores', () => {
    expect(formatPEN(1500)).toBe('S/ 1,500.00');
    expect(formatPEN(12500.5)).toBe('S/ 12,500.50');
  });

  it('maneja valores inválidos de forma segura', () => {
    expect(formatPEN(NaN)).toBe('S/ 0.00');
    expect(formatPEN(Infinity)).toBe('S/ 0.00');
  });

  it('realiza suma de montos con precisión exacta sin errores de float', () => {
    // 0.1 + 0.2 en JavaScript float es 0.30000000000000004
    const result = sumPEN([0.1, 0.2]);
    expect(result).toBe(0.3);
    expect(formatPEN(result)).toBe('S/ 0.30');

    // Suma de platos típicos de Catacaos
    // Tamalito (3.00) + Seco de chavelo (30.00) + Ceviche Mixto (38.00)
    const orderTotal = sumPEN([3.0, 30.0, 38.0]);
    expect(orderTotal).toBe(71.0);
    expect(formatPEN(orderTotal)).toBe('S/ 71.00');
  });

  it('convierte bidireccionalmente entre soles y centavos', () => {
    expect(toCents(35.5)).toBe(3550);
    expect(fromCents(3550)).toBe(35.5);
  });
});
