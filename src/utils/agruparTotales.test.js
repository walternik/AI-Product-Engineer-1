/**
 * Tests para src/utils/agruparTotales.js
 *
 * Valida: Requirements 2.2, 2.5
 *
 * Estrategia (del diseño):
 * - Sumar cantidades solo cuando nombre Y unidad coinciden exactamente.
 * - «Arroz» y «arroz» son grupos distintos (comparación exacta).
 * - Misma nombre con distinta unidad genera grupos separados.
 * - El detalle de cada lote no se modifica; solo se agregan los totales.
 * - El arreglo original no se muta.
 */

import { describe, it, expect } from 'vitest';
import { agruparTotales } from './agruparTotales.js';

// ---------------------------------------------------------------------------
// Casos base
// ---------------------------------------------------------------------------

describe('agruparTotales — casos base', () => {
  it('devuelve un arreglo vacío cuando la entrada está vacía', () => {
    expect(agruparTotales([])).toEqual([]);
  });

  it('devuelve un grupo con un solo lote con el total igual a su cantidad', () => {
    const lotes = [{ nombre: 'Arroz', cantidad: 3, unidad: 'kilogramos' }];
    const resultado = agruparTotales(lotes);
    expect(resultado).toEqual([{ nombre: 'Arroz', unidad: 'kilogramos', total: 3 }]);
  });
});

// ---------------------------------------------------------------------------
// Requirement 2.5 — total agrupado por nombre y unidad
// ---------------------------------------------------------------------------

describe('agruparTotales — suma por nombre y unidad (Requirement 2.5)', () => {
  it('suma dos lotes con el mismo nombre y unidad', () => {
    const lotes = [
      { nombre: 'Arroz', cantidad: 2, unidad: 'kilogramos' },
      { nombre: 'Arroz', cantidad: 3, unidad: 'kilogramos' },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toEqual({ nombre: 'Arroz', unidad: 'kilogramos', total: 5 });
  });

  it('suma tres lotes del mismo nombre y unidad', () => {
    const lotes = [
      { nombre: 'Leche', cantidad: 1,   unidad: 'litros' },
      { nombre: 'Leche', cantidad: 2.5, unidad: 'litros' },
      { nombre: 'Leche', cantidad: 0.5, unidad: 'litros' },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].total).toBeCloseTo(4);
  });

  it('genera grupos separados para distintos alimentos', () => {
    const lotes = [
      { nombre: 'Arroz',   cantidad: 5, unidad: 'kilogramos' },
      { nombre: 'Frijoles', cantidad: 3, unidad: 'kilogramos' },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(2);
    const nombres = resultado.map((g) => g.nombre).sort();
    expect(nombres).toEqual(['Arroz', 'Frijoles']);
  });
});

// ---------------------------------------------------------------------------
// Misma nombre, distinta unidad → grupos separados
// ---------------------------------------------------------------------------

describe('agruparTotales — unidades distintas no se fusionan', () => {
  it('no mezcla kilogramos con litros para el mismo nombre', () => {
    const lotes = [
      { nombre: 'Aceite', cantidad: 2, unidad: 'kilogramos' },
      { nombre: 'Aceite', cantidad: 3, unidad: 'litros' },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(2);

    const enKg = resultado.find((g) => g.unidad === 'kilogramos');
    const enL  = resultado.find((g) => g.unidad === 'litros');
    expect(enKg.total).toBe(2);
    expect(enL.total).toBe(3);
  });

  it('no mezcla litros con unidades para el mismo nombre', () => {
    const lotes = [
      { nombre: 'Aceite', cantidad: 4,  unidad: 'litros' },
      { nombre: 'Aceite', cantidad: 10, unidad: 'unidades' },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Requirement 2.2 — comparación exacta de nombre (case-sensitive)
// ---------------------------------------------------------------------------

describe('agruparTotales — comparación exacta de nombre (Requirement 2.2)', () => {
  it('«Arroz» y «arroz» generan grupos distintos', () => {
    const lotes = [
      { nombre: 'Arroz', cantidad: 2, unidad: 'kilogramos' },
      { nombre: 'arroz', cantidad: 3, unidad: 'kilogramos' },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(2);

    const mayuscula = resultado.find((g) => g.nombre === 'Arroz');
    const minuscula = resultado.find((g) => g.nombre === 'arroz');
    expect(mayuscula.total).toBe(2);
    expect(minuscula.total).toBe(3);
  });

  it('«Leche» y «Leche » (con espacio) son grupos distintos', () => {
    // El nombre ya viene recortado al guardarse, pero la función no lo recorta.
    const lotes = [
      { nombre: 'Leche',   cantidad: 1, unidad: 'litros' },
      { nombre: 'Leche ',  cantidad: 2, unidad: 'litros' },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// El detalle de cada lote no se fusiona (Requirement 2.5)
// ---------------------------------------------------------------------------

describe('agruparTotales — el detalle de los lotes no cambia', () => {
  it('el arreglo de lotes original no es modificado', () => {
    const lotes = [
      { id: '1', nombre: 'Arroz', cantidad: 2, unidad: 'kilogramos', fechaVencimiento: '2026-01-01' },
      { id: '2', nombre: 'Arroz', cantidad: 3, unidad: 'kilogramos', fechaVencimiento: '2026-02-01' },
    ];
    agruparTotales(lotes);

    // Cada lote mantiene su cantidad original
    expect(lotes[0].cantidad).toBe(2);
    expect(lotes[1].cantidad).toBe(3);
    // Hay dos lotes, no se fusionaron en uno
    expect(lotes).toHaveLength(2);
  });

  it('devuelve un arreglo nuevo y no el original', () => {
    const lotes = [{ nombre: 'Pasta', cantidad: 1, unidad: 'kilogramos' }];
    const resultado = agruparTotales(lotes);
    expect(resultado).not.toBe(lotes);
  });
});

// ---------------------------------------------------------------------------
// Combinación: varios alimentos y varias unidades
// ---------------------------------------------------------------------------

describe('agruparTotales — combinación compleja', () => {
  it('produce los grupos correctos en un escenario mixto', () => {
    const lotes = [
      { nombre: 'Arroz',    cantidad: 2,   unidad: 'kilogramos' },
      { nombre: 'Arroz',    cantidad: 1.5, unidad: 'kilogramos' },
      { nombre: 'Aceite',   cantidad: 2,   unidad: 'litros'     },
      { nombre: 'Aceite',   cantidad: 1,   unidad: 'kilogramos' },
      { nombre: 'Galletas', cantidad: 5,   unidad: 'unidades'   },
    ];
    const resultado = agruparTotales(lotes);
    expect(resultado).toHaveLength(4);

    const arrozKg = resultado.find((g) => g.nombre === 'Arroz' && g.unidad === 'kilogramos');
    expect(arrozKg.total).toBeCloseTo(3.5);

    const aceiteL  = resultado.find((g) => g.nombre === 'Aceite' && g.unidad === 'litros');
    expect(aceiteL.total).toBe(2);

    const aceiteKg = resultado.find((g) => g.nombre === 'Aceite' && g.unidad === 'kilogramos');
    expect(aceiteKg.total).toBe(1);

    const galletas = resultado.find((g) => g.nombre === 'Galletas');
    expect(galletas.total).toBe(5);
  });
});
