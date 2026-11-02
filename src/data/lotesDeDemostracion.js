/**
 * Semilla de demostración para Manos a la Obra.
 *
 * Se genera con fechas relativas al día que se recibe como parámetro,
 * por lo que nunca envejece en el repositorio.
 *
 * Incluye:
 *   - un lote en buen estado (vence en 30 días)
 *   - dos lotes próximos a vencer del mismo alimento y unidad (vencen hoy+3 y hoy+5)
 *   - un lote próximo a vencer de una unidad distinta (litros)
 *   - un lote vencido (venció hace 5 días)
 *
 * Requirements: 5.2
 */

import { sumarDias } from '../utils/fechas.js';

/**
 * Genera los lotes de demostración relativos a `hoy`.
 *
 * @param {string} hoy — fecha de referencia en formato YYYY-MM-DD.
 * @returns {object[]}
 */
export function lotesDeDemostracion(hoy) {
  return [
    {
      id: 'demo-1',
      nombre: 'Arroz',
      cantidad: 5,
      unidad: 'kilogramos',
      fechaRecepcion: sumarDias(hoy, -10),
      fechaVencimiento: sumarDias(hoy, 30),
    },
    {
      id: 'demo-2',
      nombre: 'Fideo',
      cantidad: 2,
      unidad: 'kilogramos',
      fechaRecepcion: sumarDias(hoy, -20),
      fechaVencimiento: sumarDias(hoy, 3),
    },
    {
      id: 'demo-3',
      nombre: 'Fideo',
      cantidad: 3,
      unidad: 'kilogramos',
      fechaRecepcion: sumarDias(hoy, -15),
      fechaVencimiento: sumarDias(hoy, 5),
    },
    {
      id: 'demo-4',
      nombre: 'Leche',
      cantidad: 4,
      unidad: 'litros',
      fechaRecepcion: sumarDias(hoy, -5),
      fechaVencimiento: sumarDias(hoy, 7),
    },
    {
      id: 'demo-5',
      nombre: 'Lentejas',
      cantidad: 1,
      unidad: 'kilogramos',
      fechaRecepcion: sumarDias(hoy, -30),
      fechaVencimiento: sumarDias(hoy, -5),
    },
  ];
}
