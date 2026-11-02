/**
 * Pruebas del servicio de lotes para Manos a la Obra.
 *
 * Corren en Node (entorno por defecto de Vitest).
 * Se simulan window.localStorage y crypto.randomUUID con vi.stubGlobal.
 *
 * Requirements: 1.2, 1.3, 4.1, 4.2, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { obtenerLotes, guardarLote, actualizarLote, eliminarLote } from './lotes.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLAVE = 'manos-a-la-obra.lotes';

function crearAlmacenSimulado(valorInicial = null) {
  const store = new Map();
  if (valorInicial !== null) {
    store.set(CLAVE, valorInicial);
  }
  return {
    getItem: (clave) => (store.has(clave) ? store.get(clave) : null),
    setItem: (clave, valor) => store.set(clave, valor),
    removeItem: (clave) => store.delete(clave),
    clear: () => store.clear(),
    _store: store,
  };
}

/** Lote válido completo para usar en pruebas. */
const LOTE_VALIDO = {
  nombre: 'Arroz',
  cantidad: 2,
  unidad: 'kilogramos',
  fechaRecepcion: '2026-01-10',
  fechaVencimiento: '2026-12-31',
};

/** Lote guardado (con id) para usar como estado inicial. */
const LOTE_GUARDADO = {
  id: 'uuid-existente',
  nombre: 'Arroz',
  cantidad: 2,
  unidad: 'kilogramos',
  fechaRecepcion: '2026-01-10',
  fechaVencimiento: '2026-12-31',
};

let almacen;

beforeEach(() => {
  // Almacén limpio (sin clave).
  almacen = crearAlmacenSimulado();
  vi.stubGlobal('window', { localStorage: almacen });
  // UUID predecible para las pruebas.
  vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('uuid-nuevo') });
});

// ---------------------------------------------------------------------------
// Semilla — lotesDeDemostracion
// ---------------------------------------------------------------------------

describe('lotesDeDemostracion()', () => {
  it('genera al menos un lote en buen estado (vence en 30 días)', async () => {
    const { lotesDeDemostracion } = await import('../data/lotesDeDemostracion.js');
    const hoy = '2026-01-01';
    const lotes = lotesDeDemostracion(hoy);
    // Buen estado: vence después de hoy+7
    const enBuenEstado = lotes.filter((l) => l.fechaVencimiento > '2026-01-08');
    expect(enBuenEstado.length).toBeGreaterThanOrEqual(1);
  });

  it('genera al menos un lote vencido (vence antes de hoy)', async () => {
    const { lotesDeDemostracion } = await import('../data/lotesDeDemostracion.js');
    const hoy = '2026-01-01';
    const lotes = lotesDeDemostracion(hoy);
    const vencidos = lotes.filter((l) => l.fechaVencimiento < hoy);
    expect(vencidos.length).toBeGreaterThanOrEqual(1);
  });

  it('genera al menos un lote próximo a vencer (vence hoy o en los próximos 7 días)', async () => {
    const { lotesDeDemostracion } = await import('../data/lotesDeDemostracion.js');
    const hoy = '2026-01-01';
    const lotes = lotesDeDemostracion(hoy);
    const proximos = lotes.filter(
      (l) => l.fechaVencimiento >= hoy && l.fechaVencimiento <= '2026-01-08'
    );
    expect(proximos.length).toBeGreaterThanOrEqual(1);
  });

  it('genera dos lotes del mismo nombre y unidad', async () => {
    const { lotesDeDemostracion } = await import('../data/lotesDeDemostracion.js');
    const hoy = '2026-01-01';
    const lotes = lotesDeDemostracion(hoy);
    const grupos = new Map();
    for (const l of lotes) {
      const clave = `${l.nombre}|${l.unidad}`;
      grupos.set(clave, (grupos.get(clave) ?? 0) + 1);
    }
    const algunDuplicado = [...grupos.values()].some((n) => n >= 2);
    expect(algunDuplicado).toBe(true);
  });

  it('incluye al menos una unidad que no es kilogramos', async () => {
    const { lotesDeDemostracion } = await import('../data/lotesDeDemostracion.js');
    const hoy = '2026-01-01';
    const lotes = lotesDeDemostracion(hoy);
    const noKg = lotes.filter((l) => l.unidad !== 'kilogramos');
    expect(noKg.length).toBeGreaterThanOrEqual(1);
  });

  it('las fechas son relativas al hoy recibido, no a una fecha fija', async () => {
    const { lotesDeDemostracion } = await import('../data/lotesDeDemostracion.js');
    const hoy1 = '2026-01-01';
    const hoy2 = '2030-06-15';
    const lotes1 = lotesDeDemostracion(hoy1);
    const lotes2 = lotesDeDemostracion(hoy2);
    // Al menos una fecha de vencimiento difiere
    expect(lotes1[0].fechaVencimiento).not.toBe(lotes2[0].fechaVencimiento);
  });
});

