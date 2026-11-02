/**
 * Servicio de lotes para Manos a la Obra.
 *
 * Coordina la semilla, la validación y el almacenamiento local.
 * Es el único módulo que decide cuándo leer, sembrar y escribir.
 *
 * Resultados posibles:
 *
 *   obtenerLotes()
 *     { tipo: 'ok', lotes: [...] }
 *     { tipo: 'fallo-lectura' }
 *
 *   guardarLote(entrada)
 *     { tipo: 'ok', lotes: [...] }
 *     { tipo: 'fallo-validacion', errores: {...} }
 *     { tipo: 'fallo-escritura' }
 *
 *   actualizarLote(id, entrada)
 *     { tipo: 'ok', lotes: [...] }
 *     { tipo: 'fallo-validacion', errores: {...} }
 *     { tipo: 'fallo-escritura' }
 *     { tipo: 'no-encontrado' }
 *
 *   eliminarLote(id)
 *     { tipo: 'ok', lotes: [...] }
 *     { tipo: 'fallo-escritura' }
 *
 * Requirements: 1.2, 1.3, 4.1, 4.2, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { leer, guardar } from './almacenamientoLocal.js';
import { validarLote } from '../utils/validarLote.js';
import { fechaLocalHoy } from '../utils/fechas.js';
import { lotesDeDemostracion } from '../data/lotesDeDemostracion.js';

// ---------------------------------------------------------------------------
// obtenerLotes
// ---------------------------------------------------------------------------

/**
 * Devuelve la lista de lotes guardada.
 *
 * - Si la clave no existe, genera la semilla, intenta guardarla y la devuelve.
 * - Si la clave existe (aunque sea vacía), devuelve ese valor.
 * - Si el valor no es interpretable como lista, devuelve fallo-lectura sin escribir.
 *
 * @returns {{ tipo: 'ok', lotes: object[] } | { tipo: 'fallo-lectura' }}
 */
export function obtenerLotes() {
  const resultado = leer();

  if (resultado.tipo === 'ausencia') {
    const semilla = lotesDeDemostracion(fechaLocalHoy());
    // Intentar guardar; si falla se devuelve igual pero sin persistir.
    guardar(semilla);
    return { tipo: 'ok', lotes: semilla };
  }

  if (resultado.tipo === 'fallo-lectura') {
    return { tipo: 'fallo-lectura' };
  }

  // tipo === 'ok'
  return { tipo: 'ok', lotes: resultado.lotes };
}

// ---------------------------------------------------------------------------
// guardarLote
// ---------------------------------------------------------------------------

/**
 * Valida `entrada`, asigna un `id` único, completa `fechaRecepcion` si viene
 * vacía con el día local y persiste la lista completa.
 *
 * @param {object} entrada — campos del lote sin `id`.
 * @returns {{ tipo: 'ok', lotes: object[] } | { tipo: 'fallo-validacion', errores: object } | { tipo: 'fallo-escritura' }}
 */
export function guardarLote(entrada) {
  const { valido, errores } = validarLote(entrada);
  if (!valido) {
    return { tipo: 'fallo-validacion', errores };
  }

  // Leer la lista actual (si falla, empezar con vacía; guardar reemplazará).
  const lecturaActual = leer();
  const lotesActuales =
    lecturaActual.tipo === 'ok' ? lecturaActual.lotes : [];

  const recepcion =
    entrada.fechaRecepcion === null ||
    entrada.fechaRecepcion === undefined ||
    entrada.fechaRecepcion === ''
      ? fechaLocalHoy()
      : entrada.fechaRecepcion;

  const loteNuevo = {
    id: crypto.randomUUID(),
    nombre: entrada.nombre.trim(),
    cantidad: Number(entrada.cantidad),
    unidad: entrada.unidad,
    fechaRecepcion: recepcion,
    fechaVencimiento: entrada.fechaVencimiento,
  };

  const lotesNuevos = [...lotesActuales, loteNuevo];

  const escritura = guardar(lotesNuevos);
  if (escritura.tipo === 'fallo-escritura') {
    return { tipo: 'fallo-escritura' };
  }

  return { tipo: 'ok', lotes: lotesNuevos };
}

// ---------------------------------------------------------------------------
// actualizarLote
// ---------------------------------------------------------------------------

/**
 * Valida `entrada` y reemplaza el lote con `id` en la lista persistida.
 * Si el `id` no existe, no escribe y devuelve `no-encontrado`.
 *
 * @param {string} id
 * @param {object} entrada — campos nuevos del lote (sin `id`).
 * @returns {{ tipo: 'ok', lotes: object[] } | { tipo: 'fallo-validacion', errores: object } | { tipo: 'fallo-escritura' } | { tipo: 'no-encontrado' }}
 */
export function actualizarLote(id, entrada) {
  const { valido, errores } = validarLote(entrada);
  if (!valido) {
    return { tipo: 'fallo-validacion', errores };
  }

  const lecturaActual = leer();
  // Si la lectura falla no podemos ubicar el lote: tratar como no encontrado.
  if (lecturaActual.tipo !== 'ok') {
    return { tipo: 'no-encontrado' };
  }

  const lotesActuales = lecturaActual.lotes;
  const indice = lotesActuales.findIndex((l) => l.id === id);

  if (indice === -1) {
    return { tipo: 'no-encontrado' };
  }

  const loteActualizado = {
    id,
    nombre: entrada.nombre.trim(),
    cantidad: Number(entrada.cantidad),
    unidad: entrada.unidad,
    fechaRecepcion: entrada.fechaRecepcion,
    fechaVencimiento: entrada.fechaVencimiento,
  };

  const lotesNuevos = [
    ...lotesActuales.slice(0, indice),
    loteActualizado,
    ...lotesActuales.slice(indice + 1),
  ];

  const escritura = guardar(lotesNuevos);
  if (escritura.tipo === 'fallo-escritura') {
    return { tipo: 'fallo-escritura' };
  }

  return { tipo: 'ok', lotes: lotesNuevos };
}

// ---------------------------------------------------------------------------
// eliminarLote
// ---------------------------------------------------------------------------

/**
 * Elimina el lote con `id` de la lista y persiste el resto.
 * Si el `id` no existe, persiste la lista sin cambios (no-op exitoso).
 *
 * @param {string} id
 * @returns {{ tipo: 'ok', lotes: object[] } | { tipo: 'fallo-escritura' }}
 */
export function eliminarLote(id) {
  const lecturaActual = leer();
  const lotesActuales =
    lecturaActual.tipo === 'ok' ? lecturaActual.lotes : [];

  const lotesRestantes = lotesActuales.filter((l) => l.id !== id);

  const escritura = guardar(lotesRestantes);
  if (escritura.tipo === 'fallo-escritura') {
    return { tipo: 'fallo-escritura' };
  }

  return { tipo: 'ok', lotes: lotesRestantes };
}
