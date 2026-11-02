/**
 * Agrupación de totales por nombre y unidad para Manos a la Obra.
 *
 * Reglas del diseño:
 * - Sumar cantidades solo cuando `nombre` y `unidad` coinciden exactamente.
 * - «Arroz» y «arroz» son grupos distintos (comparación exacta, sin normalizar).
 * - «Aceite» en litros y «Aceite» en kilogramos son grupos distintos.
 * - El detalle de cada lote individual no se modifica ni se oculta.
 * - Devolver un arreglo nuevo; no mutar el original.
 */

/**
 * Agrupa los lotes por par (nombre, unidad) y suma sus cantidades.
 *
 * @param {Array<{nombre: string, cantidad: number, unidad: string}>} lotes
 * @returns {Array<{nombre: string, unidad: string, total: number}>}
 */
export function agruparTotales(lotes) {
  // Usamos un Map cuya clave es "nombre\0unidad" para evitar colisiones entre
  // nombres que contengan el separador.
  const mapa = new Map();

  for (const lote of lotes) {
    const clave = `${lote.nombre}\0${lote.unidad}`;

    if (mapa.has(clave)) {
      mapa.get(clave).total += lote.cantidad;
    } else {
      mapa.set(clave, {
        nombre: lote.nombre,
        unidad: lote.unidad,
        total: lote.cantidad,
      });
    }
  }

  return Array.from(mapa.values());
}
