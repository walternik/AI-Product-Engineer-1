/**
 * Boton — botón reutilizable con cuatro variantes visuales.
 *
 * Variantes:
 *   - "principal"   → fondo verde hoja (#527A3B), texto blanco
 *   - "secundaria"  → superficie clara con borde verde, texto verde
 *   - "acento"      → fondo naranja (#E97836), texto blanco (uso puntual)
 *   - "destructiva" → fondo rojo (#991B1B), texto blanco
 *
 * Props:
 *   - variante: "principal" | "secundaria" | "acento" | "destructiva"
 *   - type: atributo HTML del botón (por defecto "button")
 *   - disabled: deshabilita el botón
 *   - onClick: manejador de clic
 *   - children: contenido del botón
 *   - className: clases adicionales opcionales
 */
const estilos = {
  principal: [
    'bg-[var(--color-hoja)] text-white',
    'hover:bg-[var(--color-hoja-oscuro)]',
    'border border-transparent',
  ].join(' '),

  secundaria: [
    'bg-[var(--color-superficie)] text-[var(--color-hoja)]',
    'border border-[var(--color-hoja)]',
    'hover:bg-[var(--color-hoja)] hover:text-white',
  ].join(' '),

  acento: [
    'bg-[var(--color-zanahoria)] text-white',
    'border border-transparent',
    'hover:opacity-90',
  ].join(' '),

  destructiva: [
    'bg-[var(--color-destructivo)] text-white',
    'border border-transparent',
    'hover:opacity-90',
  ].join(' '),
}

const base =
  'inline-flex items-center justify-center gap-2 ' +
  'px-5 py-2.5 rounded-lg font-semibold text-base ' +
  'min-h-[44px] min-w-[44px] ' +
  'transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-hoja)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

export default function Boton({
  variante = 'principal',
  type = 'button',
  disabled = false,
  onClick,
  children,
  className = '',
}) {
  const claseVariante = estilos[variante] ?? estilos.principal

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${claseVariante} ${className}`.trim()}
    >
      {children}
    </button>
  )
}
