/**
 * Pruebas del servicio de entregas para Manos a la Obra.
 *
 * Corren en Node (entorno por defecto de Vitest).
 * Se simulan `window.localStorage` y `crypto.randomUUID` con vi.stubGlobal.
 * Las dos claves (`manos-a-la-obra.entregas` y `manos-a-la-obra.lotes`)
 * residen en el mismo almacén simulado para poder verificar la coherencia
 * entre ellas.
 *
 * Requirements: 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { obtenerEntregas, registrarEntrega, anularEntrega } from './entregas.js';

// ---------------------------------------------------------------------------
// Constantes de claves
// ---------------------------------------------------------------------------

const CLAVE_LOTES = 'manos-a-la-obra.lotes';
const CLAVE_ENTREGAS = 'manos-a-la-obra.entregas';

// ---------------------------------------------------------------------------
// Helper: almacén simulado compartido para ambas claves
// ---------------------------------------------------------------------------

function crearAlmacenSimulado() {
  const store = new Map();
  return {
    getItem: (clave) => (store.has(clave) ? store.get(clave) : null),
    setItem: (clave, valor) => store.set(clave, valor),
    removeItem: (clave) => store.delete(clave),
    clear: () => store.clear(),
    _store: store,
  };
}

// ---------------------------------------------------------------------------
// Datos de prueba reutilizables
// ---------------------------------------------------------------------------

const LOTE_KG = {
  id: 'lote-arroz',
  nombre: 'Arroz',
  cantidad: 5,
  unidad: 'kilogramos',
  fechaRecepcion: '2026-01-01',
  fechaVencimiento: '2027-06-30', // en buen estado respecto a HOY_FIJO
};

const LOTE_UNIDADES = {
  id: 'lote-lata',
  nombre: 'Conserva',
  cantidad: 10,
  unidad: 'unidades',
  fechaRecepcion: '2026-01-01',
  fechaVencimiento: '2027-12-31',
};

const LOTE_VENCIDO = {
  id: 'lote-vencido',
  nombre: 'Leche',
  cantidad: 3,
  unidad: 'litros',
  fechaRecepcion: '2025-01-01',
  fechaVencimiento: '2025-01-01', // anterior a HOY_FIJO
};

/** Fecha fija para todas las pruebas (día local fijado con vi.setSystemTime). */
const HOY_FIJO = '2026-06-15';

/** Entrada mínima válida referenciando LOTE_KG. */
const ENTRADA_VALIDA = {
  loteId: 'lote-arroz',
  familia: 'Familia García',
  cantidad: 2,
  fecha: '',
};

// ---------------------------------------------------------------------------
// Configuración de entorno
// ---------------------------------------------------------------------------

let almacen;

beforeEach(() => {
  almacen = crearAlmacenSimulado();
  vi.stubGlobal('window', { localStorage: almacen });
  vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('entrega-uuid-1') });
  // Fijar la fecha local para que fechaLocalHoy() devuelva HOY_FIJO.
  vi.setSystemTime(new Date(2026, 5, 15)); // mes 5 = junio (0-indexed)
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// obtenerEntregas()
// ---------------------------------------------------------------------------