// ---------------------------------------------------------------------------
// obtenerLotes()
// ---------------------------------------------------------------------------

describe('obtenerLotes()', () => {
  it('cuando la clave no existe, siembra y devuelve los tres estados', () => {
    const resultado = obtenerLotes();
    expect(resultado.tipo).toBe('ok');
    expect(resultado.lotes.length).toBeGreaterThan(0);

    // La semilla debe haberse guardado
    expect(almacen._store.has(CLAVE)).toBe(true);
  });

  it('cuando la clave no existe, la semilla guardada coincide con los lotes devueltos', () => {
    const resultado = obtenerLotes();
    const almacenado = JSON.parse(almacen._store.get(CLAVE));
    expect(almacenado).toEqual(resultado.lotes);
  });

  it('cuando la clave existe con lotes, los devuelve sin reemplazar', () => {
    const lotes = [LOTE_GUARDADO];
    almacen.setItem(CLAVE, JSON.stringify(lotes));

    const resultado = obtenerLotes();
    expect(resultado).toEqual({ tipo: 'ok', lotes });
  });

  it('cuando la clave existe con [] (lista vacía), la respeta y no siembra', () => {
    almacen.setItem(CLAVE, '[]');

    const resultado = obtenerLotes();
    expect(resultado).toEqual({ tipo: 'ok', lotes: [] });
    // El valor almacenado sigue siendo [] y no fue reemplazado por la semilla
    expect(almacen._store.get(CLAVE)).toBe('[]');
  });

  it('cuando el JSON es ilegible, devuelve fallo-lectura y no modifica el almacenamiento', () => {
    almacen.setItem(CLAVE, 'corrupto{{{');
    const valorAntes = almacen._store.get(CLAVE);

    const resultado = obtenerLotes();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('cuando el valor guardado no es un arreglo, devuelve fallo-lectura', () => {
    almacen.setItem(CLAVE, JSON.stringify({ lotes: [] }));

    const resultado = obtenerLotes();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('cuando setItem lanza al sembrar, devuelve ok con la semilla de todas formas', () => {
    // setItem falla → la semilla no queda guardada, pero se devuelve igual
    almacen.setItem = () => { throw new DOMException('Cuota', 'QuotaExceededError'); };

    const resultado = obtenerLotes();
    expect(resultado.tipo).toBe('ok');
    expect(resultado.lotes.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// guardarLote()
// ---------------------------------------------------------------------------

describe('guardarLote()', () => {
  it('con entrada válida, devuelve ok con el lote en la lista', () => {
    almacen.setItem(CLAVE, '[]');
    const resultado = guardarLote(LOTE_VALIDO);

    expect(resultado.tipo).toBe('ok');
    expect(resultado.lotes).toHaveLength(1);
    expect(resultado.lotes[0].nombre).toBe('Arroz');
    expect(resultado.lotes[0].id).toBe('uuid-nuevo');
  });

  it('asigna un id al lote creado', () => {
    almacen.setItem(CLAVE, '[]');
    const resultado = guardarLote(LOTE_VALIDO);

    expect(resultado.lotes[0].id).toBeDefined();
    expect(typeof resultado.lotes[0].id).toBe('string');
  });

  it('completa fechaRecepcion con el día local cuando viene vacía', () => {
    almacen.setItem(CLAVE, '[]');
    // Fijar la fecha inyectando Date simulada
    const fechaFija = new Date(2026, 0, 15); // 2026-01-15 local
    vi.setSystemTime(fechaFija);

    const resultado = guardarLote({ ...LOTE_VALIDO, fechaRecepcion: '' });
    expect(resultado.lotes[0].fechaRecepcion).toBe('2026-01-15');

    vi.useRealTimers();
  });

  it('completa fechaRecepcion cuando viene null', () => {
    almacen.setItem(CLAVE, '[]');
    const fechaFija = new Date(2026, 2, 5); // 2026-03-05 local
    vi.setSystemTime(fechaFija);

    const resultado = guardarLote({ ...LOTE_VALIDO, fechaRecepcion: null });
    expect(resultado.lotes[0].fechaRecepcion).toBe('2026-03-05');

    vi.useRealTimers();
  });

  it('respeta la fechaRecepcion cuando se proporciona', () => {
    almacen.setItem(CLAVE, '[]');
    const resultado = guardarLote({ ...LOTE_VALIDO, fechaRecepcion: '2025-11-20' });
    expect(resultado.lotes[0].fechaRecepcion).toBe('2025-11-20');
  });

  it('recorta espacios del nombre', () => {
    almacen.setItem(CLAVE, '[]');
    const resultado = guardarLote({ ...LOTE_VALIDO, nombre: '  Arroz  ' });
    expect(resultado.lotes[0].nombre).toBe('Arroz');
  });

  it('agrega el lote a la lista existente, conservando los anteriores', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));
    const resultado = guardarLote(LOTE_VALIDO);

    expect(resultado.lotes).toHaveLength(2);
    expect(resultado.lotes[0].id).toBe('uuid-existente');
    expect(resultado.lotes[1].id).toBe('uuid-nuevo');
  });

  it('con nombre vacío, devuelve fallo-validacion y no escribe', () => {
    almacen.setItem(CLAVE, '[]');
    const valorAntes = almacen._store.get(CLAVE);

    const resultado = guardarLote({ ...LOTE_VALIDO, nombre: '' });

    expect(resultado.tipo).toBe('fallo-validacion');
    expect(resultado.errores.nombre).toBeDefined();
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('con cantidad negativa, devuelve fallo-validacion y no escribe', () => {
    almacen.setItem(CLAVE, '[]');
    const valorAntes = almacen._store.get(CLAVE);

    const resultado = guardarLote({ ...LOTE_VALIDO, cantidad: -1 });

    expect(resultado.tipo).toBe('fallo-validacion');
    expect(resultado.errores.cantidad).toBeDefined();
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('con unidad inválida, devuelve fallo-validacion y no escribe', () => {
    almacen.setItem(CLAVE, '[]');
    const valorAntes = almacen._store.get(CLAVE);

    const resultado = guardarLote({ ...LOTE_VALIDO, unidad: 'cajas' });

    expect(resultado.tipo).toBe('fallo-validacion');
    expect(resultado.errores.unidad).toBeDefined();
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('sin fechaVencimiento, devuelve fallo-validacion y no escribe', () => {
    almacen.setItem(CLAVE, '[]');
    const valorAntes = almacen._store.get(CLAVE);

    const resultado = guardarLote({ ...LOTE_VALIDO, fechaVencimiento: '' });

    expect(resultado.tipo).toBe('fallo-validacion');
    expect(resultado.errores.fechaVencimiento).toBeDefined();
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('cuando setItem lanza, devuelve fallo-escritura y el almacenamiento queda igual', () => {
    const lotesPrevios = [LOTE_GUARDADO];
    almacen.setItem(CLAVE, JSON.stringify(lotesPrevios));
    const valorAntes = almacen._store.get(CLAVE);

    // Hacer que setItem falle en la siguiente llamada
    let llamadas = 0;
    const setItemOriginal = almacen.setItem.bind(almacen);
    almacen.setItem = (clave, valor) => {
      llamadas++;
      throw new DOMException('Cuota', 'QuotaExceededError');
    };

    const resultado = guardarLote(LOTE_VALIDO);

    expect(resultado.tipo).toBe('fallo-escritura');
    // El valor previo no debe haber cambiado
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('una lectura fresca después de guardar devuelve el mismo lote', () => {
    almacen.setItem(CLAVE, '[]');
    const guardado = guardarLote(LOTE_VALIDO);

    // Leer directamente del almacén simulado
    const almacenado = JSON.parse(almacen._store.get(CLAVE));
    expect(almacenado).toEqual(guardado.lotes);
  });
});

// ---------------------------------------------------------------------------
// actualizarLote()
// ---------------------------------------------------------------------------

describe('actualizarLote()', () => {
  it('con datos válidos y id existente, reemplaza el lote y devuelve ok', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));

    const cambios = { ...LOTE_VALIDO, nombre: 'Arroz Integral', cantidad: 3 };
    const resultado = actualizarLote('uuid-existente', cambios);

    expect(resultado.tipo).toBe('ok');
    expect(resultado.lotes).toHaveLength(1);
    expect(resultado.lotes[0].nombre).toBe('Arroz Integral');
    expect(resultado.lotes[0].cantidad).toBe(3);
    expect(resultado.lotes[0].id).toBe('uuid-existente');
  });

  it('conserva el id original del lote actualizado', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));

    const resultado = actualizarLote('uuid-existente', LOTE_VALIDO);
    expect(resultado.lotes[0].id).toBe('uuid-existente');
  });

  it('recorta espacios del nombre al actualizar', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));

    const resultado = actualizarLote('uuid-existente', { ...LOTE_VALIDO, nombre: '  Fideo  ' });
    expect(resultado.lotes[0].nombre).toBe('Fideo');
  });

  it('con datos inválidos, devuelve fallo-validacion y no escribe', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));
    const valorAntes = almacen._store.get(CLAVE);

    const resultado = actualizarLote('uuid-existente', { ...LOTE_VALIDO, cantidad: -5 });

    expect(resultado.tipo).toBe('fallo-validacion');
    expect(resultado.errores.cantidad).toBeDefined();
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('con id inexistente, devuelve no-encontrado y no escribe', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));
    const valorAntes = almacen._store.get(CLAVE);

    const resultado = actualizarLote('uuid-que-no-existe', LOTE_VALIDO);

    expect(resultado.tipo).toBe('no-encontrado');
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('cuando setItem lanza, devuelve fallo-escritura y el almacenamiento queda igual', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));
    const valorAntes = almacen._store.get(CLAVE);

    almacen.setItem = () => {
      throw new DOMException('Cuota', 'QuotaExceededError');
    };

    const resultado = actualizarLote('uuid-existente', LOTE_VALIDO);

    expect(resultado.tipo).toBe('fallo-escritura');
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('solo reemplaza el lote indicado, no los demás', () => {
    const otroLote = {
      id: 'uuid-otro',
      nombre: 'Sal',
      cantidad: 1,
      unidad: 'kilogramos',
      fechaRecepcion: '2026-01-01',
      fechaVencimiento: '2027-01-01',
    };
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO, otroLote]));

    const resultado = actualizarLote('uuid-existente', { ...LOTE_VALIDO, nombre: 'Arroz Blanco' });

    expect(resultado.lotes).toHaveLength(2);
    expect(resultado.lotes[0].nombre).toBe('Arroz Blanco');
    expect(resultado.lotes[1].nombre).toBe('Sal');
  });

  it('una lectura fresca después de actualizar refleja el cambio', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));
    const actualizado = actualizarLote('uuid-existente', { ...LOTE_VALIDO, nombre: 'Arroz Premium' });

    const almacenado = JSON.parse(almacen._store.get(CLAVE));
    expect(almacenado).toEqual(actualizado.lotes);
  });
});

