/**
 * Aplica una entrega a las listas de lotes y entregas, sin tocar el almacenamiento.
 *
 * Reglas del diseño:
 * - La entrada ya fue validada antes de llegar aquí.
 * - Entrega parcial: resta cantidad del lote, conserva id, unidad y fechas.
 * - Entrega total (cantidad == disponible): quita el lote del stock.
 *   Copia nombreAlimento, unidad, fechaRecepcion y fechaVencimiento en la entrega.
 * - Las sumas y restas se redondean a tres decimales para evitar restos negativos
 *   por error de punto flotante.
 * - La entrega nueva se agrega al historial. El historial devuelto queda ordenado
 *   por fechaEntrega descendente y, en empate, por secuencia ascendente.
 *
 * @module aplicarEntrega
 */

/**
 * Redondea un número a tres decimales.
 *
 * @param {number} n
 * @returns {number}
 */
function redondear(n) {
  return Math.round(n * 1000) / 1000;
}

/**
 * Compara dos entregas para ordenarlas: fechaEntrega descendente y, en empate,
 * secuencia ascendente.
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function compararEntregas(a, b) {
  if (a.fechaEntrega > b.fechaEntrega) return -1;
  if (a.fechaEntrega < b.fechaEntrega) return 1;
  return a.secuencia - b.secuencia;
}

/**
 * Aplica una entrega validada a las listas y devuelve las dos listas nuevas.
 *
 * @param {Array<Object>} lotes     — lista de lotes del stock.
 * @param {Array<Object>} entregas  — historial de entregas existente.
 * @param {Object} entrada
 * @param {string}  entrada.id              — id único de la entrega (UUID).
 * @param {string}  entrada.loteId          — id del lote a descontar.
 * @param {string}  entrada.familia         — nombre de la familia.
 * @param {number}  entrada.cantidad        — cantidad a entregar.
 * @param {string}  entrada.fechaEntrega    — fecha de la entrega en YYYY-MM-DD.
 * @param {number}  entrada.secuencia       — entero de orden para la misma fecha.
 *
 * @returns {{ lotes: Array<Object>, entregas: Array<Object> }}
 */
export function aplicarEntrega(lotes, entregas, entrada) {
  const lote = lotes.find((l) => l.id === entrada.loteId);

  if (!lote) {
    // El lote no está; devolvemos las listas sin cambios.
    return { lotes: [...lotes], entregas: [...entregas] };
  }

  const resto = redondear(lote.cantidad - entrada.cantidad);
  const esEntregaTotal = resto <= 0;

  // ── Construir la entrega nueva ──────────────────────────────────────────
  const entregaNueva = {
    id: entrada.id,
    loteId: lote.id,
    familia: entrada.familia,
    cantidad: entrada.cantidad,
    unidad: lote.unidad,
    nombreAlimento: lote.nombre,
    fechaRecepcion: lote.fechaRecepcion,
    fechaVencimiento: lote.fechaVencimiento,
    fechaEntrega: entrada.fechaEntrega,
    secuencia: entrada.secuencia,
  };

  // ── Actualizar lotes ────────────────────────────────────────────────────
  let lotesNuevos;
  if (esEntregaTotal) {
    // Quitar el lote del stock.
    lotesNuevos = lotes.filter((l) => l.id !== lote.id);
  } else {
    // Descontar la cantidad y conservar el resto del lote.
    lotesNuevos = lotes.map((l) =>
      l.id === lote.id ? { ...l, cantidad: resto } : l
    );
  }

  // ── Actualizar historial ────────────────────────────────────────────────
  const entregasNuevas = [...entregas, entregaNueva].sort(compararEntregas);

  return { lotes: lotesNuevos, entregas: entregasNuevas };
}
