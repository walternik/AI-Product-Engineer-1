/**
 * Validación de un lote para Manos a la Obra.
 *
 * Reglas aplicadas (del modelo de datos):
 *   nombre        — obligatorio tras recortar; entre 1 y 80 caracteres.
 *   cantidad      — número finito y mayor que cero.
 *                   Entero cuando la unidad es 'unidades'.
 *                   Hasta tres decimales cuando es 'kilogramos' o 'litros'.
 *   unidad        — solo 'kilogramos', 'litros' o 'unidades'.
 *   fechaRecepcion — YYYY-MM-DD de un día real.
 *                    Vacía (null, undefined o '') → válida (el alta puede
 *                    omitirla; el servicio completa con el día local).
 *                    No vacía → debe ser un día real.
 *   fechaVencimiento — YYYY-MM-DD de un día real. Siempre obligatoria.
 *                      Puede ser anterior a hoy (lote ya vencido al ingresar).
 *
 * @module validarLote
 */

import { esFechaReal } from './fechas.js';

/** Unidades aceptadas. */
const UNIDADES_VALIDAS = ['kilogramos', 'litros', 'unidades'];

/** Longitud máxima del nombre. */
const NOMBRE_MAX = 80;

/** Máximo de decimales para kilogramos y litros. */
const DECIMALES_MAX = 3;

// ---------------------------------------------------------------------------
// Helpers internos
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
 * Valida los campos de un lote y devuelve mensajes de error en español.
 *
 * @param {Object} entrada
 * @param {string}        entrada.nombre
 * @param {number|string} entrada.cantidad
 * @param {string}        entrada.unidad
 * @param {string}        [entrada.fechaRecepcion]
 * @param {string}        entrada.fechaVencimiento
 *
 * @returns {{ valido: boolean, errores: Record<string, string> }}
 *   Si `valido` es `true`, `errores` es un objeto vacío.
 *   Si `valido` es `false`, `errores` contiene una entrada por campo inválido.
 */
export function validarLote(entrada) {
  const errores = {};

  // ── nombre ──────────────────────────────────────────────────────────────
  const nombre = typeof entrada?.nombre === 'string'
    ? entrada.nombre.trim()
    : '';

  if (nombre.length === 0) {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (nombre.length > NOMBRE_MAX) {
    errores.nombre = `El nombre no puede superar los ${NOMBRE_MAX} caracteres.`;
  }

  // ── unidad ───────────────────────────────────────────────────────────────
  const unidad = entrada?.unidad ?? '';

  if (!UNIDADES_VALIDAS.includes(unidad)) {
    errores.unidad = 'La unidad debe ser kilogramos, litros o unidades.';
  }

  // ── cantidad ─────────────────────────────────────────────────────────────
  const cantidad = Number(entrada?.cantidad);

  if (!isFinite(cantidad) || isNaN(cantidad)) {
    errores.cantidad = 'La cantidad debe ser un número válido.';
  } else if (cantidad <= 0) {
    errores.cantidad = 'La cantidad debe ser mayor que cero.';
  } else if (!errores.unidad) {
    // Solo aplicar las reglas de decimales si la unidad ya es válida.
    if (unidad === 'unidades') {
      if (!Number.isInteger(cantidad)) {
        errores.cantidad = 'La cantidad en unidades debe ser un número entero.';
      }
    } else {
      // kilogramos o litros: máximo tres decimales.
      if (cifrasDecimales(cantidad) > DECIMALES_MAX) {
        errores.cantidad =
          'La cantidad admite como máximo tres cifras decimales.';
      }
    }
  }

  // ── fechaRecepcion ────────────────────────────────────────────────────────
  const fechaRecepcion = entrada?.fechaRecepcion;
  const recepcionVacia =
    fechaRecepcion === null ||
    fechaRecepcion === undefined ||
    fechaRecepcion === '';

  if (!recepcionVacia && !esFechaReal(fechaRecepcion)) {
    errores.fechaRecepcion = 'La fecha de recepción no es una fecha válida.';
  }

  // ── fechaVencimiento ─────────────────────────────────────────────────────
  const fechaVencimiento = entrada?.fechaVencimiento;

  if (!fechaVencimiento && fechaVencimiento !== 0) {
    errores.fechaVencimiento = 'La fecha de vencimiento es obligatoria.';
  } else if (!esFechaReal(fechaVencimiento)) {
    errores.fechaVencimiento =
      'La fecha de vencimiento no es una fecha válida.';
  }

  // ── resultado ─────────────────────────────────────────────────────────────
  const valido = Object.keys(errores).length === 0;
  return { valido, errores };
}
