/**
 * DialogoConfirmar — pregunta antes de eliminar un lote.
 *
 * Props:
 *   - loteNombre (string): nombre del lote a eliminar, se muestra en el mensaje.
 *   - onConfirmar(): callback llamado cuando el voluntario confirma la eliminación.
 *   - onCancelar(): callback llamado cuando el voluntario cancela.
 *   - abierto (boolean): si es false, el diálogo no se muestra.
 *   - titulo (string, opcional): reemplaza «Eliminar lote».
 *   - descripcion (string, opcional): reemplaza la pregunta de eliminar el lote.
 */
import Boton from './Boton.jsx'

export default function DialogoConfirmar({
  loteNombre,
  onConfirmar,
  onCancelar,
  abierto,
  titulo = 'Eliminar lote',
  descripcion,
}) {
  if (!abierto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogo-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="bg-[var(--color-superficie)] rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
        <h2
          id="dialogo-titulo"
          className="text-lg font-semibold text-[var(--color-texto)] mb-3"
        >
          {titulo}
        </h2>
        <p className="text-[var(--color-texto-secundario)] mb-6">
          {descripcion ?? (
            <>
              ¿Querés eliminar el lote{' '}
              <span className="font-semibold text-[var(--color-texto)]">
                {loteNombre}
              </span>
              ? Esta acción no se puede deshacer.
            </>
          )}
        </p>
        <div className="flex justify-end gap-3">
          <Boton variante="secundaria" onClick={onCancelar}>
            Cancelar
          </Boton>
          <Boton variante="destructiva" onClick={onConfirmar}>
            Confirmar
          </Boton>
        </div>
      </div>
    </div>
  )
}
