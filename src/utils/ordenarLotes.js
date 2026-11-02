/**
 * Ordenación de lotes para Manos a la Obra.
 *
 * Reglas del diseño:
 * - Ordenar por `fechaVencimiento` ascendente (lo que vence antes, primero).
 * - En empate de vencimiento, ordenar por `nombre` alfabéticamente.
 * - Devolver un arreglo nuevo; no mutar el original.
 */

/**
 * Devuelve una copia del arreglo de lotes ordenada por fecha de vencimiento
 * ascendente y, en empate, por nombre alfabéticamente.
 *
 * @param {Array<{nombre: string, fechaVencimiento: string}>} lotes
 * @returns {Array}
 */
export function ordenarLotes(lotes) {
  return [...lotes].sort((a, b) => {
    // Comparación lexicográfica: válida porque las fechas son YYYY-MM-DD.
    if (a.fechaVencimiento < b.fechaVencimiento) return -1;
    if (a.fechaVencimiento > b.fechaVencimiento) return 1;

    // Empate en vencimiento: desempatar por nombre alfabéticamente.
    if (a.nombre < b.nombre) return -1;
    if (a.nombre > b.nombre) return 1;

    return 0;
  });
}