// ---------------------------------------------------------------------------
// eliminarLote()
// ---------------------------------------------------------------------------

describe('eliminarLote()', () => {
  it('elimina el lote indicado y devuelve ok con la lista restante', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));

    const resultado = eliminarLote('uuid-existente');

    expect(resultado.tipo).toBe('ok');
    expect(resultado.lotes).toHaveLength(0);
  });

  it('conserva los demás lotes al eliminar uno', () => {
    const otroLote = {
      id: 'uuid-otro',
      nombre: 'Sal',
      cantidad: 1,
      unidad: 'kilogramos',
      fechaRecepcion: '2026-01-01',
      fechaVencimiento: '2027-01-01',
    };
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO, otroLote]));

    const resultado = eliminarLote('uuid-existente');

    expect(resultado.lotes).toHaveLength(1);
    expect(resultado.lotes[0].id).toBe('uuid-otro');
  });

  it('eliminar un id inexistente devuelve ok con la lista intacta', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));

    const resultado = eliminarLote('uuid-que-no-existe');

    expect(resultado.tipo).toBe('ok');
    expect(resultado.lotes).toHaveLength(1);
  });

  it('cuando setItem lanza, devuelve fallo-escritura y el almacenamiento queda igual', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));
    const valorAntes = almacen._store.get(CLAVE);

    almacen.setItem = () => {
      throw new DOMException('Cuota', 'QuotaExceededError');
    };

    const resultado = eliminarLote('uuid-existente');

    expect(resultado.tipo).toBe('fallo-escritura');
    expect(almacen._store.get(CLAVE)).toBe(valorAntes);
  });

  it('una lectura fresca después de eliminar ya no incluye el lote', () => {
    almacen.setItem(CLAVE, JSON.stringify([LOTE_GUARDADO]));
    eliminarLote('uuid-existente');

    const almacenado = JSON.parse(almacen._store.get(CLAVE));
    expect(almacenado).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Ciclo completo: crear → leer → actualizar → leer → eliminar → leer
// ---------------------------------------------------------------------------

describe('ciclo completo', () => {
  it('crear, corregir y eliminar: una lectura fresca refleja cada cambio', () => {
    // 1. Empezar vacío
    almacen.setItem(CLAVE, '[]');

    // 2. Crear
    const creado = guardarLote(LOTE_VALIDO);
    expect(creado.tipo).toBe('ok');
    const id = creado.lotes[0].id;
    expect(JSON.parse(almacen._store.get(CLAVE))).toEqual(creado.lotes);

    // 3. Actualizar
    const actualizado = actualizarLote(id, { ...LOTE_VALIDO, cantidad: 10 });
    expect(actualizado.tipo).toBe('ok');
    expect(actualizado.lotes[0].cantidad).toBe(10);
    expect(JSON.parse(almacen._store.get(CLAVE))).toEqual(actualizado.lotes);

    // 4. Eliminar
    const eliminado = eliminarLote(id);
    expect(eliminado.tipo).toBe('ok');
    expect(eliminado.lotes).toHaveLength(0);
    expect(JSON.parse(almacen._store.get(CLAVE))).toEqual([]);
  });
});
