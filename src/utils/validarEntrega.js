/**
 * Validación de una entrega para Manos a la Obra.
 *
 * Reglas aplicadas (del diseño):
 *   familia  — obligatoria tras recortar; entre 1 y 80 caracteres.
 *   cantidad — finita, mayor que cero y menor o igual que la disponible del lote.
 *              Entera cuando la unidad del lote es 'unidades'.
 *              Hasta tres decimales cuando es 'kilogramos' o 'litros'.
 *   fecha    — vacía es válida (el servicio usará el día local).
 *              Si viene, debe ser un día real y no posterior a `hoy`.
 *   lote     — debe existir, tener cantidad > 0 y no estar vencido.
 *
 * @module validarEntrega
 */

import { esFechaReal } from './fechas.js';
import { estadoDeLote } from './vencimiento.js';

/** Longitud máxima del nombre de familia. */
const FAMILIA_MAX = 80;

/** Máximo de decimales para kilogramos y litros. */
const DECIMALES_MAX = 3;

// ---------------------------------------------------------------------------
// Helper interno
// ---------------------------------------------------------------------------

/**
 * Devuelve la cantidad de cifras decimales reales de un número.
 * Usa la representación en texto para no acumular error de punto flotante.
 *
 * @param {number} n
 * @returns {number}
 */
function cifrasDecimales(n) {
  const texto = String(n);
  const punto = texto.indexOf('.');
  if (punto === -1) return 0;
  return texto.length - punto - 1;
}

// ---------------------------------------------------------------------------
// Función pública
// ---------------------------------------------------------------------------

/**
 * Valida los datos de una entrega y devuelve mensajes de error en español.
 *
 * @param {Object} entrada
 * @param {string}        entrada.familia    — nombre de la familia receptora.
 * @param {number|string} entrada.cantidad   — cantidad a entregar.
 * @param {string}        [entrada.fecha]    — fecha de entrega (YYYY-MM-DD) o vacía.
 *
 * @param {Object} lote
 * @param {string} lote.id
 * @param {number} lote.cantidad             — stock disponible del lote.
 * @param {string} lote.unidad               — 'kilogramos', 'litros' o 'unidades'.
 * @param {string} lote.fechaVencimiento     — fecha de vencimiento del lote (YYYY-MM-DD).
 *
 * @param {string} hoy — fecha de referencia en formato YYYY-MM-DD.
 *
 * @returns {{ valido: boolean, errores: Record<string, string> }}
 *   Si `valido` es `true`, `errores` es un objeto vacío.
 *   Si `valido` es `false`, `errores` contiene una entrada por campo inválido.
 */
export function validarEntrega(entrada, lote, hoy) {
  const errores = {};

  // ── lote: debe existir y no estar vencido ────────────────────────────────
  if (!lote || typeof lote !== 'object') {
    errores.lote = 'El lote seleccionado no existe.';
    return { valido: false, errores };
  }

  if (typeof lote.cantidad !== 'number' || lote.cantidad <= 0) {
    errores.lote = 'El lote no tiene cantidad disponible.';
    return { valido: false, errores };
  }

  const estadoLote = estadoDeLote(lote.fechaVencimiento, hoy);
  if (estadoLote === 'vencido') {
    errores.lote = 'No se entrega alimento vencido.';
    return { valido: false, errores };
  }

  // ── familia ───────────────────────────────────────────────────────────────
  const familia =
    typeof entrada?.familia === 'string' ? entrada.familia.trim() : '';

  if (familia.length === 0) {
    errores.familia = 'El nombre de la familia es obligatorio.';
  } else if (familia.length > FAMILIA_MAX) {
    errores.familia = `El nombre de la familia no puede superar los ${FAMILIA_MAX} caracteres.`;
  }

  // ── cantidad ──────────────────────────────────────────────────────────────
  const cantidad = Number(entrada?.cantidad);

  if (!isFinite(cantidad) || isNaN(cantidad)) {
    errores.cantidad = 'La cantidad debe ser un número válido.';
  } else if (cantidad <= 0) {
    errores.cantidad = 'La cantidad debe ser mayor que cero.';
  } else if (cantidad > lote.cantidad) {
    errores.cantidad = 'La cantidad supera la disponible en el lote.';
  } else {
    // Reglas de decimales según la unidad del lote.
    const unidad = lote.unidad;
    if (unidad === 'unidades') {
      if (!Number.isInteger(cantidad)) {
        errores.cantidad =
          'La cantidad en unidades debe ser un número entero.';
      }
    } else {
      // kilogramos o litros: máximo tres decimales.
      if (cifrasDecimales(cantidad) > DECIMALES_MAX) {
        errores.cantidad =
          'La cantidad admite como máximo tres cifras decimales.';
      }
    }
  }

  // ── fecha ─────────────────────────────────────────────────────────────────
  const fecha = entrada?.fecha;
  const fechaVacia =
    fecha === null || fecha === undefined || fecha === '';

  if (!fechaVacia) {
    if (!esFechaReal(fecha)) {
      errores.fecha = 'La fecha de entrega no es una fecha válida.';
    } else if (fecha > hoy) {
      errores.fecha = 'La fecha de entrega no puede ser posterior a hoy.';
    }
  }

  // ── resultado ─────────────────────────────────────────────────────────────
  const valido = Object.keys(errores).length === 0;
  return { valido, errores };
}
