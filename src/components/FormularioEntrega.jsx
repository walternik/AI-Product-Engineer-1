/**
 * FormularioEntrega — formulario para registrar una entrega de alimentos.
 *
 * Muestra los lotes con cantidad > 0, ordenados por vencimiento ascendente.
 * Cada lote se muestra como una opción grande con nombre, cantidad, unidad,
 * fecha de vencimiento y EtiquetaEstado. Los lotes vencidos aparecen
 * deshabilitados con un mensaje explicativo.
 *
 * Pide:
 *   - Lote (selección por tarjeta)
 *   - Familia (texto, obligatorio)
 *   - Cantidad (número, obligatorio)
 *   - Fecha de entrega (opcional; vacía = hoy)
 *
 * Props:
 *   - lotes: arreglo de lotes disponibles (cantidad > 0).
 *   - hoy: fecha de referencia en formato YYYY-MM-DD.
 *   - onGuardar(entrada): llamado con la entrada válida cuando se confirma.
 *
 * Validación:
 *   Usa `validarEntrega` de `src/utils/validarEntrega.js`. Si hay errores,
 *   los muestra junto al campo y NO llama a `onGuardar`.
 */

import { useState } from 'react'
import EtiquetaEstado from './EtiquetaEstado.jsx'
import Boton from './Boton.jsx'
import { ordenarLotes } from '../utils/ordenarLotes.js'
import { estadoDeLote } from '../utils/vencimiento.js'
import { validarEntrega } from '../utils/validarEntrega.js'

