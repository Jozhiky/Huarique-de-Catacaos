/**
 * Utilidades de moneda y precisión financiera para Soles Peruanos (PEN)
 */

/**
 * Formatea un monto numérico en formato peruano oficial: "S/ 30.00"
 */
export function formatPEN(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return 'S/ 0.00';
  }

  // Redondeo determinista a 2 decimales
  const fixed = (Math.round((amount + Number.EPSILON) * 100) / 100).toFixed(2);
  
  // Separador de miles y decimales
  const parts = fixed.split('.');
  const integerPart = parts[0] ?? '0';
  const decimalPart = parts[1] ?? '00';

  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `S/ ${withThousands}.${decimalPart}`;
}

/**
 * Parsea un string o número a centavos enteros para evitar errores de coma flotante
 */
export function toCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}

/**
 * Convierte centavos a soles
 */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

/**
 * Suma una lista de montos en soles con precisión de centavos
 */
export function sumPEN(amounts: number[]): number {
  const totalCents = amounts.reduce((acc, curr) => acc + toCents(curr), 0);
  return fromCents(totalCents);
}
