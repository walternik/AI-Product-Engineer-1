/**
 * Tests para src/utils/fechas.js
 *
 * Valida: Requirements 1.3, 3.1, 3.2, 3.3
 *
 * Reglas de los tests:
 * - La fecha se fija con vi.setSystemTime (o se inyecta un objeto Date).
 *   Las funciones nunca leen el reloj por su cuenta salvo cuando no se
 *   les pasa el parámetro opcional.
 * - No se usa toISOString() ni new Date("YYYY-MM-DD").
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fechaLocalHoy, sumarDias, esFechaReal } from './fechas.js';

// ---------------------------------------------------------------------------
// fechaLocalHoy
// ---------------------------------------------------------------------------

describe('fechaLocalHoy', () => {
  it('devuelve la fecha local en formato YYYY-MM-DD usando un objeto Date inyectado', () => {
    // Inyectamos directamente un Date en horario local sin depender del reloj.
    const fecha = new Date(2025, 5, 15); // 15 de junio de 2025 (mes 0-indexado)
    expect(fechaLocalHoy(fecha)).toBe('2025-06-15');
  });

  it('rellena con cero el mes y el día de un solo dígito', () => {
    const fecha = new Date(2025, 0, 3); // 3 de enero de 2025
    expect(fechaLocalHoy(fecha)).toBe('2025-01-03');
  });

  it('usa el reloj del sistema cuando no se inyecta fecha (vi.setSystemTime)', () => {
    // Fijamos el reloj en una fecha local conocida.
    vi.useFakeTimers();
    // new Date(año, mes, día) fija la hora local en medianoche local.
    vi.setSystemTime(new Date(2024, 11, 31)); // 31 de diciembre de 2024
    expect(fechaLocalHoy()).toBe('2024-12-31');
    vi.useRealTimers();
  });

  it('no usa toISOString() — el resultado coincide con año/mes/día locales', () => {
    // Crea un Date cuya representación UTC difiere del local para asegurar
    // que la función utiliza getFullYear/getMonth/getDate y no toISOString.
    // Zona horaria UTC+5: medianoche local = 19:00 UTC del día anterior.
    const fecha = new Date(2025, 2, 1, 0, 0, 0); // 1 de marzo de 2025 medianoche local
    const resultado = fechaLocalHoy(fecha);
    // Independientemente de UTC offset, debe reflejar el día local (1 de marzo).
    expect(resultado).toBe('2025-03-01');
  });
});

// ---------------------------------------------------------------------------
// sumarDias
// ---------------------------------------------------------------------------

describe('sumarDias', () => {
  it('suma días simples dentro del mismo mes', () => {
    expect(sumarDias('2025-06-10', 5)).toBe('2025-06-15');
  });

  it('cruza al mes siguiente correctamente', () => {
    expect(sumarDias('2025-01-28', 5)).toBe('2025-02-02');
  });

  it('cruza al año siguiente correctamente', () => {
    expect(sumarDias('2025-12-30', 3)).toBe('2026-01-02');
  });

  it('resta días (días negativos)', () => {
    expect(sumarDias('2025-03-05', -5)).toBe('2025-02-28');
  });

  it('suma 0 días devuelve la misma fecha', () => {
    expect(sumarDias('2025-07-04', 0)).toBe('2025-07-04');
  });

  it('maneja el salto de año bisiesto (28 feb → 29 feb)', () => {
    expect(sumarDias('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('maneja el salto de año bisiesto (29 feb → 1 mar)', () => {
    expect(sumarDias('2024-02-29', 1)).toBe('2024-03-01');
  });

  it('en año no bisiesto salta del 28 feb al 1 mar', () => {
    expect(sumarDias('2025-02-28', 1)).toBe('2025-03-01');
  });

  it('suma 7 días (ventana de próximo a vencer del diseño)', () => {
    expect(sumarDias('2025-06-01', 7)).toBe('2025-06-08');
  });
});

// ---------------------------------------------------------------------------
// esFechaReal
// ---------------------------------------------------------------------------

describe('esFechaReal', () => {
  // Fechas válidas
  it('acepta una fecha normal', () => {
    expect(esFechaReal('2025-06-15')).toBe(true);
  });

  it('acepta el 29 de febrero en año bisiesto', () => {
    expect(esFechaReal('2024-02-29')).toBe(true);
  });

  it('acepta el 31 de diciembre', () => {
    expect(esFechaReal('2025-12-31')).toBe(true);
  });

  it('acepta el 1 de enero', () => {
    expect(esFechaReal('2025-01-01')).toBe(true);
  });

  // Fechas inválidas: días que no existen
  it('rechaza el 30 de febrero', () => {
    expect(esFechaReal('2025-02-30')).toBe(false);
  });

  it('rechaza el 29 de febrero en año no bisiesto', () => {
    expect(esFechaReal('2025-02-29')).toBe(false);
  });

  it('rechaza el 31 de abril (mes con 30 días)', () => {
    expect(esFechaReal('2025-04-31')).toBe(false);
  });

  it('rechaza el 31 de junio', () => {
    expect(esFechaReal('2025-06-31')).toBe(false);
  });

  // Meses fuera de rango
  it('rechaza el mes 0', () => {
    expect(esFechaReal('2025-00-15')).toBe(false);
  });

  it('rechaza el mes 13', () => {
    expect(esFechaReal('2025-13-01')).toBe(false);
  });

  // Formato incorrecto
  it('rechaza una cadena sin formato YYYY-MM-DD', () => {
    expect(esFechaReal('15/06/2025')).toBe(false);
  });

  it('rechaza una cadena vacía', () => {
    expect(esFechaReal('')).toBe(false);
  });

  it('rechaza null', () => {
    expect(esFechaReal(null)).toBe(false);
  });

  it('rechaza undefined', () => {
    expect(esFechaReal(undefined)).toBe(false);
  });

  it('rechaza un número', () => {
    expect(esFechaReal(20250615)).toBe(false);
  });

  it('rechaza una fecha con letras en el día', () => {
    expect(esFechaReal('2025-06-ab')).toBe(false);
  });
});
