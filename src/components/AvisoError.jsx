/**
 * AvisoError — muestra el aviso de fallo de lectura o de escritura.
 *
 * Props:
 *   - tipo: "lectura" | "escritura"
 *
 * Mensajes según el diseño:
 *   - lectura:   «No se pudieron leer las donaciones guardadas.
 *                 No se reemplazaron por datos de ejemplo.»
 *   - escritura: «No se pudo guardar el cambio.
 *                 La información del navegador sigue como estaba.»
 */
const MENSAJES = {
  lectura:
    'No se pudieron leer las donaciones guardadas. No se reemplazaron por datos de ejemplo.',
  escritura:
    'No se pudo guardar el cambio. La información del navegador sigue como estaba.',
}

export default function AvisoError({ tipo }) {
  const mensaje = MENSAJES[tipo]

  if (!mensaje) return null

  return (
    <div
      role="alert"
      className={
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ' +
        'bg-red-50 border-[var(--color-vencido)] text-[var(--color-vencido)]'
      }
    >
      {/* Ícono de advertencia — solo decorativo */}
      <svg
        aria-hidden="true"
        focusable="false"
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p>{mensaje}</p>
    </div>
  )
}
