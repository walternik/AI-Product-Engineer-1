/**
 * Cálculo del estado de vencimiento de un lote.
 *
 * Reglas del diseño:
 * - Las fechas son cadenas YYYY-MM-DD y se comparan lexicográficamente.
 * - La ventana "próximo a vencer" es una constante de 7 días, incluida hoy.
 */

import { sumarDias } from './fechas.js';

/** Días que define la ventana de «próximo a vencer». */
export const DIAS_PROXIMO_A_VENCER = 7;

/**
 * Clasifica el estado de vencimiento de un lote.
 *
 * @param {string} fechaVencimiento — fecha del lote en formato YYYY-MM-DD.
 * @param {string} hoy              — fecha actual en formato YYYY-MM-DD.
 * @returns {'vencido' | 'proximo-a-vencer' | 'en-buen-estado'}
 */
export function estadoDeLote(fechaVencimiento, hoy) {
  if (fechaVencimiento < hoy) {
    return 'vencido';
  }

  const limite = sumarDias(hoy, DIAS_PROXIMO_A_VENCER);

  if (fechaVencimiento <= limite) {
    return 'proximo-a-vencer';
  }

  return 'en-buen-estado';
}
