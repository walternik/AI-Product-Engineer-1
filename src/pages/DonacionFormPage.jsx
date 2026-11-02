/**
 * DonacionFormPage — pantalla de registro y corrección de un lote.
 *
 * Modos:
 *   - Alta (por defecto): no se pasa `loteInicial`. El formulario queda vacío y
 *     la fecha de recepción es opcional.
 *   - Corrección: se pasa `loteInicial` con los datos del lote a editar.
 *     Todos los campos, incluida la fecha de recepción, se precargan.
 *
 * Esta pantalla es un componente de presentación: delega la persistencia al
 * padre a través de `onGuardar`. No llama al servicio directamente.
 *
 * Props:
 *   - loteInicial (opcional): lote a corregir. Omitir o pasar null para el alta.
 *   - onGuardar(entrada): llamado con los datos del formulario cuando son válidos.
 *   - onCancelar(): llamado al pulsar el botón Cancelar.
 *
 * Requisitos: 1.1, 4.1, 6.1, 6.2
 */

import FormularioDonacion from '../components/FormularioDonacion.jsx'

export default function DonacionFormPage({ loteInicial = null, onGuardar, onCancelar }) {
  const esCorreccion = loteInicial != null
  const titulo = esCorreccion ? 'Corregir lote' : 'Registrar donación'

  return (
    <main className="flex flex-col items-center gap-6 p-4 sm:p-6">
      <h1 className="self-start text-2xl font-bold text-[var(--color-texto)]">{titulo}</h1>

      <FormularioDonacion
        loteInicial={loteInicial}
        onGuardar={onGuardar}
        onCancelar={onCancelar}
      />
    </main>
  )
}
