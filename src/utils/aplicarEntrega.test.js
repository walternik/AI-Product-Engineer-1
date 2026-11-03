/**
 * Tests para src/utils/aplicarEntrega.js
 *
 * Valida: Requirements 1.2, 1.7, 1.8, 2.2, 2.4
 *
 * Estrategia (del diseño):
 * - aplicarEntrega(lotes, entregas, entrada) devuelve { lotes, entregas }.
 * - La entrada ya fue validada; esta función solo aplica las reglas de stock.
 * - Entrega parcial: descuenta cantidad, conserva id/unidad/fechas del lote.
 * - Entrega total: quita el lote; la entrega copia nombre/unidad/fechas.
 * - Punto flotante: resto de tres decimales no queda negativo.
 * - El historial devuelto se ordena por fechaEntrega desc y secuencia asc.
 * - No se mutan las listas originales.
 */

import { describe, it, expect } from 'vitest';
import { aplicarEntrega } from './aplicarEntrega.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

function entradaBase(overrides = {}) {
  return {
    id: 'entrega-1',
    loteId: 'lote-1',
    familia: 'Familia Gómez',
    cantidad: 2.5,
    fechaEntrega: '2026-06-15',
    secuencia: 1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Requirement 1.8 — entrega parcial
// ---------------------------------------------------------------------------

describe('aplicarEntrega — entrega parcial (Requirement 1.8)', () => {
  it('descuenta la cantidad del lote', () => {
    const lotes = [loteBase()];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 3 }));
    expect(lotesNuevos[0].cantidad).toBe(7);
  });

  it('conserva el id del lote', () => {
    const lotes = [loteBase()];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 1 }));
    expect(lotesNuevos[0].id).toBe('lote-1');
  });

  it('conserva la unidad del lote', () => {
    const lotes = [loteBase({ unidad: 'litros' })];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 1 }));
    expect(lotesNuevos[0].unidad).toBe('litros');
  });

  it('conserva fechaRecepcion del lote', () => {
    const lotes = [loteBase()];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 1 }));
    expect(lotesNuevos[0].fechaRecepcion).toBe('2026-01-01');
  });

  it('conserva fechaVencimiento del lote', () => {
    const lotes = [loteBase()];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 1 }));
    expect(lotesNuevos[0].fechaVencimiento).toBe('2026-12-31');
  });

  it('mantiene los demás lotes en la lista', () => {
    const lotes = [
      loteBase({ id: 'lote-1' }),
      loteBase({ id: 'lote-2', nombre: 'Harina' }),
    ];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 2 }));
    expect(lotesNuevos).toHaveLength(2);
    expect(lotesNuevos.find((l) => l.id === 'lote-2')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.7 — entrega total (agota el lote)
// ---------------------------------------------------------------------------

describe('aplicarEntrega — entrega total (Requirement 1.7)', () => {
  it('quita el lote del stock cuando la cantidad iguala la disponible', () => {
    const lotes = [loteBase({ cantidad: 5 })];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 5 }));
    expect(lotesNuevos).toHaveLength(0);
  });

  it('copia el nombre del alimento en la entrega', () => {
    const lotes = [loteBase({ cantidad: 5, nombre: 'Maíz' })];
    const { entregas } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 5 }));
    expect(entregas[0].nombreAlimento).toBe('Maíz');
  });

  it('copia la unidad en la entrega', () => {
    const lotes = [loteBase({ cantidad: 5, unidad: 'litros' })];
    const { entregas } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 5 }));
    expect(entregas[0].unidad).toBe('litros');
  });

  it('copia fechaRecepcion en la entrega', () => {
    const lotes = [loteBase({ cantidad: 5, fechaRecepcion: '2025-03-10' })];
    const { entregas } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 5 }));
    expect(entregas[0].fechaRecepcion).toBe('2025-03-10');
  });

  it('copia fechaVencimiento en la entrega (Requirement 2.4)', () => {
    const lotes = [loteBase({ cantidad: 5, fechaVencimiento: '2026-09-01' })];
    const { entregas } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 5 }));
    expect(entregas[0].fechaVencimiento).toBe('2026-09-01');
  });

  it('conserva los otros lotes cuando se agota uno', () => {
    const lotes = [
      loteBase({ id: 'lote-1', cantidad: 5 }),
      loteBase({ id: 'lote-2', nombre: 'Lentejas', cantidad: 8 }),
    ];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 5 }));
    expect(lotesNuevos).toHaveLength(1);
    expect(lotesNuevos[0].id).toBe('lote-2');
  });
});

// ---------------------------------------------------------------------------
// Punto flotante — el resto no queda negativo
// ---------------------------------------------------------------------------

