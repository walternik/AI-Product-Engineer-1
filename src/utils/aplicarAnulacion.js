/**
 * Aplica la anulación de una entrega sobre las listas de lotes y entregas,
 * sin tocar el almacenamiento.
 *
 * Reglas del diseño:
 * - Si el id no existe en el historial, devolver las listas sin cambios.
 * - Si el lote sigue en el stock con la misma unidad: sumar la cantidad
 *   (redondeada a tres decimales).
 * - Si el lote no está en el stock: recrearlo con loteId, unidad,
 *   nombreAlimento, fechaRecepcion y fechaVencimiento copiados de la entrega.
 * - Si el lote existe pero su unidad difiere: no modificar nada.
 * - Quitar la entrega anulada del historial.
 * - El historial devuelto queda ordenado por fechaEntrega descendente y,
 *   en empate, por secuencia ascendente.
 *
 * @module aplicarAnulacion
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
 * Anula una entrega y devuelve las dos listas actualizadas.
 *
 * @param {Array<Object>} lotes     — lista de lotes del stock.
 * @param {Array<Object>} entregas  — historial de entregas.
 * @param {string}        id        — id de la entrega a anular.
 *
 * @returns {{ lotes: Array<Object>, entregas: Array<Object> }}
 */
export function aplicarAnulacion(lotes, entregas, id) {
  const entrega = entregas.find((e) => e.id === id);

  // El id no existe: devolver sin cambios.
  if (!entrega) {
    return { lotes: [...lotes], entregas: [...entregas] };
  }

  const loteExistente = lotes.find((l) => l.id === entrega.loteId);

  let lotesNuevos;

  if (loteExistente) {
    // El lote existe: comprobar que la unidad coincide.
    if (loteExistente.unidad !== entrega.unidad) {
      // Unidad distinta: no modificar nada.
      return { lotes: [...lotes], entregas: [...entregas] };
    }

    // Unidad coincide: sumar la cantidad de vuelta.
    const cantidadRestituida = redondear(loteExistente.cantidad + entrega.cantidad);
    lotesNuevos = lotes.map((l) =>
      l.id === loteExistente.id ? { ...l, cantidad: cantidadRestituida } : l
    );
  } else {
    // El lote no existe: recrearlo con los datos copiados en la entrega.
    const loteRecreado = {
      id: entrega.loteId,
      nombre: entrega.nombreAlimento,
      cantidad: entrega.cantidad,
      unidad: entrega.unidad,
      fechaRecepcion: entrega.fechaRecepcion,
      fechaVencimiento: entrega.fechaVencimiento,
    };
    lotesNuevos = [...lotes, loteRecreado];
  }

  // Quitar la entrega anulada y reordenar el historial.
  const entregasNuevas = entregas
    .filter((e) => e.id !== id)
    .sort(compararEntregas);

  return { lotes: lotesNuevos, entregas: entregasNuevas };
}