describe('obtenerEntregas()', () => {
  it('cuando la clave no existe devuelve lista vacía', () => {
    const resultado = obtenerEntregas();
    expect(resultado).toEqual({ ok: true, entregas: [] });
  });

  it('cuando la clave no existe NO escribe una semilla', () => {
    obtenerEntregas();
    expect(almacen._store.has(CLAVE_ENTREGAS)).toBe(false);
  });

  it('cuando la clave existe con [] devuelve lista vacía', () => {
    almacen.setItem(CLAVE_ENTREGAS, '[]');
    const resultado = obtenerEntregas();
    expect(resultado).toEqual({ ok: true, entregas: [] });
  });

  it('cuando la clave existe con entregas las devuelve', () => {
    const entregaGuardada = [
      {
        id: 'e1',
        loteId: 'lote-arroz',
        familia: 'Familia Test',
        cantidad: 1,
        unidad: 'kilogramos',
        nombreAlimento: 'Arroz',
        fechaRecepcion: '2026-01-01',
        fechaVencimiento: '2027-06-30',
        fechaEntrega: '2026-06-10',
        secuencia: 1,
      },
    ];
    almacen.setItem(CLAVE_ENTREGAS, JSON.stringify(entregaGuardada));

    const resultado = obtenerEntregas();
    expect(resultado).toEqual({ ok: true, entregas: entregaGuardada });
  });

  it('cuando el JSON es ilegible devuelve error de lectura', () => {
    almacen.setItem(CLAVE_ENTREGAS, 'corrupto{{{');
    const resultado = obtenerEntregas();
    expect(resultado).toEqual({ ok: false, error: 'lectura' });
  });

  it('cuando el JSON no es un arreglo devuelve error de lectura', () => {
    almacen.setItem(CLAVE_ENTREGAS, JSON.stringify({ data: [] }));
    const resultado = obtenerEntregas();
    expect(resultado).toEqual({ ok: false, error: 'lectura' });
  });

  it('un fallo de lectura no modifica la clave de lotes (Req 4.3)', () => {
    const lotesOriginales = [LOTE_KG];
    almacen.setItem(CLAVE_LOTES, JSON.stringify(lotesOriginales));
    almacen.setItem(CLAVE_ENTREGAS, 'corrupto');

    obtenerEntregas();

    expect(almacen._store.get(CLAVE_LOTES)).toBe(JSON.stringify(lotesOriginales));
  });
});

// ---------------------------------------------------------------------------
// registrarEntrega()
// ---------------------------------------------------------------------------

