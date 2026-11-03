/**
 * Tests para src/utils/aplicarAnulacion.js
 *
 * Valida: Requirements 2.2, 3.2, 3.3
 *
 * Estrategia (del diseño):
 * - aplicarAnulacion(lotes, entregas, id) devuelve { lotes, entregas }.
 * - Si el id no existe, devuelve las listas sin cambios.
 * - Lote existente con unidad que coincide: suma la cantidad (redondeada a 3 dec).
 * - Lote existente con unidad distinta: no modifica nada.
 * - Lote ausente: lo recrea con los datos copiados en la entrega.
 * - Quita la entrega del historial.
 * - El historial devuelto se ordena por fechaEntrega desc y secuencia asc.
 * - No se mutan las listas originales.
 */

import { describe, it, expect } from 'vitest';
import { aplicarAnulacion } from './aplicarAnulacion.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function loteBase(overrides = {}) {
  return {
    id: 'lote-1',
    nombre: 'Arroz',
    cantidad: 5,
    unidad: 'kilogramos',
    fechaRecepcion: '2026-01-01',
    fechaVencimiento: '2026-12-31',
    ...overrides,
  };
}

function entregaBase(overrides = {}) {
  return {
    id: 'entrega-1',
    loteId: 'lote-1',
    familia: 'Familia Gómez',
    cantidad: 2,
    unidad: 'kilogramos',
    nombreAlimento: 'Arroz',
    fechaRecepcion: '2026-01-01',
    fechaVencimiento: '2026-12-31',
    fechaEntrega: '2026-06-15',
    secuencia: 1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Requirement 3.2 — anulación con lote existente de unidad coincidente
// ---------------------------------------------------------------------------

describe('aplicarAnulacion — lote existente con misma unidad (Requirement 3.2)', () => {
  it('suma la cantidad anulada al lote', () => {
    const lotes = [loteBase({ cantidad: 5 })];
    const entregas = [entregaBase({ cantidad: 2 })];
    const { lotes: lotesNuevos } = aplicarAnulacion(lotes, entregas, 'entrega-1');
    expect(lotesNuevos[0].cantidad).toBe(7);
  });

  it('quita la entrega del historial', () => {
    const lotes = [loteBase()];
    const entregas = [entregaBase()];
    const { entregas: entregasNuevas } = aplicarAnulacion(lotes, entregas, 'entrega-1');
    expect(entregasNuevas).toHaveLength(0);
  });

  it('mantiene la identidad del lote (id, nombre, unidad, fechas)', () => {
    const lotes = [loteBase()];
    const entregas = [entregaBase()];
    const { lotes: lotesNuevos } = aplicarAnulacion(lotes, entregas, 'entrega-1');
    const l = lotesNuevos[0];
    expect(l.id).toBe('lote-1');
    expect(l.nombre).toBe('Arroz');
    expect(l.unidad).toBe('kilogramos');
    expect(l.fechaRecepcion).toBe('2026-01-01');
    expect(l.fechaVencimiento).toBe('2026-12-31');
  });

  it('redondea la suma a tres decimales para evitar restos de punto flotante', () => {
    const lotes = [loteBase({ cantidad: 0.1 })];
    const entregas = [entregaBase({ cantidad: 0.2 })];
    const { lotes: lotesNuevos } = aplicarAnulacion(lotes, entregas, 'entrega-1');
    // 0.1 + 0.2 en JS sin redondear es 0.30000000000000004
    expect(lotesNuevos[0].cantidad).toBe(0.3);
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.2 — anulación con lote existente de unidad distinta
// ---------------------------------------------------------------------------

describe('aplicarAnulacion — lote existente con unidad distinta', () => {
  it('no modifica los lotes cuando la unidad del lote difiere', () => {
    const lotes = [loteBase({ unidad: 'litros' })]; // lote tiene 'litros'
    const entregas = [entregaBase({ unidad: 'kilogramos' })]; // entrega dice 'kilogramos'
    const { lotes: lotesNuevos } = aplicarAnulacion(lotes, entregas, 'entrega-1');
    expect(lotesNuevos[0].cantidad).toBe(5); // sin cambio
  });

  it('no modifica el historial cuando la unidad difiere', () => {
    const lotes = [loteBase({ unidad: 'litros' })];
    const entregas = [entregaBase({ unidad: 'kilogramos' })];
    const { entregas: entregasNuevas } = aplicarAnulacion(lotes, entregas, 'entrega-1');
    expect(entregasNuevas).toHaveLength(1); // la entrega sigue ahí
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.3 — anulación cuando el lote ya no está en el stock
// ---------------------------------------------------------------------------

describe('aplicarAnulacion — lote ausente (Requirement 3.3)', () => {
  it('recrea el lote con el loteId de la entrega', () => {
    const { lotes: lotesNuevos } = aplicarAnulacion([], [entregaBase()], 'entrega-1');
    expect(lotesNuevos[0].id).toBe('lote-1');
  });

  it('recrea el lote con el nombre copiado', () => {
    const entrega = entregaBase({ nombreAlimento: 'Maíz' });
    const { lotes: lotesNuevos } = aplicarAnulacion([], [entrega], 'entrega-1');
    expect(lotesNuevos[0].nombre).toBe('Maíz');
  });

  it('recrea el lote con la cantidad anulada', () => {
    const entrega = entregaBase({ cantidad: 3.5 });
    const { lotes: lotesNuevos } = aplicarAnulacion([], [entrega], 'entrega-1');
    expect(lotesNuevos[0].cantidad).toBe(3.5);
  });

  it('recrea el lote con la unidad copiada', () => {
    const entrega = entregaBase({ unidad: 'litros' });
    const { lotes: lotesNuevos } = aplicarAnulacion([], [entrega], 'entrega-1');
    expect(lotesNuevos[0].unidad).toBe('litros');
  });

  it('recrea el lote con fechaRecepcion copiada', () => {
    const entrega = entregaBase({ fechaRecepcion: '2025-05-20' });
    const { lotes: lotesNuevos } = aplicarAnulacion([], [entrega], 'entrega-1');
    expect(lotesNuevos[0].fechaRecepcion).toBe('2025-05-20');
  });

  it('recrea el lote con fechaVencimiento copiada', () => {
    const entrega = entregaBase({ fechaVencimiento: '2026-09-01' });
    const { lotes: lotesNuevos } = aplicarAnulacion([], [entrega], 'entrega-1');
    expect(lotesNuevos[0].fechaVencimiento).toBe('2026-09-01');
  });

  it('quita la entrega del historial al recrear el lote', () => {
    const { entregas: entregasNuevas } = aplicarAnulacion([], [entregaBase()], 'entrega-1');
    expect(entregasNuevas).toHaveLength(0);
  });

  it('mantiene otros lotes en la lista al recrear', () => {
    const otroLote = loteBase({ id: 'lote-2', nombre: 'Harina' });
    const { lotes: lotesNuevos } = aplicarAnulacion([otroLote], [entregaBase()], 'entrega-1');
    expect(lotesNuevos).toHaveLength(2);
    expect(lotesNuevos.find((l) => l.id === 'lote-2')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Id inexistente
// ---------------------------------------------------------------------------

describe('aplicarAnulacion — id no encontrado', () => {
  it('devuelve las listas sin cambios cuando el id no existe', () => {
    const lotes = [loteBase()];
    const entregas = [entregaBase()];
    const resultado = aplicarAnulacion(lotes, entregas, 'no-existe');
    expect(resultado.lotes).toHaveLength(1);
    expect(resultado.entregas).toHaveLength(1);
  });

  it('devuelve las listas sin cambios con entregas vacías', () => {
    const lotes = [loteBase()];
    const resultado = aplicarAnulacion(lotes, [], 'cualquier-id');
    expect(resultado.lotes).toHaveLength(1);
    expect(resultado.entregas).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Requirement 2.2 — orden del historial tras la anulación
// ---------------------------------------------------------------------------

describe('aplicarAnulacion — orden del historial tras anulación (Requirement 2.2)', () => {
  it('el historial restante queda ordenado por fechaEntrega descendente', () => {
    const lotes = [loteBase({ cantidad: 20 })];
    const entregas = [
      entregaBase({ id: 'e-1', fechaEntrega: '2026-06-20', secuencia: 1 }),
      entregaBase({ id: 'e-2', fechaEntrega: '2026-06-10', secuencia: 2 }),
      entregaBase({ id: 'e-3', fechaEntrega: '2026-06-15', secuencia: 3 }),
    ];

    // Anulamos la del día 20
    const { entregas: entregasNuevas } = aplicarAnulacion(lotes, entregas, 'e-1');

    expect(entregasNuevas[0].fechaEntrega).toBe('2026-06-15');
    expect(entregasNuevas[1].fechaEntrega).toBe('2026-06-10');
  });

  it('desempata con secuencia ascendente cuando la fecha es igual', () => {
    const lotes = [loteBase({ cantidad: 20 })];
    const entregas = [
      entregaBase({ id: 'e-1', fechaEntrega: '2026-06-15', secuencia: 1 }),
      entregaBase({ id: 'e-2', fechaEntrega: '2026-06-15', secuencia: 2 }),
      entregaBase({ id: 'e-3', fechaEntrega: '2026-06-15', secuencia: 3 }),
    ];

    // Anulamos la de secuencia 2
    const { entregas: entregasNuevas } = aplicarAnulacion(lotes, entregas, 'e-2');

    expect(entregasNuevas[0].id).toBe('e-1'); // secuencia 1
    expect(entregasNuevas[1].id).toBe('e-3'); // secuencia 3
  });
});

// ---------------------------------------------------------------------------
// Inmutabilidad
// ---------------------------------------------------------------------------

describe('aplicarAnulacion — inmutabilidad', () => {
  it('no muta el arreglo de lotes original', () => {
    const lotes = [loteBase({ cantidad: 5 })];
    const entregas = [entregaBase({ cantidad: 2 })];
    aplicarAnulacion(lotes, entregas, 'entrega-1');
    expect(lotes[0].cantidad).toBe(5);
  });

  it('no muta el arreglo de entregas original', () => {
    const lotes = [loteBase()];
    const entregas = [entregaBase()];
    const longitudOriginal = entregas.length;
    aplicarAnulacion(lotes, entregas, 'entrega-1');
    expect(entregas).toHaveLength(longitudOriginal);
  });

  it('devuelve arreglos distintos a los originales', () => {
    const lotes = [loteBase()];
    const entregas = [entregaBase()];
    const resultado = aplicarAnulacion(lotes, entregas, 'entrega-1');
    expect(resultado.lotes).not.toBe(lotes);
    expect(resultado.entregas).not.toBe(entregas);
  });
});
