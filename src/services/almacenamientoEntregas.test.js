/**
 * Pruebas de almacenamientoEntregas.js
 *
 * Las pruebas corren en Node (entorno por defecto de Vitest), donde
 * window.localStorage no existe. Se simula con vi.stubGlobal según cada caso.
 *
 * Requirements: 4.1, 4.3, 4.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { leer, guardar } from './almacenamientoEntregas.js';

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

const CLAVE_ENTREGAS = 'manos-a-la-obra.entregas';
const CLAVE_LOTES = 'manos-a-la-obra.lotes';

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
    const entregas = [
      {
        id: 'e1',
        loteId: 'l1',
        familia: 'Familia García',
        cantidad: 2,
        unidad: 'kilogramos',
        nombreAlimento: 'Arroz',
        fechaRecepcion: '2026-01-01',
        fechaVencimiento: '2026-12-31',
        fechaEntrega: '2026-06-01',
        secuencia: 1,
      },
    ];
    almacenSimulado.setItem(CLAVE_ENTREGAS, JSON.stringify(entregas));

    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'ok', entregas });
  });

  it('devuelve ok con arreglo vacío cuando el valor es []', () => {
    almacenSimulado.setItem(CLAVE_ENTREGAS, '[]');
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'ok', entregas: [] });
  });

  it('devuelve fallo-lectura cuando el JSON no se puede parsear', () => {
    almacenSimulado.setItem(CLAVE_ENTREGAS, 'esto-no-es-json{{{');
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando el valor guardado no es un arreglo (objeto)', () => {
    almacenSimulado.setItem(CLAVE_ENTREGAS, JSON.stringify({ entregas: [] }));
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando el valor guardado no es un arreglo (número)', () => {
    almacenSimulado.setItem(CLAVE_ENTREGAS, '42');
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'fallo-lectura' });
  });

  it('devuelve fallo-lectura cuando el valor guardado no es un arreglo (null JSON)', () => {
    almacenSimulado.setItem(CLAVE_ENTREGAS, 'null');
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
    almacenSimulado.setItem(CLAVE_ENTREGAS, 'corrupto');
    leer();
    // El valor previo sigue siendo 'corrupto', no null ni reemplazado
    expect(almacenSimulado._store.get(CLAVE_ENTREGAS)).toBe('corrupto');
  });

  // Req 4.3: un fallo de lectura de entregas no debe tocar los lotes
  it('no modifica la clave de lotes cuando la lectura de entregas falla', () => {
    const lotesGuardados = JSON.stringify([{ id: 'l1', nombre: 'Arroz' }]);
    almacenSimulado.setItem(CLAVE_LOTES, lotesGuardados);
    almacenSimulado.setItem(CLAVE_ENTREGAS, 'no-es-json');

    leer();

    expect(almacenSimulado._store.get(CLAVE_LOTES)).toBe(lotesGuardados);
  });

  // Req 4.5: cada almacén es independiente — la clave de lotes no interfiere
  it('no lee ni escribe la clave de lotes bajo ninguna circunstancia', () => {
    almacenSimulado.setItem(CLAVE_LOTES, JSON.stringify([{ id: 'lx' }]));

    const resultado = leer();

    // La clave de entregas sigue ausente
    expect(resultado).toEqual({ tipo: 'ausencia' });
    // La clave de lotes no fue tocada
    expect(almacenSimulado._store.get(CLAVE_LOTES)).toBe(JSON.stringify([{ id: 'lx' }]));
  });
});

// ---------------------------------------------------------------------------
// guardar()
// ---------------------------------------------------------------------------

describe('guardar()', () => {
  it('devuelve ok y persiste el arreglo serializado', () => {
    const entregas = [
      {
        id: 'e2',
        loteId: 'l2',
        familia: 'Familia López',
        cantidad: 1.5,
        unidad: 'kilogramos',
        nombreAlimento: 'Lentejas',
        fechaRecepcion: '2026-02-01',
        fechaVencimiento: '2026-08-01',
        fechaEntrega: '2026-03-10',
        secuencia: 2,
      },
    ];

    const resultado = guardar(entregas);
    expect(resultado).toEqual({ tipo: 'ok' });
    expect(almacenSimulado._store.get(CLAVE_ENTREGAS)).toBe(JSON.stringify(entregas));
  });

  it('devuelve ok y persiste un arreglo vacío', () => {
    const resultado = guardar([]);
    expect(resultado).toEqual({ tipo: 'ok' });
    expect(almacenSimulado._store.get(CLAVE_ENTREGAS)).toBe('[]');
  });

  it('devuelve fallo-escritura cuando setItem lanza QuotaExceededError', () => {
    const almacenSinEspacio = {
      getItem: () => null,
      setItem: () => { throw new DOMException('Cuota superada', 'QuotaExceededError'); },
    };
    vi.stubGlobal('window', { localStorage: almacenSinEspacio });

    const resultado = guardar([{ id: 'e3' }]);
    expect(resultado).toEqual({ tipo: 'fallo-escritura' });
  });

  it('devuelve fallo-escritura cuando window.localStorage lanza SecurityError al accederse', () => {
    vi.stubGlobal('window', {
      get localStorage() {
        throw new DOMException('Acceso denegado', 'SecurityError');
      },
    });

    const resultado = guardar([]);
    expect(resultado).toEqual({ tipo: 'fallo-escritura' });
  });

  it('un fallo de escritura no modifica el valor ya guardado', () => {
    const entregasOriginales = [
      {
        id: 'e-orig',
        loteId: 'l-orig',
        familia: 'Familia Ruiz',
        cantidad: 1,
        unidad: 'unidades',
        nombreAlimento: 'Pan',
        fechaRecepcion: '2026-01-01',
        fechaVencimiento: '2026-01-15',
        fechaEntrega: '2026-01-10',
        secuencia: 1,
      },
    ];
    almacenSimulado.setItem(CLAVE_ENTREGAS, JSON.stringify(entregasOriginales));
    const valorAntes = almacenSimulado._store.get(CLAVE_ENTREGAS);

    // Hacer que el siguiente setItem falle
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
    expect(almacenSimulado._store.get(CLAVE_ENTREGAS)).toBe(valorAntes);
  });

  // Req 4.5: guardar entregas no debe tocar la clave de lotes
  it('no modifica la clave de lotes al guardar entregas', () => {
    const lotesGuardados = JSON.stringify([{ id: 'lA', nombre: 'Fideos' }]);
    almacenSimulado.setItem(CLAVE_LOTES, lotesGuardados);

    guardar([{ id: 'eA', familia: 'Familia Test' }]);

    expect(almacenSimulado._store.get(CLAVE_LOTES)).toBe(lotesGuardados);
  });
});

// ---------------------------------------------------------------------------
// Ciclo completo: guardar → leer
// ---------------------------------------------------------------------------

describe('ciclo guardar → leer', () => {
  it('leer después de guardar devuelve las mismas entregas', () => {
    const entregas = [
      {
        id: 'c1',
        loteId: 'lc1',
        familia: 'Familia Martínez',
        cantidad: 0.5,
        unidad: 'litros',
        nombreAlimento: 'Aceite',
        fechaRecepcion: '2026-03-15',
        fechaVencimiento: '2026-12-31',
        fechaEntrega: '2026-04-01',
        secuencia: 1,
      },
      {
        id: 'c2',
        loteId: 'lc2',
        familia: 'Familia Sosa',
        cantidad: 5,
        unidad: 'kilogramos',
        nombreAlimento: 'Harina',
        fechaRecepcion: '2026-04-01',
        fechaVencimiento: '2027-04-01',
        fechaEntrega: '2026-04-02',
        secuencia: 2,
      },
    ];

    guardar(entregas);
    const resultado = leer();

    expect(resultado).toEqual({ tipo: 'ok', entregas });
  });

  it('guardar dos veces reemplaza el valor anterior', () => {
    guardar([
      {
        id: 'v1',
        loteId: 'lv1',
        familia: 'Familia Pérez',
        cantidad: 1,
        unidad: 'kilogramos',
        nombreAlimento: 'Sal',
        fechaRecepcion: '2026-01-01',
        fechaVencimiento: '2027-01-01',
        fechaEntrega: '2026-01-10',
        secuencia: 1,
      },
    ]);
    guardar([]);
    const resultado = leer();
    expect(resultado).toEqual({ tipo: 'ok', entregas: [] });
  });

  // Req 4.1: lo guardado se puede volver a leer igual
  it('las entregas guardadas se recuperan fielmente tras una recarga simulada', () => {
    const entregas = [
      {
        id: 'r1',
        loteId: 'lr1',
        familia: 'Familia Herrera',
        cantidad: 3,
        unidad: 'unidades',
        nombreAlimento: 'Latas de tomate',
        fechaRecepcion: '2026-05-01',
        fechaVencimiento: '2027-05-01',
        fechaEntrega: '2026-05-15',
        secuencia: 1,
      },
    ];

    guardar(entregas);

    // Simular recarga: crear un módulo nuevo que lea la misma clave simulada
    // (el almacén simulado persiste en memoria durante la prueba)
    const { entregas: recuperadas } = leer();
    expect(recuperadas).toEqual(entregas);
  });
});
