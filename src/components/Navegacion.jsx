/**
 * Navegacion — barra de navegación entre las secciones de la aplicación.
 *
 * Cada destino tiene un ícono SVG y una etiqueta de texto. El destino activo
 * se distingue visualmente con `--color-hoja` y mediante `aria-current="page"`
 * para lectores de pantalla.
 *
 * Props:
 *   - vistaActual: "stock" | "vencimientos" | "registrar" | "entregas"
 *   - onNavegar(vista): callback invocado al hacer clic en un destino
 */

// ── Íconos SVG inline ──────────────────────────────────────────────────────

function IconoStock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Caja / inventario */}
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function IconoVencimientos() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Reloj / calendario con alerta */}
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconoEntregas() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7h13v10H3z" />
      <path d="M16 10h4l1 2v5h-5" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </svg>
  )
}

function IconoRegistrar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Más / agregar */}
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

// ── Datos de los destinos ──────────────────────────────────────────────────

const DESTINOS = [
  { vista: 'stock',        etiqueta: 'Stock',        Icono: IconoStock        },
  { vista: 'vencimientos', etiqueta: 'Vencimientos', Icono: IconoVencimientos },
  { vista: 'registrar',    etiqueta: 'Registrar',    Icono: IconoRegistrar    },
  { vista: 'entregas',     etiqueta: 'Entregas',     Icono: IconoEntregas     },
]

// ── Componente ─────────────────────────────────────────────────────────────

export default function Navegacion({ vistaActual, onNavegar }) {
  return (
    <nav aria-label="Secciones principales">
      <ul
        role="list"
        className="flex items-stretch gap-1 list-none m-0 p-0"
      >
        {DESTINOS.map(({ vista, etiqueta, Icono }) => {
          const activo = vistaActual === vista

          return (
            <li key={vista} className="flex-1">
              <button
                type="button"
                aria-current={activo ? 'page' : undefined}
                onClick={() => onNavegar(vista)}
                className={[
                  'w-full flex flex-col items-center justify-center gap-1',
                  'px-3 py-2 rounded-lg font-semibold text-sm',
                  'min-h-[44px] transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-offset-2 focus-visible:ring-[var(--color-hoja)]',
                  activo
                    ? 'text-[var(--color-hoja)] bg-[color-mix(in_srgb,var(--color-hoja)_12%,transparent)]'
                    : 'text-[var(--color-texto-secundario)] hover:text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-hoja)_6%,transparent)]',
                ].join(' ')}
              >
                <Icono />
                <span>{etiqueta}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
