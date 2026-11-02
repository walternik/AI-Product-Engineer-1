/**
 * Tests para src/utils/validarLote.js
 *
 * Valida: Requirements 1.4, 1.5, 1.6, 4.2
 *
 * Estrategia (del diseño):
 * - Un lote completamente válido devuelve { valido: true, errores: {} }.
 * - Cada campo inválido produce exactamente un mensaje en español en `errores`.
 * - Cuando hay errores, `valido` es false → el lote no puede usarse.
 * - La fecha de recepción vacía (alta) es válida; no vacía debe ser real.
 * - La fecha de vencimiento es siempre obligatoria y debe ser un día real.
 * - Decimales aceptados en kilogramos y litros (hasta 3), rechazados en unidades.
 * - Más de tres decimales → error aunque la unidad los admita.
 * - La unidad solo puede ser 'kilogramos', 'litros' o 'unidades'.
 */

import { describe, it, expect } from 'vitest';
import { validarLote } from './validarLote.js';

// ---------------------------------------------------------------------------
// Fixture de entrada válida base
// ---------------------------------------------------------------------------

/** Devuelve un lote válido con recepción explícita (modo corrección). */
function loteValido(overrides = {}) {
  return {
    nombre: 'Arroz',
    cantidad: 2.5,
    unidad: 'kilogramos',
    fechaRecepcion: '2026-01-15',
    fechaVencimiento: '2026-06-30',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Requirement 1.4 — lote completamente válido
// ---------------------------------------------------------------------------

describe('validarLote — lote válido (Requirement 1.4)', () => {
  it('devuelve valido:true y errores vacío para un lote correcto', () => {
    const resultado = validarLote(loteValido());
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual({});
  });

  it('acepta recepción vacía en el alta (Requirement 1.4)', () => {
    const resultado = validarLote(loteValido({ fechaRecepcion: '' }));
    expect(resultado.valido).toBe(true);
  });

  it('acepta recepción null (alta)', () => {
    const resultado = validarLote(loteValido({ fechaRecepcion: null }));
    expect(resultado.valido).toBe(true);
  });

  it('acepta recepción undefined (alta)', () => {
    const resultado = validarLote(loteValido({ fechaRecepcion: undefined }));
    expect(resultado.valido).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.4 — nombre
// ---------------------------------------------------------------------------

describe('validarLote — nombre (Requirement 1.4)', () => {
  it('rechaza nombre vacío con mensaje en español', () => {
    const { valido, errores } = validarLote(loteValido({ nombre: '' }));
    expect(valido).toBe(false);
    expect(errores.nombre).toBeTruthy();
  });

  it('rechaza nombre de solo espacios (tras recortar queda vacío)', () => {
    const { valido, errores } = validarLote(loteValido({ nombre: '   ' }));
    expect(valido).toBe(false);
    expect(errores.nombre).toBeTruthy();
  });

  it('rechaza nombre de 81 caracteres', () => {
    const { valido, errores } = validarLote(
      loteValido({ nombre: 'a'.repeat(81) })
    );
    expect(valido).toBe(false);
    expect(errores.nombre).toBeTruthy();
  });

  it('acepta nombre de exactamente 80 caracteres', () => {
    const { valido, errores } = validarLote(
      loteValido({ nombre: 'a'.repeat(80) })
    );
    expect(valido).toBe(true);
    expect(errores.nombre).toBeUndefined();
  });

  it('acepta nombre de 1 carácter', () => {
    const { valido, errores } = validarLote(loteValido({ nombre: 'X' }));
    expect(valido).toBe(true);
    expect(errores.nombre).toBeUndefined();
  });

  it('acepta nombre que requiere recorte de espacios perimetrales', () => {
    const { valido, errores } = validarLote(loteValido({ nombre: '  Maíz  ' }));
    expect(valido).toBe(true);
    expect(errores.nombre).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.4 — cantidad negativa o cero
// ---------------------------------------------------------------------------

describe('validarLote — cantidad (Requirement 1.4)', () => {
  it('rechaza cantidad cero', () => {
    const { valido, errores } = validarLote(loteValido({ cantidad: 0 }));
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza cantidad negativa', () => {
    const { valido, errores } = validarLote(loteValido({ cantidad: -1 }));
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza NaN', () => {
    const { valido, errores } = validarLote(loteValido({ cantidad: NaN }));
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza Infinity', () => {
    const { valido, errores } = validarLote(loteValido({ cantidad: Infinity }));
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('acepta cantidad entera positiva', () => {
    const { valido, errores } = validarLote(loteValido({ cantidad: 10 }));
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.5 — decimales en kilogramos y litros
// ---------------------------------------------------------------------------

describe('validarLote — decimales en kilogramos y litros (Requirement 1.5)', () => {
  it('acepta un decimal en kilogramos', () => {
    const { valido, errores } = validarLote(
      loteValido({ cantidad: 1.5, unidad: 'kilogramos' })
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('acepta dos decimales en litros', () => {
    const { valido, errores } = validarLote(
      loteValido({ cantidad: 1.25, unidad: 'litros' })
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('acepta exactamente tres decimales en kilogramos', () => {
    const { valido, errores } = validarLote(
      loteValido({ cantidad: 1.125, unidad: 'kilogramos' })
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });

  it('rechaza cuatro decimales en kilogramos', () => {
    const { valido, errores } = validarLote(
      loteValido({ cantidad: 1.1234, unidad: 'kilogramos' })
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza cuatro decimales en litros', () => {
    const { valido, errores } = validarLote(
      loteValido({ cantidad: 0.1234, unidad: 'litros' })
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('rechaza decimales en unidades', () => {
    const { valido, errores } = validarLote(
      loteValido({ cantidad: 2.5, unidad: 'unidades' })
    );
    expect(valido).toBe(false);
    expect(errores.cantidad).toBeTruthy();
  });

  it('acepta entero en unidades', () => {
    const { valido, errores } = validarLote(
      loteValido({ cantidad: 3, unidad: 'unidades' })
    );
    expect(valido).toBe(true);
    expect(errores.cantidad).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.6 — unidad solo puede ser kilogramos, litros o unidades
// ---------------------------------------------------------------------------

describe('validarLote — unidad (Requirement 1.6)', () => {
  it('rechaza unidad desconocida con mensaje en español', () => {
    const { valido, errores } = validarLote(loteValido({ unidad: 'gramos' }));
    expect(valido).toBe(false);
    expect(errores.unidad).toBeTruthy();
  });

  it('rechaza unidad vacía', () => {
    const { valido, errores } = validarLote(loteValido({ unidad: '' }));
    expect(valido).toBe(false);
    expect(errores.unidad).toBeTruthy();
  });

  it('rechaza unidad en mayúsculas (distingue entre mayúsculas y minúsculas)', () => {
    const { valido, errores } = validarLote(
      loteValido({ unidad: 'Kilogramos' })
    );
    expect(valido).toBe(false);
    expect(errores.unidad).toBeTruthy();
  });

  it('acepta kilogramos', () => {
    const { errores } = validarLote(loteValido({ unidad: 'kilogramos' }));
    expect(errores.unidad).toBeUndefined();
  });

  it('acepta litros', () => {
    const { errores } = validarLote(
      loteValido({ cantidad: 1, unidad: 'litros' })
    );
    expect(errores.unidad).toBeUndefined();
  });

  it('acepta unidades', () => {
    const { errores } = validarLote(
      loteValido({ cantidad: 1, unidad: 'unidades' })
    );
    expect(errores.unidad).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 1.4 — fechaVencimiento obligatoria
// ---------------------------------------------------------------------------

describe('validarLote — fechaVencimiento (Requirement 1.4)', () => {
  it('rechaza vencimiento ausente (undefined)', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaVencimiento: undefined })
    );
    expect(valido).toBe(false);
    expect(errores.fechaVencimiento).toBeTruthy();
  });

  it('rechaza vencimiento vacío', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaVencimiento: '' })
    );
    expect(valido).toBe(false);
    expect(errores.fechaVencimiento).toBeTruthy();
  });

  it('rechaza fecha imposible como 2024-02-30', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaVencimiento: '2024-02-30' })
    );
    expect(valido).toBe(false);
    expect(errores.fechaVencimiento).toBeTruthy();
  });

  it('rechaza formato incorrecto como "hoy"', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaVencimiento: 'hoy' })
    );
    expect(valido).toBe(false);
    expect(errores.fechaVencimiento).toBeTruthy();
  });

  it('acepta fecha anterior a hoy (lote ya vencido)', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaVencimiento: '2020-01-01' })
    );
    expect(valido).toBe(true);
    expect(errores.fechaVencimiento).toBeUndefined();
  });

  it('acepta fecha real futura', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaVencimiento: '2099-12-31' })
    );
    expect(valido).toBe(true);
    expect(errores.fechaVencimiento).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// fechaRecepcion — obligatoria al corregir, opcional en el alta
// ---------------------------------------------------------------------------

describe('validarLote — fechaRecepcion', () => {
  it('acepta recepción vacía en el alta (vacía = opcional)', () => {
    const { valido, errores } = validarLote(loteValido({ fechaRecepcion: '' }));
    expect(valido).toBe(true);
    expect(errores.fechaRecepcion).toBeUndefined();
  });

  it('rechaza recepción no vacía con fecha imposible', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaRecepcion: '2024-13-01' })
    );
    expect(valido).toBe(false);
    expect(errores.fechaRecepcion).toBeTruthy();
  });

  it('rechaza recepción con formato incorrecto', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaRecepcion: '01/15/2026' })
    );
    expect(valido).toBe(false);
    expect(errores.fechaRecepcion).toBeTruthy();
  });

  it('acepta recepción real explícita (modo corrección)', () => {
    const { valido, errores } = validarLote(
      loteValido({ fechaRecepcion: '2026-01-15' })
    );
    expect(valido).toBe(true);
    expect(errores.fechaRecepcion).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Requirement 4.2 — entrada inválida no produce un lote utilizable
// ---------------------------------------------------------------------------

describe('validarLote — entrada inválida no produce lote (Requirement 4.2)', () => {
  it('cuando valido es false los errores describen qué está mal', () => {
    const { valido, errores } = validarLote({
      nombre: '',
      cantidad: 0,
      unidad: 'gramos',
      fechaRecepcion: '',
      fechaVencimiento: '',
    });
    expect(valido).toBe(false);
    // Cada campo problemático tiene su propio mensaje en español.
    expect(errores.nombre).toBeTruthy();
    expect(errores.cantidad).toBeTruthy();
    expect(errores.unidad).toBeTruthy();
    expect(errores.fechaVencimiento).toBeTruthy();
  });

  it('los mensajes de error están en español', () => {
    const { errores } = validarLote({
      nombre: '',
      cantidad: -5,
      unidad: 'oz',
      fechaRecepcion: '',
      fechaVencimiento: 'bad',
    });
    // Verificamos que ningún mensaje clave esté en inglés.
    for (const mensaje of Object.values(errores)) {
      // Palabras que indicarían un mensaje en inglés.
      expect(mensaje).not.toMatch(/\b(required|invalid|must|cannot)\b/i);
    }
  });

  it('un campo inválido no contamina los demás (aislamiento)', () => {
    const { errores } = validarLote(loteValido({ nombre: '' }));
    // Solo nombre debe tener error; el resto de los campos está bien.
    expect(errores.nombre).toBeTruthy();
    expect(errores.cantidad).toBeUndefined();
    expect(errores.unidad).toBeUndefined();
    expect(errores.fechaVencimiento).toBeUndefined();
  });

  it('todos los campos inválidos a la vez devuelven valido:false', () => {
    const { valido } = validarLote({
      nombre: '',
      cantidad: -1,
      unidad: 'cajas',
      fechaRecepcion: 'no-es-fecha',
      fechaVencimiento: '2024-02-30',
    });
    expect(valido).toBe(false);
  });
});