/** Estado vacío del formulario. */
const ESTADO_INICIAL = {
  loteId: '',
  familia: '',
  cantidad: '',
  fecha: '',
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FormularioEntrega({ lotes = [], hoy, onGuardar }) {
  const [campos, setCampos] = useState(ESTADO_INICIAL)
  const [errores, setErrores] = useState({})

  // Lotes con cantidad > 0, ordenados por vencimiento ascendente.
  const lotesDisponibles = ordenarLotes(
    lotes.filter((l) => typeof l.cantidad === 'number' && l.cantidad > 0)
  )

  const loteSeleccionado = lotesDisponibles.find((l) => l.id === campos.loteId) ?? null

  // ── Manejadores ────────────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target
    setCampos((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) {
      setErrores((prev) => {
        const copia = { ...prev }
        delete copia[name]
        return copia
      })
    }
  }

  function handleSeleccionarLote(lote) {
    const estaVencido = estadoDeLote(lote.fechaVencimiento, hoy) === 'vencido'
    if (estaVencido) return

    setCampos((prev) => ({ ...prev, loteId: lote.id, cantidad: '' }))
    setErrores((prev) => {
      const copia = { ...prev }
      delete copia.lote
      delete copia.cantidad
      return copia
    })
  }

  function handleSubmit(e) {
    e.preventDefault()

    const entrada = {
      familia: campos.familia,
      cantidad: campos.cantidad === '' ? '' : Number(campos.cantidad),
      fecha: campos.fecha,
    }

    const { valido, errores: erroresValidacion } = validarEntrega(
      entrada,
      loteSeleccionado,
      hoy
    )

    if (!valido) {
      // Si el error es del lote (no hay lote seleccionado), mapearlo a 'lote'.
      setErrores(erroresValidacion)
      return
    }

    setErrores({})
    setCampos(ESTADO_INICIAL)
    onGuardar({ ...entrada, loteId: loteSeleccionado.id })
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-[var(--color-superficie)] rounded-xl p-6 shadow-sm w-full space-y-6"
    >
      <h2 className="text-xl font-bold text-[var(--color-texto)]">
        Registrar entrega
      </h2>

      {/* ── Selección de lote ──────────────────────────────────────────── */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--color-texto)] mb-3">
          Lote a entregar{' '}
          <span aria-hidden="true" className="text-red-600" title="Campo obligatorio">
            *
          </span>
        </legend>

        {lotesDisponibles.length === 0 ? (
          <p className="text-sm text-[var(--color-texto-secundario)]">
            No hay lotes disponibles en este momento.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {lotesDisponibles.map((lote) => {
              const estado = estadoDeLote(lote.fechaVencimiento, hoy)
              const estaVencido = estado === 'vencido'
              const estaSeleccionado = campos.loteId === lote.id

              return (
                <TarjetaLote
                  key={lote.id}
                  lote={lote}
                  estado={estado}
                  estaVencido={estaVencido}
                  estaSeleccionado={estaSeleccionado}
                  onSeleccionar={() => handleSeleccionarLote(lote)}
                />
              )
            })}
          </div>
        )}

        {errores.lote && (
          <p role="alert" className="text-sm text-red-600 mt-2">
            {errores.lote}
          </p>
        )}
      </fieldset>

      {/* ── Familia ────────────────────────────────────────────────────── */}
      <Campo
        id="familia"
        etiqueta="Familia"
        requerido
        error={errores.familia}
      >
        <input
          id="familia"
          name="familia"
          type="text"
          value={campos.familia}
          onChange={handleChange}
          maxLength={80}
          placeholder="Ej.: Familia Gómez"
          className={inputClase(errores.familia)}
          aria-describedby={errores.familia ? 'error-familia' : undefined}
          aria-required="true"
        />
        <MensajeError id="error-familia" mensaje={errores.familia} />
      </Campo>

      {/* ── Cantidad ───────────────────────────────────────────────────── */}
      <Campo
        id="cantidad"
        etiqueta={
          loteSeleccionado
            ? `Cantidad (${loteSeleccionado.unidad})`
            : 'Cantidad'
        }
        requerido
        error={errores.cantidad}
        ayuda={
          loteSeleccionado
            ? `Disponible: ${loteSeleccionado.cantidad} ${loteSeleccionado.unidad}`
            : undefined
        }
      >
        <input
          id="cantidad"
          name="cantidad"
          type="number"
          min="0"
          step={loteSeleccionado?.unidad === 'unidades' ? '1' : 'any'}
          value={campos.cantidad}
          onChange={handleChange}
          placeholder={loteSeleccionado?.unidad === 'unidades' ? 'Ej.: 3' : 'Ej.: 1.5'}
          className={inputClase(errores.cantidad)}
          aria-describedby={errores.cantidad ? 'error-cantidad' : undefined}
          aria-required="true"
        />
        <MensajeError id="error-cantidad" mensaje={errores.cantidad} />
      </Campo>

      {/* ── Fecha de entrega ───────────────────────────────────────────── */}
      <Campo
        id="fecha"
        etiqueta="Fecha de entrega"
        error={errores.fecha}
      >
        <p className="text-sm text-[var(--color-texto-secundario)] mb-1">
          Opcional. Si se deja vacía, se usará la fecha de hoy.
        </p>
        <input
          id="fecha"
          name="fecha"
          type="date"
          value={campos.fecha}
          onChange={handleChange}
          max={hoy}
          className={inputClase(errores.fecha)}
          aria-describedby={errores.fecha ? 'error-fecha' : undefined}
          aria-required="false"
        />
        <MensajeError id="error-fecha" mensaje={errores.fecha} />
      </Campo>

      {/* ── Acción ─────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <Boton type="submit" variante="principal">
          Registrar entrega
        </Boton>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponentes locales
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tarjeta de lote seleccionable. Los vencidos aparecen deshabilitados.
 */
function TarjetaLote({ lote, estado, estaVencido, estaSeleccionado, onSeleccionar }) {
  const clasesBase =
    'w-full text-left rounded-xl border-2 p-4 transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hoja)]'

  const clasesEstado = estaVencido
    ? 'border-[var(--color-vencido)] bg-red-50 opacity-60 cursor-not-allowed'
    : estaSeleccionado
    ? 'border-[var(--color-hoja)] bg-[#EBF3E4]'
    : 'border-[var(--color-hoja)] bg-[var(--color-superficie)] hover:bg-[#EBF3E4] cursor-pointer'

  return (
    <button
      type="button"
      disabled={estaVencido}
      onClick={onSeleccionar}
      className={`${clasesBase} ${clasesEstado}`}
      aria-pressed={estaSeleccionado}
      aria-disabled={estaVencido}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-base font-semibold text-[var(--color-texto)]">
            {lote.nombre}
          </p>
          <p className="text-sm text-[var(--color-texto-secundario)]">
            {lote.cantidad} {lote.unidad} · vence {lote.fechaVencimiento}
          </p>
          {estaVencido && (
            <p className="text-sm text-[var(--color-vencido)] font-medium mt-1">
              No se entrega alimento vencido.
            </p>
          )}
        </div>
        <EtiquetaEstado estado={estado} />
      </div>
    </button>
  )
}

/**
 * Envuelve un campo con su etiqueta y espacio para el error.
 */
function Campo({ id, etiqueta, requerido, error, ayuda, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-[var(--color-texto)]"
      >
        {etiqueta}
        {requerido && (
          <span
            aria-hidden="true"
            className="ml-1 text-red-600"
            title="Campo obligatorio"
          >
            *
          </span>
        )}
      </label>
      {ayuda && (
        <p className="text-sm text-[var(--color-texto-secundario)]">{ayuda}</p>
      )}
      {children}
    </div>
  )
}

/**
 * Muestra el mensaje de error junto al campo.
 */
function MensajeError({ id, mensaje }) {
  if (!mensaje) return null
  return (
    <p id={id} role="alert" className="text-sm text-red-600 mt-0.5">
      {mensaje}
    </p>
  )
}

/**
 * Clases del input con variante de error.
 */
function inputClase(error) {
  const base =
    'w-full rounded-lg border px-3 py-2 text-base ' +
    'bg-[var(--color-superficie)] text-[var(--color-texto)] ' +
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-hoja)] ' +
    'transition-colors'
  const estado = error ? 'border-red-500' : 'border-[var(--color-hoja)]'
  return `${base} ${estado}`
}
