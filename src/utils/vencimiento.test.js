/**
 * Tests para src/utils/vencimiento.js
 *
 * Valida: Requirements 3.1, 3.2, 3.3
 *
 * Estrategia (del diseño):
 * - El día anterior a hoy  → 'vencido'
 * - Hoy                    → 'proximo-a-vencer'
 * - Hoy + 7                → 'proximo-a-vencer'   (límite inclusivo)
 * - Hoy + 8                → 'en-buen-estado'
 *
 * Las fechas se pasan como cadenas YYYY-MM-DD; la comparación es
 * lexicográfica (no se usa Date ni toISOString).
 */

import { describe, it, expect } from 'vitest';
import { estadoDeLote, DIAS_PROXIMO_A_VENCER } from './vencimiento.js';

// Fecha de referencia fija para todos los tests: no depende del reloj real.
const HOY = '2025-06-15';

// ---------------------------------------------------------------------------
// Constante de ventana
// ---------------------------------------------------------------------------

describe('DIAS_PROXIMO_A_VENCER', () => {
  it('vale 7', () => {
    expect(DIAS_PROXIMO_A_VENCER).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.1 — fecha anterior a hoy → vencido
// ---------------------------------------------------------------------------

describe('estadoDeLote — vencido (Requirement 3.1)', () => {
  it('clasifica como vencido el día anterior a hoy', () => {
    expect(estadoDeLote('2025-06-14', HOY)).toBe('vencido');
  });

  it('clasifica como vencido una fecha varios días antes', () => {
    expect(estadoDeLote('2025-05-01', HOY)).toBe('vencido');
  });

  it('clasifica como vencido una fecha del año anterior', () => {
    expect(estadoDeLote('2024-12-31', HOY)).toBe('vencido');
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.2 — desde hoy hasta hoy+7, inclusive → próximo a vencer
// ---------------------------------------------------------------------------

describe('estadoDeLote — próximo a vencer (Requirement 3.2)', () => {
  it('clasifica como próximo a vencer el día de hoy (límite inferior)', () => {
    expect(estadoDeLote(HOY, HOY)).toBe('proximo-a-vencer');
  });

  it('clasifica como próximo a vencer hoy + 1', () => {
    expect(estadoDeLote('2025-06-16', HOY)).toBe('proximo-a-vencer');
  });

  it('clasifica como próximo a vencer hoy + 4 (mitad de ventana)', () => {
    expect(estadoDeLote('2025-06-19', HOY)).toBe('proximo-a-vencer');
  });

  it('clasifica como próximo a vencer hoy + 7 (límite superior, inclusivo)', () => {
    expect(estadoDeLote('2025-06-22', HOY)).toBe('proximo-a-vencer');
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.3 — posterior a hoy+7 → en buen estado
// ---------------------------------------------------------------------------

describe('estadoDeLote — en buen estado (Requirement 3.3)', () => {
  it('clasifica como en buen estado hoy + 8 (un día fuera de la ventana)', () => {
    expect(estadoDeLote('2025-06-23', HOY)).toBe('en-buen-estado');
  });

  it('clasifica como en buen estado una fecha un mes después', () => {
    expect(estadoDeLote('2025-07-15', HOY)).toBe('en-buen-estado');
  });

  it('clasifica como en buen estado una fecha del año siguiente', () => {
    expect(estadoDeLote('2026-01-01', HOY)).toBe('en-buen-estado');
  });
});

// ---------------------------------------------------------------------------
// Cruce de mes / año (robustez del cálculo de límite)
// ---------------------------------------------------------------------------

describe('estadoDeLote — límite hoy+7 cruza mes', () => {
  it('hoy = 2025-06-28, hoy+7 = 2025-07-05 → ambos son próximo a vencer', () => {
    const hoy = '2025-06-28';
    expect(estadoDeLote('2025-07-05', hoy)).toBe('proximo-a-vencer');
    expect(estadoDeLote('2025-07-06', hoy)).toBe('en-buen-estado');
  });

  it('hoy = 2025-12-28, hoy+7 = 2026-01-04 → cruce de año correcto', () => {
    const hoy = '2025-12-28';
    expect(estadoDeLote('2026-01-04', hoy)).toBe('proximo-a-vencer');
    expect(estadoDeLote('2026-01-05', hoy)).toBe('en-buen-estado');
  });
});
