/**
 * EtiquetaEstado — muestra el estado de vencimiento de un lote.
 * El color nunca viaja solo: siempre va acompañado del texto del estado.
 *
 * Props:
 *   - estado: "en-buen-estado" | "proximo-a-vencer" | "vencido"
 */
const CONFIG = {
  'en-buen-estado': {
    texto: 'En buen estado',
    clases: 'bg-green-100 text-[var(--color-buen-estado)] border border-[var(--color-buen-estado)]',
  },
  'proximo-a-vencer': {
    texto: 'Próximo a vencer',
    clases: 'bg-amber-50 text-[var(--color-proximo)] border border-[var(--color-proximo)]',
  },
  'vencido': {
    texto: 'Vencido',
    clases: 'bg-red-50 text-[var(--color-vencido)] border border-[var(--color-vencido)]',
  },
}

export default function EtiquetaEstado({ estado }) {
  const config = CONFIG[estado]

  if (!config) return null

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.clases}`}
    >
      {config.texto}
    </span>
  )
}
