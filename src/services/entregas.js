/**
 * Servicio de entregas para Manos a la Obra.
 *
 * Coordina la validación, los cálculos de stock y el almacenamiento de las
 * dos claves (`manos-a-la-obra.entregas` y `manos-a-la-obra.lotes`).
 *
 * Es el único módulo que modifica las dos listas en una misma acción.
 * No reimplementa la lógica de sus dependencias.
 *
 * Resultados posibles:
 *
 *   obtenerEntregas()
 *     { ok: true, entregas: [...] }
 *     { ok: false, error: 'lectura' }
 *
 *   registrarEntrega(entrada)
 *     { ok: true, entregas: [...], lotes: [...] }
 *     { ok: false, errores: {...} }            — validación fallida
 *     { ok: false, error: 'lectura' }          — no se pudo leer el estado actual
 *     { ok: false, error: 'escritura' }        — fallo de persistencia
 *
 *   anularEntrega(id)
 *     { ok: true, entregas: [...], lotes: [...] }
 *     { ok: false, error: 'lectura' }
 *     { ok: false, error: 'escritura' }
 *
 * Requirements: 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4
 */

import { leer as leerEntregas, guardar as guardarEntregas } from './almacenamientoEntregas.js';
import { leer as leerLotes, guardar as guardarLotes } from './almacenamientoLocal.js';
import { validarEntrega } from '../utils/validarEntrega.js';
import { aplicarEntrega } from '../utils/aplicarEntrega.js';
import { aplicarAnulacion } from '../utils/aplicarAnulacion.js';
import { fechaLocalHoy } from '../utils/fechas.js';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Lee las entregas desde el almacenamiento.
 * La ausencia (clave no existe) se trata como lista vacía.
 *
 * @returns {{ ok: true, entregas: object[] } | { ok: false, error: 'lectura' }}
 */
function cargarEntregas() {
  const resultado = leerEntregas();

  if (resultado.tipo === 'ausencia') {
    return { ok: true, entregas: [] };
  }

  if (resultado.tipo === 'fallo-lectura') {
    return { ok: false, error: 'lectura' };
  }

  return { ok: true, entregas: resultado.entregas };
}

/**
 * Lee los lotes desde el almacenamiento.
 *
 * @returns {{ ok: true, lotes: object[] } | { ok: false, error: 'lectura' }}
 */
function cargarLotes() {
  const resultado = leerLotes();

  if (resultado.tipo === 'ausencia') {
    return { ok: true, lotes: [] };
  }

  if (resultado.tipo === 'fallo-lectura') {
    return { ok: false, error: 'lectura' };
  }

  return { ok: true, lotes: resultado.lotes };
}

/**
 * Calcula la secuencia siguiente para una nueva entrega en una fecha dada.
 * La secuencia es mayor que el máximo ya existente en esa fecha.
 *
 * @param {object[]} entregas — historial actual.
 * @param {string}   fecha    — fecha de la nueva entrega (YYYY-MM-DD).
 * @returns {number}
 */
function siguienteSecuencia(entregas, fecha) {
  const mismaFecha = entregas.filter((e) => e.fechaEntrega === fecha);
  if (mismaFecha.length === 0) return 1;
  const maxSecuencia = Math.max(...mismaFecha.map((e) => e.secuencia));
  return maxSecuencia + 1;
}

// ---------------------------------------------------------------------------
// obtenerEntregas
// ---------------------------------------------------------------------------

/**
 * Devuelve la lista de entregas guardada.
 *
 * - Si la clave no existe, devuelve lista vacía sin escribir una semilla.
 * - Si el valor no es interpretable como lista, devuelve fallo de lectura.
 *
 * @returns {{ ok: true, entregas: object[] } | { ok: false, error: 'lectura' }}
 */
export function obtenerEntregas() {
  return cargarEntregas();
}

// ---------------------------------------------------------------------------
// registrarEntrega
// ---------------------------------------------------------------------------

/**
 * Valida la entrada, calcula las listas nuevas y las persiste en orden:
 * primero entregas, después lotes. Si la segunda escritura falla, restaura
 * las entregas anteriores.
 *
 * La fecha vacía se completa con el día local. El `id` de la entrega se
 * genera con `crypto.randomUUID()`. La `secuencia` es mayor que el máximo
 * existente para la misma fecha.
 *
 * @param {Object} entrada
 * @param {string}        entrada.loteId      — id del lote a descontar.
 * @param {string}        entrada.familia     — nombre de la familia.
 * @param {number|string} entrada.cantidad    — cantidad a entregar.
 * @param {string}        [entrada.fecha]     — fecha de entrega (YYYY-MM-DD) o vacía.
 *
 * @returns {{ ok: true, entregas: object[], lotes: object[] }
 *          | { ok: false, errores: object }
 *          | { ok: false, error: 'lectura' | 'escritura' }}
 */
