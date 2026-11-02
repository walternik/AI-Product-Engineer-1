/**
 * Pruebas de almacenamientoLocal.js
 *
 * Las pruebas corren en Node (entorno por defecto de Vitest), donde
 * window.localStorage no existe. Se simula con vi.stubGlobal o con un
 * objeto manual según cada caso.
 *
 * Requirements: 5.1, 5.4, 5.5, 5.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { leer, guardar } from './almacenamientoLocal.js';

// ---------------------------------------------------------------------------
// Helpers para construir un localStorage simulado
// ---------------------------------------------------------------------------

/**
 * Crea un objeto que se comporta como localStorage (Map en memoria).
 */
function crearAlmacenSimulado() {
  const store = new Map();
  return {
    getItem: (clave) => (store.has(clave) ? store.get(clave) : null),
    setItem: (clave, valor) => store.set(clave, valor),
    removeItem: (clave) => store.delete(clave),
    clear: () => store.clear(),
    _store: store, // acceso interno para las aserciones
  };
}

const CLAVE = 'manos-a-la-obra.lotes';

// ---------------------------------------------------------------------------
// Configuración por defecto: instalar un almacén limpio antes de cada prueba
// ---------------------------------------------------------------------------

let almacenSimulado;

beforeEach(() => {
  almacenSimulado = crearAlmacenSimulado();
  vi.stubGlobal('window', { localStorage: almacenSimulado });
});

// ---------------------------------------------------------------------------
// leer()
// ---------------------------------------------------------------------------

describe('leer()', () => {
  it('devuelve ausencia cuando la clave no existe', () => {
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'ausencia' });
  });

  it('devuelve ok con el arreglo cuando el JSON es válido y es un arreglo', () => {
    const lotes = [
      {
        id: 'a1',
        nombre: 'Arroz',
        cantidad: 2,
        unidad: 'kilogramos',
        fechaRecepcion: '2025-01-10',
        fechaVencimiento: '2026-01-10',
      },
    ];
    almacenSimulado.setItem(CLAVE, JSON.stringify(lotes));

    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'ok', lotes });
  });

  it('devuelve ok con arreglo vacío cuando el valor es []', () => {
    almacenSimulado.setItem(CLAVE, '[]');
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'ok', lotes: [] });
  });

  it('devuelve fallo-lectura cuando el JSON no se puede parsear', () => {
    almacenSimulado.setItem(CLAVE, 'esto-no-es-json{{{');
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando el valor guardado no es un arreglo (objeto)', () => {
    almacenSimulado.setItem(CLAVE, JSON.stringify({ lotes: [] }));
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando el valor guardado no es un arreglo (número)', () => {
    almacenSimulado.setItem(CLAVE, '42');
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando el valor guardado no es un arreglo (null JSON)', () => {
    almacenSimulado.setItem(CLAVE, 'null');
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando window.localStorage lanza SecurityError al accederse', () => {
    vi.stubGlobal('window', {
      get localStorage() {
        throw new DOMException('Acceso denegado', 'SecurityError');
      },
    });

    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando getItem lanza', () => {
    const almacenRoto = {
      getItem: () => { throw new Error('getItem roto'); },
      setItem: () => {},
    };
    vi.stubGlobal('window', { localStorage: almacenRoto });

    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('un fallo de lectura no modifica el valor ya guardado', () => {
    // Guardar un JSON corrupto
    almacenSimulado.setItem(CLAVE, 'corrupto');
    // El valor previo sigue siendo 'corrupto', no null ni reemplazado
    leer();
    expect(almacenSimulado._store.get(CLAVE)).toBe('corrupto');
  });
});

// ---------------------------------------------------------------------------
// guardar()
// ---------------------------------------------------------------------------

describe('guardar()', () => {
  it('devuelve ok y persiste el arreglo serializado', () => {
    const lotes = [
      {
        id: 'b1',
        nombre: 'Lentejas',
        cantidad: 1,
        unidad: 'kilogramos',
        fechaRecepcion: '2025-06-01',
        fechaVencimiento: '2026-06-01',
      },
    ];

    const resultado = guardar(lotes);
    expect(resultado).toEqual({ tipo: 'ok' });
    expect(almacenSimulado._store.get(CLAVE)).toBe(JSON.stringify(lotes));
  });

  it('devuelve ok y persiste un arreglo vacío', () => {
    const resultado = guardar([]);
    expect(resultado).toEqual({ tipo: 'ok' });
    expect(almacenSimulado._store.get(CLAVE)).toBe('[]');
  });

  it('devuelve fallo-escritura cuando setItem lanza', () => {
    const almacenSinEspacio = {
      getItem: () => null,
      setItem: () => { throw new DOMException('Cuota superada', 'QuotaExceededError'); },
    };
    vi.stubGlobal('window', { localStorage: almacenSinEspacio });

    const resultado = guardar([{ id: 'x' }]);
    expect(resultado).toEqual({ tipo: 'fallo-escritura' });
  });

  it('devuelve fallo-escritura cuando window.localStorage lanza al accederse', () => {
    vi.stubGlobal('window', {
      get localStorage() {
        throw new DOMException('Acceso denegado', 'SecurityError');
      },
    });

    const resultado = guardar([]);
    expect(resultado).toEqual({ tipo: 'fallo-escritura' });
  });

  it('un fallo de escritura no modifica el valor ya guardado', () => {
    // Guardar un valor válido primero
    const lotesOriginales = [{ id: 'orig', nombre: 'Fideo', cantidad: 1, unidad: 'kilogramos', fechaRecepcion: '2025-01-01', fechaVencimiento: '2026-01-01' }];
    almacenSimulado.setItem(CLAVE, JSON.stringify(lotesOriginales));
    const valorAntes = almacenSimulado._store.get(CLAVE);

    // Sustituir setItem para que falle en la siguiente llamada
    const setItemOriginal = almacenSimulado.setItem.bind(almacenSimulado);
    let primeraLlamada = true;
    almacenSimulado.setItem = (clave, valor) => {
      if (primeraLlamada) {
        primeraLlamada = false;
        throw new DOMException('Cuota superada', 'QuotaExceededError');
      }
      setItemOriginal(clave, valor);
    };

    const resultado = guardar([{ id: 'nuevo' }]);
    expect(resultado).toEqual({ tipo: 'fallo-escritura' });
    // El valor almacenado sigue siendo el original
    expect(almacenSimulado._store.get(CLAVE)).toBe(valorAntes);
  });
});

// ---------------------------------------------------------------------------
// Ciclo completo: guardar → leer
// ---------------------------------------------------------------------------

describe('ciclo guardar → leer', () => {
  it('leer después de guardar devuelve los mismos lotes', () => {
    const lotes = [
      {
        id: 'c1',
        nombre: 'Aceite',
        cantidad: 0.5,
        unidad: 'litros',
        fechaRecepcion: '2025-03-15',
        fechaVencimiento: '2025-12-31',
      },
      {
        id: 'c2',
        nombre: 'Harina',
        cantidad: 5,
        unidad: 'kilogramos',
        fechaRecepcion: '2025-04-01',
        fechaVencimiento: '2026-04-01',
      },
    ];

    guardar(lotes);
    const resultado = leer();

    expect(resultado).toEqual({ tipo: 'ok', lotes });
  });

  it('guardar dos veces reemplaza el valor anterior', () => {
    guardar([{ id: 'v1', nombre: 'Sal', cantidad: 1, unidad: 'kilogramos', fechaRecepcion: '2025-01-01', fechaVencimiento: '2026-01-01' }]);
    guardar([]);
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'ok', lotes: [] });
  });
});
