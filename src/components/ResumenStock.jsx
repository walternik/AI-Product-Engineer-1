/**
 * ResumenStock — muestra los totales agrupados por alimento y unidad.
 *
 * Props:
 *   - totales: arreglo producido por `agruparTotales(lotes)`:
 *              `[{ nombre, unidad, total }]`
 *
 * Reglas de diseño:
 *   - Agrupa por nombre exacto + unidad (el detalle de cada lote lo muestra ListadoLotes).
 *   - La cantidad usa separador decimal en español, sin ceros al final.
 *   - La unidad se abrevia: kilogramos → kg, litros → l, unidades → unidades.
 */

// ── Helpers de formato ──────────────────────────────────────────────────────

/**
 * Formatea un número con separador decimal español y sin ceros finales.
 * @param {number} numero
 * @returns {string}
 */
function formatearCantidad(numero) {
  return numero.toLocaleString('es')
}

/**
 * Abrevia el nombre de la unidad.
 * @param {'kilogramos'|'litros'|'unidades'} unidad
 * @returns {string}
 */
function abreviarUnidad(unidad) {
  if (unidad === 'kilogramos') return 'kg'
  if (unidad === 'litros') return 'l'
  return 'unidades'
}

// ── Componente principal ────────────────────────────────────────────────────

export default function ResumenStock({ totales }) {
  if (!totales || totales.length === 0) return null

  return (
    <section aria-labelledby="resumen-stock-titulo">
      <h2
        id="resumen-stock-titulo"
        className="text-lg font-bold text-[var(--color-texto)] mb-3"
      >
        Total disponible
      </h2>

      <ul
        role="list"
        className="flex flex-wrap gap-3"
      >
        {totales.map(({ nombre, unidad, total }) => (
          <li
            key={`${nombre}-${unidad}`}
            className="bg-[var(--color-superficie)] border border-[var(--color-hoja)]/20 rounded-xl px-4 py-3 flex flex-col gap-0.5 min-w-[140px]"
          >
            <span className="text-sm font-semibold text-[var(--color-texto)]">{nombre}</span>
            <span className="text-xl font-bold text-[var(--color-hoja)]">
              {formatearCantidad(total)}{' '}
              <span className="text-base font-medium text-[var(--color-texto-secundario)]">
                {abreviarUnidad(unidad)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