describe('registrarEntrega()', () => {
  beforeEach(() => {
    // Estado inicial: un lote disponible, sin entregas.
    almacen.setItem(CLAVE_LOTES, JSON.stringify([LOTE_KG]));
    almacen.setItem(CLAVE_ENTREGAS, '[]');
  });

  // ── Éxito básico ─────────────────────────────────────────────────────────

  it('con entrada válida devuelve ok con las dos listas', () => {
    const resultado = registrarEntrega(ENTRADA_VALIDA);
    expect(resultado.ok).toBe(true);
    expect(resultado.entregas).toHaveLength(1);
    expect(resultado.lotes).toBeDefined();
  });

  it('la entrega guardada contiene los datos copiados del lote (Req 1.2, 2.4)', () => {
    const resultado = registrarEntrega(ENTRADA_VALIDA);
    const entrega = resultado.entregas[0];

    expect(entrega.id).toBe('entrega-uuid-1');
    expect(entrega.loteId).toBe(LOTE_KG.id);
    expect(entrega.familia).toBe('Familia García');
    expect(entrega.cantidad).toBe(2);
    expect(entrega.unidad).toBe(LOTE_KG.unidad);
    expect(entrega.nombreAlimento).toBe(LOTE_KG.nombre);
    expect(entrega.fechaRecepcion).toBe(LOTE_KG.fechaRecepcion);
    expect(entrega.fechaVencimiento).toBe(LOTE_KG.fechaVencimiento);
  });

  it('completa la fecha vacía con el día local (Req 1.3)', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, fecha: '' });
    expect(resultado.entregas[0].fechaEntrega).toBe(HOY_FIJO);
  });

  it('completa la fecha null con el día local (Req 1.3)', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, fecha: null });
    expect(resultado.entregas[0].fechaEntrega).toBe(HOY_FIJO);
  });

  it('completa la fecha undefined con el día local (Req 1.3)', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, fecha: undefined });
    expect(resultado.entregas[0].fechaEntrega).toBe(HOY_FIJO);
  });

  it('respeta la fecha explícita cuando es válida y no futura', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, fecha: '2026-06-01' });
    expect(resultado.entregas[0].fechaEntrega).toBe('2026-06-01');
  });

  // ── Descuento parcial y total (Req 1.7, 1.8) ─────────────────────────────

  it('descuenta la cantidad del lote en entrega parcial (Req 1.8)', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, cantidad: 2 });
    const loteRestante = resultado.lotes.find((l) => l.id === LOTE_KG.id);
    expect(loteRestante).toBeDefined();
    expect(loteRestante.cantidad).toBe(3); // 5 - 2 = 3
  });

  it('quita el lote del stock cuando la entrega agota su cantidad (Req 1.7)', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, cantidad: 5 });
    const loteAgotado = resultado.lotes.find((l) => l.id === LOTE_KG.id);
    expect(loteAgotado).toBeUndefined();
  });

  it('la entrega total conserva nombre, unidad y vencimiento del lote (Req 2.4)', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, cantidad: 5 });
    const entrega = resultado.entregas[0];
    expect(entrega.nombreAlimento).toBe(LOTE_KG.nombre);
    expect(entrega.unidad).toBe(LOTE_KG.unidad);
    expect(entrega.fechaVencimiento).toBe(LOTE_KG.fechaVencimiento);
  });

  // ── Secuencia ─────────────────────────────────────────────────────────────

  it('la primera entrega del día tiene secuencia 1', () => {
    const resultado = registrarEntrega(ENTRADA_VALIDA);
    expect(resultado.entregas[0].secuencia).toBe(1);
  });

  it('la segunda entrega del mismo día tiene secuencia mayor que la primera', () => {
    // Registrar primera entrega
    vi.mocked(crypto.randomUUID).mockReturnValueOnce('entrega-uuid-1');
    const r1 = registrarEntrega(ENTRADA_VALIDA);
    almacen.setItem(CLAVE_ENTREGAS, JSON.stringify(r1.entregas));
    almacen.setItem(CLAVE_LOTES, JSON.stringify(r1.lotes));

    // Registrar segunda entrega (stock restante = 3 kg)
    vi.mocked(crypto.randomUUID).mockReturnValueOnce('entrega-uuid-2');
    const r2 = registrarEntrega({ ...ENTRADA_VALIDA, cantidad: 1 });
    expect(r2.ok).toBe(true);
    const e2 = r2.entregas.find((e) => e.id === 'entrega-uuid-2');
    expect(e2.secuencia).toBeGreaterThan(1);
  });

  // ── Rechazo por validación (Req 1.4, 1.5) ────────────────────────────────

  it('rechaza familia vacía y no escribe (Req 1.5)', () => {
    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, familia: '' });

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.familia).toBeDefined();
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  it('rechaza cantidad cero y no escribe (Req 1.5)', () => {
    const valorAntes = almacen._store.get(CLAVE_LOTES);

    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, cantidad: 0 });

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.cantidad).toBeDefined();
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorAntes);
  });

  it('rechaza cantidad mayor que el stock y no escribe (Req 1.5)', () => {
    const valorAntes = almacen._store.get(CLAVE_LOTES);

    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, cantidad: 100 });

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.cantidad).toBeDefined();
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorAntes);
  });

  it('rechaza cantidad decimal en lote de unidades y no escribe (Req 1.5)', () => {
    almacen.setItem(CLAVE_LOTES, JSON.stringify([LOTE_UNIDADES]));

    const resultado = registrarEntrega({
      loteId: LOTE_UNIDADES.id,
      familia: 'Familia Test',
      cantidad: 1.5,
      fecha: '',
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.cantidad).toBeDefined();
  });

  it('rechaza lote vencido y no escribe (Req 1.4)', () => {
    almacen.setItem(CLAVE_LOTES, JSON.stringify([LOTE_VENCIDO]));
    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);

    const resultado = registrarEntrega({
      loteId: LOTE_VENCIDO.id,
      familia: 'Familia Test',
      cantidad: 1,
      fecha: '',
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.lote).toBeDefined();
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
  });

  it('rechaza fecha futura y no escribe', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, fecha: '2030-01-01' });

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.fecha).toBeDefined();
  });

  it('rechaza si el lote no existe', () => {
    const resultado = registrarEntrega({ ...ENTRADA_VALIDA, loteId: 'id-inexistente' });

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.lote).toBeDefined();
  });

  // ── Fallo de escritura (Req 4.4) ──────────────────────────────────────────

  it('cuando la escritura de entregas falla devuelve error escritura y no modifica nada', () => {
    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    // Hacer que la primera escritura (entregas) falle.
    const setItemOriginal = almacen.setItem.bind(almacen);
    almacen.setItem = (clave, valor) => {
      if (clave === CLAVE_ENTREGAS) {
        throw new DOMException('Cuota', 'QuotaExceededError');
      }
      setItemOriginal(clave, valor);
    };

    const resultado = registrarEntrega(ENTRADA_VALIDA);

    expect(resultado).toEqual({ ok: false, error: 'escritura' });
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  it('cuando la escritura de lotes falla restaura las entregas y devuelve error escritura (Req 4.4)', () => {
    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    // Permitir la primera escritura (entregas) y fallar en la segunda (lotes).
    let escrituras = 0;
    const setItemOriginal = almacen.setItem.bind(almacen);
    almacen.setItem = (clave, valor) => {
      if (clave === CLAVE_LOTES) {
        escrituras++;
        // Primera escritura de lotes es la "real"; la segunda sería la restauración.
        if (escrituras === 1) {
          throw new DOMException('Cuota', 'QuotaExceededError');
        }
      }
      setItemOriginal(clave, valor);
    };

    const resultado = registrarEntrega(ENTRADA_VALIDA);

    expect(resultado).toEqual({ ok: false, error: 'escritura' });
    // Las entregas deben haberse restaurado al valor anterior.
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
    // Los lotes no cambiaron porque la escritura falló.
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  // ── Fallo de lectura (Req 4.3) ────────────────────────────────────────────

  it('cuando la lectura de entregas falla devuelve error lectura y no modifica nada', () => {
    almacen.setItem(CLAVE_ENTREGAS, 'corrupto');
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    const resultado = registrarEntrega(ENTRADA_VALIDA);

    expect(resultado).toEqual({ ok: false, error: 'lectura' });
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  // ── Persistencia (Req 4.1) ────────────────────────────────────────────────

  it('una lectura fresca después de registrar devuelve la entrega guardada (Req 4.1)', () => {
    registrarEntrega(ENTRADA_VALIDA);

    const almacenadas = JSON.parse(almacen._store.get(CLAVE_ENTREGAS));
    expect(almacenadas).toHaveLength(1);
    expect(almacenadas[0].familia).toBe('Familia García');
  });

  it('una lectura fresca de lotes refleja el descuento (Req 4.1)', () => {
    registrarEntrega(ENTRADA_VALIDA); // descuenta 2 de 5

    const lotesGuardados = JSON.parse(almacen._store.get(CLAVE_LOTES));
    const lote = lotesGuardados.find((l) => l.id === LOTE_KG.id);
    expect(lote.cantidad).toBe(3);
  });

  // ── No hay semilla de entregas (Req 4.2) ──────────────────────────────────

  it('cuando la clave de entregas no existe, registrar crea la primera entrada sin semilla (Req 4.2)', () => {
    // Quitar la clave de entregas.
    almacen._store.delete(CLAVE_ENTREGAS);

    const resultado = registrarEntrega(ENTRADA_VALIDA);

    expect(resultado.ok).toBe(true);
    expect(resultado.entregas).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// anularEntrega()
// ---------------------------------------------------------------------------

describe('anularEntrega()', () => {
  /** Entrega de demostración ya guardada. */
  const ENTREGA_GUARDADA = {
    id: 'entrega-a-anular',
    loteId: LOTE_KG.id,
    familia: 'Familia García',
    cantidad: 2,
    unidad: LOTE_KG.unidad,
    nombreAlimento: LOTE_KG.nombre,
    fechaRecepcion: LOTE_KG.fechaRecepcion,
    fechaVencimiento: LOTE_KG.fechaVencimiento,
    fechaEntrega: HOY_FIJO,
    secuencia: 1,
  };

  /** Lote con cantidad reducida (después de la entrega parcial: 5 - 2 = 3). */
  const LOTE_REDUCIDO = { ...LOTE_KG, cantidad: 3 };

  beforeEach(() => {
    almacen.setItem(CLAVE_LOTES, JSON.stringify([LOTE_REDUCIDO]));
    almacen.setItem(CLAVE_ENTREGAS, JSON.stringify([ENTREGA_GUARDADA]));
  });

  // ── Anulación con lote en stock (Req 3.2) ────────────────────────────────

  it('suma la cantidad al lote existente y quita la entrega del historial (Req 3.2)', () => {
    const resultado = anularEntrega('entrega-a-anular');

    expect(resultado.ok).toBe(true);
    expect(resultado.entregas).toHaveLength(0);

    const loteRestituido = resultado.lotes.find((l) => l.id === LOTE_KG.id);
    expect(loteRestituido.cantidad).toBe(5); // 3 + 2
  });

  // ── Anulación con lote ausente del stock (Req 3.3) ───────────────────────

  it('recrea el lote cuando ya no está en el stock (Req 3.3)', () => {
    // Quitar el lote del stock (simula una entrega total previa).
    almacen.setItem(CLAVE_LOTES, '[]');

    const resultado = anularEntrega('entrega-a-anular');

    expect(resultado.ok).toBe(true);
    const loteRecreado = resultado.lotes.find((l) => l.id === LOTE_KG.id);
    expect(loteRecreado).toBeDefined();
    expect(loteRecreado.cantidad).toBe(ENTREGA_GUARDADA.cantidad);
    expect(loteRecreado.unidad).toBe(ENTREGA_GUARDADA.unidad);
    expect(loteRecreado.fechaVencimiento).toBe(ENTREGA_GUARDADA.fechaVencimiento);
  });

  // ── Id inexistente ────────────────────────────────────────────────────────

  it('cuando el id no existe no escribe y devuelve las listas sin cambios', () => {
    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    const resultado = anularEntrega('id-que-no-existe');

    expect(resultado.ok).toBe(true);
    // No debe haber escrito.
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  // ── Lote con unidad distinta ──────────────────────────────────────────────

  it('no modifica nada cuando el lote existe con otra unidad', () => {
    // Reemplazar el lote con una unidad diferente.
    const loteConOtraUnidad = { ...LOTE_REDUCIDO, unidad: 'litros' };
    almacen.setItem(CLAVE_LOTES, JSON.stringify([loteConOtraUnidad]));

    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    const resultado = anularEntrega('entrega-a-anular');

    // No debe haber cambiado nada en el almacenamiento.
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  // ── Fallo de escritura (Req 4.4) ──────────────────────────────────────────

  it('cuando la escritura de entregas falla devuelve error escritura', () => {
    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    const setItemOriginal = almacen.setItem.bind(almacen);
    almacen.setItem = (clave, valor) => {
      if (clave === CLAVE_ENTREGAS) {
        throw new DOMException('Cuota', 'QuotaExceededError');
      }
      setItemOriginal(clave, valor);
    };

    const resultado = anularEntrega('entrega-a-anular');

    expect(resultado).toEqual({ ok: false, error: 'escritura' });
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  it('cuando la escritura de lotes falla restaura las entregas y devuelve error escritura (Req 4.4)', () => {
    const valorEntregasAntes = almacen._store.get(CLAVE_ENTREGAS);
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    let escriturasDeLotes = 0;
    const setItemOriginal = almacen.setItem.bind(almacen);
    almacen.setItem = (clave, valor) => {
      if (clave === CLAVE_LOTES) {
        escriturasDeLotes++;
        if (escriturasDeLotes === 1) {
          throw new DOMException('Cuota', 'QuotaExceededError');
        }
      }
      setItemOriginal(clave, valor);
    };

    const resultado = anularEntrega('entrega-a-anular');

    expect(resultado).toEqual({ ok: false, error: 'escritura' });
    expect(almacen._store.get(CLAVE_ENTREGAS)).toBe(valorEntregasAntes);
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  // ── Fallo de lectura (Req 4.3) ────────────────────────────────────────────

  it('cuando la lectura de entregas falla devuelve error lectura sin modificar lotes', () => {
    almacen.setItem(CLAVE_ENTREGAS, 'corrupto');
    const valorLotesAntes = almacen._store.get(CLAVE_LOTES);

    const resultado = anularEntrega('entrega-a-anular');

    expect(resultado).toEqual({ ok: false, error: 'lectura' });
    expect(almacen._store.get(CLAVE_LOTES)).toBe(valorLotesAntes);
  });

  // ── Persistencia (Req 4.1) ────────────────────────────────────────────────

  it('una lectura fresca después de anular refleja el historial actualizado (Req 4.1)', () => {
    anularEntrega('entrega-a-anular');

    const entregasGuardadas = JSON.parse(almacen._store.get(CLAVE_ENTREGAS));
    expect(entregasGuardadas).toHaveLength(0);
  });

  it('una lectura fresca de lotes después de anular refleja la cantidad restituida (Req 4.1)', () => {
    anularEntrega('entrega-a-anular');

    const lotesGuardados = JSON.parse(almacen._store.get(CLAVE_LOTES));
    const lote = lotesGuardados.find((l) => l.id === LOTE_KG.id);
    expect(lote.cantidad).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Ciclo completo: registrar → anular → leer
// ---------------------------------------------------------------------------

describe('ciclo completo: registrar y anular', () => {
  it('registrar y luego anular deja lotes y entregas como al inicio', () => {
    const lotesIniciales = [LOTE_KG];
    almacen.setItem(CLAVE_LOTES, JSON.stringify(lotesIniciales));
    almacen.setItem(CLAVE_ENTREGAS, '[]');

    // Registrar
    const registrado = registrarEntrega(ENTRADA_VALIDA);
    expect(registrado.ok).toBe(true);
    const idEntrega = registrado.entregas[0].id;

    // Persistir el estado intermedio
    almacen.setItem(CLAVE_ENTREGAS, JSON.stringify(registrado.entregas));
    almacen.setItem(CLAVE_LOTES, JSON.stringify(registrado.lotes));

    // Anular
    const anulado = anularEntrega(idEntrega);
    expect(anulado.ok).toBe(true);
    expect(anulado.entregas).toHaveLength(0);

    const loteRestaurado = anulado.lotes.find((l) => l.id === LOTE_KG.id);
    expect(loteRestaurado.cantidad).toBe(LOTE_KG.cantidad);
  });

  it('una lectura fresca después del ciclo completo refleja el estado restaurado (Req 4.1)', () => {
    almacen.setItem(CLAVE_LOTES, JSON.stringify([LOTE_KG]));
    almacen.setItem(CLAVE_ENTREGAS, '[]');

    const registrado = registrarEntrega(ENTRADA_VALIDA);
    almacen.setItem(CLAVE_ENTREGAS, JSON.stringify(registrado.entregas));
    almacen.setItem(CLAVE_LOTES, JSON.stringify(registrado.lotes));

    const anulado = anularEntrega(registrado.entregas[0].id);
    expect(anulado.ok).toBe(true);

    const entregasFinales = JSON.parse(almacen._store.get(CLAVE_ENTREGAS));
    const lotesFinales = JSON.parse(almacen._store.get(CLAVE_LOTES));

    expect(entregasFinales).toHaveLength(0);
    expect(lotesFinales.find((l) => l.id === LOTE_KG.id).cantidad).toBe(LOTE_KG.cantidad);
  });
});
