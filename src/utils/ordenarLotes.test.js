/**
 * Tests para src/utils/ordenarLotes.js
 *
 * Valida: Requirements 2.3, 3.7
 *
 * Estrategia (del diseño):
 * - Ordenar por fechaVencimiento ascendente (texto YYYY-MM-DD, comparación lexicográfica).
 * - En empate de vencimiento, ordenar por nombre alfabéticamente.
 * - El arreglo original no se muta.
 * - Los lotes vencidos permanecen en la lista (Req 3.7).
 */

import { describe, it, expect } from 'vitest';
import { ordenarLotes } from './ordenarLotes.js';

// ---------------------------------------------------------------------------
// Arreglo vacío y un solo elemento
// ---------------------------------------------------------------------------

describe('ordenarLotes — casos base', () => {
  it('devuelve un arreglo vacío cuando la entrada está vacía', () => {
    expect(ordenarLotes([])).toEqual([]);
  });

  it('devuelve un arreglo con un solo lote sin modificarlo', () => {
    const lote = { id: '1', nombre: 'Arroz', cantidad: 1, unidad: 'kilogramos', fechaVencimiento: '2026-01-10' };
    const resultado = ordenarLotes([lote]);
    expect(resultado).toEqual([lote]);
  });
});

// ---------------------------------------------------------------------------
// Requirement 2.3 — orden por fecha de vencimiento ascendente
// ---------------------------------------------------------------------------

describe('ordenarLotes — orden por fechaVencimiento (Requirement 2.3)', () => {
  it('coloca el lote con vencimiento más próximo primero', () => {
    const lotes = [
      { id: '2', nombre: 'Leche', fechaVencimiento: '2026-03-01' },
      { id: '1', nombre: 'Arroz', fechaVencimiento: '2026-01-15' },
    ];
    const resultado = ordenarLotes(lotes);
    expect(resultado[0].id).toBe('1');
    expect(resultado[1].id).toBe('2');
  });

  it('ordena tres lotes correctamente', () => {
    const lotes = [
      { id: 'c', nombre: 'Pasta', fechaVencimiento: '2026-12-01' },
      { id: 'a', nombre: 'Arroz', fechaVencimiento: '2026-06-01' },
      { id: 'b', nombre: 'Aceite', fechaVencimiento: '2026-09-15' },
    ];
    const ids = ordenarLotes(lotes).map((l) => l.id);
    expect(ids).toEqual(['a', 'b', 'c']);
  });

  it('coloca antes el lote que cruza el fin de mes', () => {
    const lotes = [
      { id: '2', nombre: 'Frijoles', fechaVencimiento: '2026-02-01' },
      { id: '1', nombre: 'Avena',    fechaVencimiento: '2026-01-31' },
    ];
    const resultado = ordenarLotes(lotes);
    expect(resultado[0].id).toBe('1');
    expect(resultado[1].id).toBe('2');
  });

  it('coloca antes el lote que cruza el fin de año', () => {
    const lotes = [
      { id: '2', nombre: 'Harina', fechaVencimiento: '2027-01-01' },
      { id: '1', nombre: 'Arroz',  fechaVencimiento: '2026-12-31' },
    ];
    const resultado = ordenarLotes(lotes);
    expect(resultado[0].id).toBe('1');
    expect(resultado[1].id).toBe('2');
  });
});

// ---------------------------------------------------------------------------
// Desempate por nombre cuando la fecha es igual
// ---------------------------------------------------------------------------

describe('ordenarLotes — desempate por nombre', () => {
  it('ordena alfabéticamente cuando dos lotes tienen la misma fecha', () => {
    const lotes = [
      { id: '2', nombre: 'Maíz',  fechaVencimiento: '2026-05-10' },
      { id: '1', nombre: 'Arroz', fechaVencimiento: '2026-05-10' },
    ];
    const resultado = ordenarLotes(lotes);
    expect(resultado[0].nombre).toBe('Arroz');
    expect(resultado[1].nombre).toBe('Maíz');
  });

  it('ordena tres lotes con la misma fecha por nombre', () => {
    const lotes = [
      { id: '3', nombre: 'Pasta',    fechaVencimiento: '2026-08-20' },
      { id: '1', nombre: 'Aceite',   fechaVencimiento: '2026-08-20' },
      { id: '2', nombre: 'Lentejas', fechaVencimiento: '2026-08-20' },
    ];
    const nombres = ordenarLotes(lotes).map((l) => l.nombre);
    expect(nombres).toEqual(['Aceite', 'Lentejas', 'Pasta']);
  });

  it('nombre idéntico con distinta fecha no usa el desempate', () => {
    const lotes = [
      { id: '2', nombre: 'Arroz', fechaVencimiento: '2026-07-01' },
      { id: '1', nombre: 'Arroz', fechaVencimiento: '2026-06-01' },
    ];
    const resultado = ordenarLotes(lotes);
    expect(resultado[0].id).toBe('1');
    expect(resultado[1].id).toBe('2');
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.7 — los lotes vencidos no se filtran
// ---------------------------------------------------------------------------

describe('ordenarLotes — lotes vencidos permanecen (Requirement 3.7)', () => {
  it('incluye el lote vencido en la lista ordenada', () => {
    const hoy = '2025-06-15';
    const lotes = [
      { id: 'bueno',   nombre: 'Harina', fechaVencimiento: '2026-01-01' },
      { id: 'vencido', nombre: 'Arroz',  fechaVencimiento: '2025-01-01' },
    ];
    const resultado = ordenarLotes(lotes);
    // El vencido debe aparecer primero (fecha anterior)
    expect(resultado[0].id).toBe('vencido');
    expect(resultado[1].id).toBe('bueno');
  });
});

// ---------------------------------------------------------------------------
// No muta el arreglo original
// ---------------------------------------------------------------------------

describe('ordenarLotes — inmutabilidad', () => {
  it('no modifica el arreglo original', () => {
    const lotes = [
      { id: '2', nombre: 'Leche', fechaVencimiento: '2026-03-01' },
      { id: '1', nombre: 'Arroz', fechaVencimiento: '2026-01-01' },
    ];
    const original = [lotes[0], lotes[1]]; // copia de referencias para comparar orden
    ordenarLotes(lotes);
    expect(lotes[0]).toBe(original[0]);
    expect(lotes[1]).toBe(original[1]);
  });

  it('devuelve un arreglo diferente al original', () => {
    const lotes = [{ id: '1', nombre: 'Arroz', fechaVencimiento: '2026-01-01' }];
    const resultado = ordenarLotes(lotes);
    expect(resultado).not.toBe(lotes);
  });
});
