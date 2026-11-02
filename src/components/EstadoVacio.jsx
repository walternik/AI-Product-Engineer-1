/**
 * EstadoVacio — mensaje en español cuando no hay lotes en una vista.
 *
 * Props:
 *   - tipo: "stock" | "proximo-a-vencer" | "vencido"
 *   - onRegistrar: función llamada al hacer clic en el enlace de registro
 *                  (solo relevante cuando tipo="stock")
 */
export default function EstadoVacio({ tipo, onRegistrar }) {
  if (tipo === 'stock') {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 py-12 px-6 text-center text-[var(--color-texto-secundario)]"
      >
        <p className="text-base">
          Todavía no hay alimentos registrados en el banco.
        </p>
        {onRegistrar ? (
          <p className="text-base">
            <button
              type="button"
              onClick={onRegistrar}
              className="underline font-semibold text-[var(--color-hoja)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hoja)]"
            >
              Registrar el primer alimento
            </button>
          </p>
        ) : null}
      </div>
    )
  }

  if (tipo === 'proximo-a-vencer') {
    return (
      <p
        role="status"
        className="py-4 px-2 text-sm text-[var(--color-texto-secundario)] italic"
      >
        No hay lotes próximos a vencer en este momento.
      </p>
    )
  }

  if (tipo === 'vencido') {
    return (
      <p
        role="status"
        className="py-4 px-2 text-sm text-[var(--color-texto-secundario)] italic"
      >
        No hay lotes vencidos en este momento.
      </p>
    )
  }

  return null
}
