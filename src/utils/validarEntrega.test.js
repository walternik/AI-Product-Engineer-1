/**
 * Tests para src/utils/validarEntrega.js
 *
 * Valida: Requirements 1.3, 1.4, 1.5, 1.6
 *
 * Estrategia (del diseño):
 * - validarEntrega(entrada, lote, hoy) devuelve { valido: boolean, errores: {} }.
 * - La fecha de referencia entra por parámetro (no se lee el reloj del sistema).
 * - Familia vacía → error en `errores.familia`.
 * - Cantidad cero, negativa o mayor que el disponible → error en `errores.cantidad`.
 * - Unidad 'unidades' → solo enteros. 'kilogramos' / 'litros' → hasta 3 decimales.
 * - Lote vencido → error en `errores.lote` (no se entrega alimento vencido).
 * - Lote que vence hoy → aceptado.
 * - Fecha vacía → válida (el servicio pondrá el día local).
 * - Fecha futura → error en `errores.fecha`.
 */

import { describe, it, expect } from 'vitest';
import { validarEntrega } from './validarEntrega.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const HOY = '2026-06-15';

/** Lote base vigente. */
function loteBase(overrides = {}) {
  return {
    id: 'lote-1',
    nombre: 'Arroz',
    cantidad: 10,
    unidad: 'kilogramos',
    fechaRecepcion: '2026-01-01',
    fechaVencimiento: '2026-12-31',
    ...overrides,
  };
}