export function registrarEntrega(entrada) {
  const hoy = fechaLocalHoy();

  // ── Leer el estado actual ────────────────────────────────────────────────
  const lecturaEntregas = cargarEntregas();
  if (!lecturaEntregas.ok) {
    return { ok: false, error: 'lectura' };
  }

  const lecturaLotes = cargarLotes();
  if (!lecturaLotes.ok) {
    return { ok: false, error: 'lectura' };
  }

  const entregasActuales = lecturaEntregas.entregas;
  const lotesActuales = lecturaLotes.lotes;

  // ── Buscar el lote ───────────────────────────────────────────────────────
  const lote = lotesActuales.find((l) => l.id === entrada.loteId);

  // ── Validar ──────────────────────────────────────────────────────────────
  const { valido, errores } = validarEntrega(entrada, lote, hoy);
  if (!valido) {
    return { ok: false, errores };
  }

  // ── Completar la fecha vacía ─────────────────────────────────────────────
  const fechaEntrega =
    entrada.fecha === null || entrada.fecha === undefined || entrada.fecha === ''
      ? hoy
      : entrada.fecha;

  // ── Armar la entrada completa para aplicarEntrega ────────────────────────
  const secuencia = siguienteSecuencia(entregasActuales, fechaEntrega);

  const entradaCompleta = {
    id: crypto.randomUUID(),
    loteId: entrada.loteId,
    familia: typeof entrada.familia === 'string' ? entrada.familia.trim() : entrada.familia,
    cantidad: Number(entrada.cantidad),
    fechaEntrega,
    secuencia,
  };

  // ── Calcular las listas nuevas ───────────────────────────────────────────
  const { lotes: lotesNuevos, entregas: entregasNuevas } = aplicarEntrega(
    lotesActuales,
    entregasActuales,
    entradaCompleta
  );

  // ── Escribir primero las entregas ────────────────────────────────────────
  const escrituraEntregas = guardarEntregas(entregasNuevas);
  if (escrituraEntregas.tipo === 'fallo-escritura') {
    return { ok: false, error: 'escritura' };
  }

  // ── Escribir después los lotes ───────────────────────────────────────────
  const escrituraLotes = guardarLotes(lotesNuevos);
  if (escrituraLotes.tipo === 'fallo-escritura') {
    // Restaurar las entregas anteriores antes de informar el fallo.
    guardarEntregas(entregasActuales);
    return { ok: false, error: 'escritura' };
  }

  return { ok: true, entregas: entregasNuevas, lotes: lotesNuevos };
}

// ---------------------------------------------------------------------------
// anularEntrega
// ---------------------------------------------------------------------------

/**
 * Quita la entrega indicada del historial y restaura o recrea el lote.
 * Si el id no existe, no escribe nada.
 * Si el lote existe con otra unidad, no escribe nada.
 * Si la segunda escritura falla, restaura las entregas anteriores.
 *
 * @param {string} id — id de la entrega a anular.
 *
 * @returns {{ ok: true, entregas: object[], lotes: object[] }
 *          | { ok: false, error: 'lectura' | 'escritura' }}
 */
export function anularEntrega(id) {
  // ── Leer el estado actual ────────────────────────────────────────────────
  const lecturaEntregas = cargarEntregas();
  if (!lecturaEntregas.ok) {
    return { ok: false, error: 'lectura' };
  }

  const lecturaLotes = cargarLotes();
  if (!lecturaLotes.ok) {
    return { ok: false, error: 'lectura' };
  }

  const entregasActuales = lecturaEntregas.entregas;
  const lotesActuales = lecturaLotes.lotes;

  // ── Verificar que el id existe ───────────────────────────────────────────
  const entregaExiste = entregasActuales.some((e) => e.id === id);
  if (!entregaExiste) {
    // No escribe; devuelve el estado actual como si nada hubiera cambiado.
    return { ok: true, entregas: entregasActuales, lotes: lotesActuales };
  }

  // ── Calcular las listas nuevas ───────────────────────────────────────────
  const { lotes: lotesNuevos, entregas: entregasNuevas } = aplicarAnulacion(
    lotesActuales,
    entregasActuales,
    id
  );

  // Si aplicarAnulacion no cambió las listas (unidad distinta), no escribir.
  const listasIguales =
    lotesNuevos.length === lotesActuales.length &&
    entregasNuevas.length === entregasActuales.length &&
    entregasNuevas.every((e, i) => e.id === entregasActuales[i]?.id);

  if (listasIguales) {
    return { ok: true, entregas: entregasActuales, lotes: lotesActuales };
  }

  // ── Escribir primero las entregas ────────────────────────────────────────
  const escrituraEntregas = guardarEntregas(entregasNuevas);
  if (escrituraEntregas.tipo === 'fallo-escritura') {
    return { ok: false, error: 'escritura' };
  }

  // ── Escribir después los lotes ───────────────────────────────────────────
  const escrituraLotes = guardarLotes(lotesNuevos);
  if (escrituraLotes.tipo === 'fallo-escritura') {
    // Restaurar las entregas anteriores antes de informar el fallo.
    guardarEntregas(entregasActuales);
    return { ok: false, error: 'escritura' };
  }

  return { ok: true, entregas: entregasNuevas, lotes: lotesNuevos };
}
