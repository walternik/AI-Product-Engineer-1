import manoCorazon from '../assets/mano-corazon.svg'

/**
 * Marca — cabecera con el ícono, el título y el subtítulo de la aplicación.
 * El subtítulo se muestra en versalitas mediante la clase `marca-subtitulo`
 * definida en index.css.
 */
export default function Marca() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={manoCorazon}
        alt=""
        aria-hidden="true"
        className="w-10 h-10 shrink-0"
      />
      <div className="flex flex-col leading-tight">
        <span
          className="text-xl font-bold text-[var(--color-texto)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Manos a la Obra
        </span>
        <span
          className="marca-subtitulo text-sm text-[var(--color-texto-secundario)]"
        >
          banco de alimentos comunitario
        </span>
      </div>
    </div>
  )
}