/** Entrada base válida. */
function entradaBase(overrides = {}) {
  return {
    familia: 'Familia Gómez',
    cantidad: 2.5,
    fecha: '',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Caso feliz
// ---------------------------------------------------------------------------

describe('validarEntrega — caso válido', () => {
  it('devuelve valido:true y errores vacío para una entrega correcta', () => {
    const resultado = validarEntrega(entradaBase(), loteBase(), HOY);
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.4 — lote vencido
// ---------------------------------------------------------------------------

describe('validarEntrega — lote vencido (Requirement 1.4)', () => {
  it('rechaza un lote vencido con mensaje en español sobre el lote', () => {
    const loteVencido = loteBase({ fechaVencimiento: '2026-06-14' }); // ayer
    const { valido, errores } = validarEntrega(entradaBase(), loteVencido, HOY);
    expect(valido).toBe(false);
    expect(errores.lote).toBeTruthy();
    // El mensaje debe estar en español y mencionar "vencido"
    expect(errores.lote).toMatch(/vencido/i);
  });

  it('acepta un lote que vence exactamente hoy', () => {
    const loteHoy = loteBase({ fechaVencimiento: HOY }); // vence hoy
    const { valido, errores } = validarEntrega(entradaBase(), loteHoy, HOY);
    expect(valido).toBe(true);
    expect(errores.lote).toBeUndefined();
  });

  it('acepta un lote que vence mañana', () => {
    const loteMañana = loteBase({ fechaVencimiento: '2026-06-16' });
    const { valido } = validarEntrega(entradaBase(), loteMañana, HOY);
    expect(valido).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.4 — lote inexistente o sin stock
// ---------------------------------------------------------------------------

describe('validarEntrega — lote no disponible', () => {
  it('rechaza cuando el lote es null', () => {
    const { valido, errores } = validarEntrega(entradaBase(), null, HOY);
    expect(valido).toBe(false);
    expect(errores.lote).toBeTruthy();
  });

  it('rechaza cuando el lote es undefined', () => {
    const { valido, errores } = validarEntrega(entradaBase(), undefined, HOY);
    expect(valido).toBe(false);
    expect(errores.lote).toBeTruthy();
  });

  it('rechaza cuando el lote tiene cantidad cero', () => {
    const loteSinStock = loteBase({ cantidad: 0 });
    const { valido, errores } = validarEntrega(entradaBase(), loteSinStock, HOY);
    expect(valido).toBe(false);
    expect(errores.lote).toBeTruthy();
  });

  it('rechaza cuando el lote tiene cantidad negativa', () => {
    const loteNegativo = loteBase({ cantidad: -5 });
    const { valido, errores } = validarEntrega(
      entradaBase(),
      loteNegativo,
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.lote).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.5 — familia vacía
// ---------------------------------------------------------------------------

describe('validarEntrega — familia (Requirement 1.5)', () => {
  it('rechaza familia vacía con mensaje en español', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ familia: '' }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.familia).toBeTruthy();
  });

  it('rechaza familia de solo espacios (tras recortar queda vacía)', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ familia: '   ' }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.familia).toBeTruthy();
  });

  it('rechaza familia de más de 80 caracteres', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ familia: 'F'.repeat(81) }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.familia).toBeTruthy();
  });

  it('acepta familia de exactamente 80 caracteres', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ familia: 'F'.repeat(80) }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.familia).toBeUndefined();
  });

  it('acepta familia de 1 carácter', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ familia: 'X' }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.familia).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.5 — cantidad cero, negativa o mayor que el stock
// ---------------------------------------------------------------------------

describe('validarEntrega — cantidad inválida (Requirement 1.5)', () => {
  it('rechaza cantidad cero', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 0 }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza cantidad negativa', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: -1 }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza cantidad mayor que la disponible en el lote', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 10.001 }), // lote tiene 10
      loteBase({ cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('acepta cantidad igual a la disponible (agota el lote)', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 10 }),
      loteBase({ cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('acepta cantidad menor que la disponible', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 0.5 }),
      loteBase({ cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('rechaza NaN', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: NaN }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza Infinity', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: Infinity }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.6 — decimales según la unidad del lote
// ---------------------------------------------------------------------------

describe('validarEntrega — decimales en unidades (Requirement 1.6)', () => {
  it('rechaza cantidad decimal cuando la unidad del lote es "unidades"', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 2.5 }),
      loteBase({ unidad: 'unidades', cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('acepta cantidad entera cuando la unidad es "unidades"', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 3 }),
      loteBase({ unidad: 'unidades', cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('acepta exactamente tres decimales en kilogramos', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 1.125 }),
      loteBase({ unidad: 'kilogramos', cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('rechaza cuatro decimales en kilogramos', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 1.1234 }),
      loteBase({ unidad: 'kilogramos', cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('acepta exactamente tres decimales en litros', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 0.125 }),
      loteBase({ unidad: 'litros', cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('rechaza cuatro decimales en litros', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 0.1234 }),
      loteBase({ unidad: 'litros', cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('acepta dos decimales en litros', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ cantidad: 1.25 }),
      loteBase({ unidad: 'litros', cantidad: 10 }),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.3 — fecha vacía y fecha futura
// ---------------------------------------------------------------------------

describe('validarEntrega — fecha (Requirement 1.3)', () => {
  it('acepta fecha vacía (string vacío)', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: '' }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.fecha).toBeUndefined();
  });

  it('acepta fecha undefined', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: undefined }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.fecha).toBeUndefined();
  });

  it('acepta fecha null', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: null }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.fecha).toBeUndefined();
  });

  it('acepta fecha igual a hoy', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: HOY }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.fecha).toBeUndefined();
  });

  it('acepta fecha anterior a hoy (entrega olvidada)', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: '2026-01-01' }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(true);
    expect(errores.fecha).toBeUndefined();
  });

  it('rechaza fecha posterior a hoy con mensaje en español', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: '2026-06-16' }), // mañana
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.fecha).toBeTruthy();
  });

  it('rechaza una fecha imposible como 2026-02-30', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: '2026-02-30' }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.fecha).toBeTruthy();
  });

  it('rechaza un formato incorrecto como "hoy"', () => {
    const { valido, errores } = validarEntrega(
      entradaBase({ fecha: 'hoy' }),
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.fecha).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Mensajes en español y aislamiento de errores
// ---------------------------------------------------------------------------

describe('validarEntrega — mensajes en español y aislamiento', () => {
  it('los mensajes de error no contienen palabras clave en inglés', () => {
    const { errores } = validarEntrega(
      { familia: '', cantidad: 0, fecha: 'not-a-date' },
      loteBase(),
      HOY
    );
    for (const mensaje of Object.values(errores)) {
      expect(mensaje).not.toMatch(/\b(required|invalid|must|cannot)\b/i);
    }
  });

  it('un campo inválido no contamina los demás (aislamiento)', () => {
    const { errores } = validarEntrega(
      entradaBase({ familia: '' }),
      loteBase(),
      HOY
    );
    expect(errores.familia).toBeTruthy();
    expect(errores.cantidad).toBeUndefined();
    expect(errores.fecha).toBeUndefined();
    expect(errores.lote).toBeUndefined();
  });

  it('varios campos inválidos producen varios errores a la vez', () => {
    const { valido, errores } = validarEntrega(
      { familia: '', cantidad: -1, fecha: '2099-01-01' },
      loteBase(),
      HOY
    );
    expect(valido).toBe(false);
    expect(errores.familia).toBeTruthy();
    expect(errores.cantidad).toBeTruthy();
    expect(errores.fecha).toBeTruthy();
  });
});