describe('aplicarEntrega — redondeo a tres decimales', () => {
  it('0.1 + 0.2 no deja el lote en negativo', () => {
    // 0.3 - 0.1 - 0.2 en JS sin redondear puede dar -2.8e-17
    const lotes = [loteBase({ cantidad: 0.3 })];
    // Primera entrega: 0.1 → queda 0.2
    const paso1 = aplicarEntrega(lotes, [], entradaBase({ id: 'e-1', cantidad: 0.1 }));
    // Segunda entrega: 0.2 → debería quedar 0 (lote agotado)
    const paso2 = aplicarEntrega(paso1.lotes, paso1.entregas, entradaBase({ id: 'e-2', loteId: 'lote-1', cantidad: 0.2, secuencia: 2 }));
    // El lote fue agotado; no debe quedar en el stock
    expect(paso2.lotes.find((l) => l.id === 'lote-1')).toBeUndefined();
  });

  it('una entrega de tres decimales no deja resto negativo', () => {
    // 1.0 - 0.001 = 0.999 (exacto con tres decimales)
    const lotes = [loteBase({ cantidad: 1.0 })];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 0.001 }));
    expect(lotesNuevos[0].cantidad).toBe(0.999);
    expect(lotesNuevos[0].cantidad).toBeGreaterThan(0);
  });

  it('el resultado tiene exactamente tres decimales cuando aplica', () => {
    const lotes = [loteBase({ cantidad: 5 })];
    const { lotes: lotesNuevos } = aplicarEntrega(lotes, [], entradaBase({ cantidad: 1.125 }));
    expect(lotesNuevos[0].cantidad).toBe(3.875);
  });
});

// ---------------------------------------------------------------------------
// Requirement 2.2 — orden del historial
// ---------------------------------------------------------------------------

describe('aplicarEntrega — orden del historial (Requirement 2.2)', () => {
  it('las entregas quedan ordenadas por fechaEntrega descendente', () => {
    const lotes = [loteBase({ cantidad: 20 })];
    const entregaAnterior = {
      id: 'e-anterior',
      loteId: 'lote-1',
      familia: 'Familia A',
      cantidad: 1,
      unidad: 'kilogramos',
      nombreAlimento: 'Arroz',
      fechaRecepcion: '2026-01-01',
      fechaVencimiento: '2026-12-31',
      fechaEntrega: '2026-06-10',
      secuencia: 1,
    };

    const { entregas } = aplicarEntrega(
      lotes,
      [entregaAnterior],
      entradaBase({ id: 'e-nueva', cantidad: 1, fechaEntrega: '2026-06-20', secuencia: 2 })
    );

    expect(entregas[0].fechaEntrega).toBe('2026-06-20');
    expect(entregas[1].fechaEntrega).toBe('2026-06-10');
  });

  it('desempata con secuencia ascendente cuando la fecha es igual', () => {
    const lotes = [loteBase({ cantidad: 20 })];
    const entregaPrevia = {
      id: 'e-previa',
      loteId: 'lote-1',
      familia: 'Familia B',
      cantidad: 1,
      unidad: 'kilogramos',
      nombreAlimento: 'Arroz',
      fechaRecepcion: '2026-01-01',
      fechaVencimiento: '2026-12-31',
      fechaEntrega: '2026-06-15',
      secuencia: 1,
    };

    const { entregas } = aplicarEntrega(
      lotes,
      [entregaPrevia],
      entradaBase({ id: 'e-nueva', cantidad: 1, fechaEntrega: '2026-06-15', secuencia: 2 })
    );

    expect(entregas[0].id).toBe('e-previa'); // secuencia 1 primero
    expect(entregas[1].id).toBe('e-nueva');  // secuencia 2 después
  });
});

// ---------------------------------------------------------------------------
// Inmutabilidad
// ---------------------------------------------------------------------------

describe('aplicarEntrega — inmutabilidad', () => {
  it('no muta el arreglo de lotes original', () => {
    const lotes = [loteBase()];
    const cantidadOriginal = lotes[0].cantidad;
    aplicarEntrega(lotes, [], entradaBase({ cantidad: 3 }));
    expect(lotes[0].cantidad).toBe(cantidadOriginal);
  });

  it('no muta el arreglo de entregas original', () => {
    const lotes = [loteBase({ cantidad: 20 })];
    const entregas = [];
    aplicarEntrega(lotes, entregas, entradaBase());
    expect(entregas).toHaveLength(0);
  });

  it('devuelve arreglos distintos a los originales', () => {
    const lotes = [loteBase()];
    const entregas = [];
    const resultado = aplicarEntrega(lotes, entregas, entradaBase({ cantidad: 2 }));
    expect(resultado.lotes).not.toBe(lotes);
    expect(resultado.entregas).not.toBe(entregas);
  });
});

// ---------------------------------------------------------------------------
// Lote no encontrado
// ---------------------------------------------------------------------------

describe('aplicarEntrega — lote no encontrado', () => {
  it('devuelve las listas sin cambios cuando el loteId no existe', () => {
    const lotes = [loteBase({ id: 'otro-lote' })];
    const entregas = [];
    const resultado = aplicarEntrega(lotes, entregas, entradaBase({ loteId: 'no-existe' }));
    expect(resultado.lotes).toHaveLength(1);
    expect(resultado.entregas).toHaveLength(0);
  });
});
