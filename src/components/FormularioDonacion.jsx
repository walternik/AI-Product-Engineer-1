/**
 * FormularioDonacion — formulario de alta y corrección de lotes.
 *
 * Modos:
 *   - Alta (por defecto):  `loteInicial` no se pasa o es null.
 *     La fecha de recepción es opcional; el servicio la completa con el día local.
 *   - Corrección: se pasa `loteInicial` con los datos del lote existente.
 *     Todos los campos, incluida fechaRecepcion, se precargan y son obligatorios.
 *
 * Props:
 *   - loteInicial (opcional): objeto con los campos del lote a corregir.
 *   - onGuardar(entrada): llamado con los datos validados. El padre decide cómo persistir.
 *   - onCancelar(): llamado al pulsar el botón Cancelar.
 *
 * Validación:
 *   Usa `validarLote` de `src/utils/validarLote.js`. Si hay errores, los muestra
 *   junto a cada campo y NO llama a `onGuardar`.
 */

import { useState } from 'react'
import Boton from './Boton.jsx'
import { validarLote } from '../utils/validarLote.js'

/** Unidades ofrecidas en el selector. */
const UNIDADES = [
  { valor: 'kilogramos', etiqueta: 'Kilogramos' },
  { valor: 'litros',     etiqueta: 'Litros' },
  { valor: 'unidades',   etiqueta: 'Unidades' },
]

/** Estado vacío del formulario para el alta. */
const ESTADO_INICIAL = {
  nombre:           '',
  cantidad:         '',
  unidad:           '',
  fechaVencimiento: '',
  fechaRecepcion:   '',
}

/**
 * Construye el estado inicial a partir de un lote existente (modo corrección).
 *
 * @param {Object} lote
 * @returns {Object}
 */
function estadoDesdeLote(lote) {
  return {
    nombre:           lote.nombre           ?? '',
    cantidad:         lote.cantidad != null ? String(lote.cantidad) : '',
    unidad:           lote.unidad           ?? '',
    fechaVencimiento: lote.fechaVencimiento ?? '',
    fechaRecepcion:   lote.fechaRecepcion   ?? '',
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FormularioDonacion({ loteInicial = null, onGuardar, onCancelar }) {
  const esCorreccion = loteInicial != null

  const [campos, setCampos] = useState(
    esCorreccion ? estadoDesdeLote(loteInicial) : ESTADO_INICIAL
  )
  const [errores, setErrores] = useState({})

  // ── Manejadores de campo ────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target
    setCampos((prev) => ({ ...prev, [name]: value }))
    // Limpiar el error del campo cuando el usuario lo modifica.
    if (errores[name]) {
      setErrores((prev) => {
        const copia = { ...prev }
        delete copia[name]
        return copia
      })
    }
  }

  // ── Envío ───────────────────────────────────────────────────────────────

  function handleSubmit(e) {
    e.preventDefault()

    const entrada = {
      nombre:           campos.nombre,
      cantidad:         campos.cantidad === '' ? '' : Number(campos.cantidad),
      unidad:           campos.unidad,
      fechaVencimiento: campos.fechaVencimiento,
      fechaRecepcion:   campos.fechaRecepcion,
    }

    const { valido, errores: erroresValidacion } = validarLote(entrada)

    if (!valido) {
      setErrores(erroresValidacion)
      return
    }

    setErrores({})
    onGuardar(entrada)
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const titulo = esCorreccion ? 'Corregir lote' : 'Registrar donación'

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-[var(--color-superficie)] rounded-xl p-6 shadow-sm max-w-lg w-full space-y-5"
    >
      <h2 className="text-xl font-bold text-[var(--color-texto)]">{titulo}</h2>

      {/* ── Nombre ──────────────────────────────────────────────────────── */}
      <Campo
        id="nombre"
        etiqueta="Nombre del alimento"
        requerido
        error={errores.nombre}
      >
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={campos.nombre}
          onChange={handleChange}
          maxLength={80}
          placeholder="Ej.: Arroz"
          className={inputClase(errores.nombre)}
          aria-describedby={errores.nombre ? 'error-nombre' : undefined}
          aria-required="true"
        />
        <MensajeError id="error-nombre" mensaje={errores.nombre} />
      </Campo>

      {/* ── Cantidad ────────────────────────────────────────────────────── */}
      <Campo
        id="cantidad"
        etiqueta="Cantidad"
        requerido
        error={errores.cantidad}
      >
        <input
          id="cantidad"
          name="cantidad"
          type="number"
          min="0"
          step="any"
          value={campos.cantidad}
          onChange={handleChange}
          placeholder="Ej.: 2.5"
          className={inputClase(errores.cantidad)}
          aria-describedby={errores.cantidad ? 'error-cantidad' : undefined}
          aria-required="true"
        />
        <MensajeError id="error-cantidad" mensaje={errores.cantidad} />
      </Campo>

      {/* ── Unidad ──────────────────────────────────────────────────────── */}
      <Campo
        id="unidad"
        etiqueta="Unidad"
        requerido
        error={errores.unidad}
      >
        <select
          id="unidad"
          name="unidad"
          value={campos.unidad}
          onChange={handleChange}
          className={inputClase(errores.unidad)}
          aria-describedby={errores.unidad ? 'error-unidad' : undefined}
          aria-required="true"
        >
          <option value="">Seleccionar unidad</option>
          {UNIDADES.map(({ valor, etiqueta }) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
        <MensajeError id="error-unidad" mensaje={errores.unidad} />
      </Campo>

      {/* ── Fecha de vencimiento ────────────────────────────────────────── */}
      <Campo
        id="fechaVencimiento"
        etiqueta="Fecha de vencimiento"
        requerido
        error={errores.fechaVencimiento}
      >
        <input
          id="fechaVencimiento"
          name="fechaVencimiento"
          type="date"
          value={campos.fechaVencimiento}
          onChange={handleChange}
          className={inputClase(errores.fechaVencimiento)}
          aria-describedby={errores.fechaVencimiento ? 'error-fechaVencimiento' : undefined}
          aria-required="true"
        />
        <MensajeError id="error-fechaVencimiento" mensaje={errores.fechaVencimiento} />
      </Campo>

      {/* ── Fecha de recepción ──────────────────────────────────────────── */}
      <Campo
        id="fechaRecepcion"
        etiqueta="Fecha de recepción"
        requerido={esCorreccion}
        error={errores.fechaRecepcion}
      >
        {!esCorreccion && (
          <p className="text-sm text-[var(--color-texto-secundario)] mb-1">
            Opcional. Si se deja vacía, se usará la fecha de hoy.
          </p>
        )}
        <input
          id="fechaRecepcion"
          name="fechaRecepcion"
          type="date"
          value={campos.fechaRecepcion}
          onChange={handleChange}
          className={inputClase(errores.fechaRecepcion)}
          aria-describedby={errores.fechaRecepcion ? 'error-fechaRecepcion' : undefined}
          aria-required={esCorreccion ? 'true' : 'false'}
        />
        <MensajeError id="error-fechaRecepcion" mensaje={errores.fechaRecepcion} />
      </Campo>

      {/* ── Acciones ────────────────────────────────────────────────────── */}
      <div className="flex gap-3 justify-end pt-2">
        <Boton
          type="button"
          variante="secundaria"
          onClick={onCancelar}
        >
          Cancelar
        </Boton>
        <Boton
          type="submit"
          variante="principal"
        >
          {esCorreccion ? 'Guardar cambios' : 'Registrar'}
        </Boton>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponentes locales
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Envuelve un campo con su etiqueta y el espacio para el error.
 */
function Campo({ id, etiqueta, requerido, error, children }) {
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
    <p
      id={id}
      role="alert"
      className="text-sm text-red-600 mt-0.5"
    >
      {mensaje}
    </p>
  )
}

/**
 * Clases del input, con variante de error.
 */
function inputClase(error) {
  const base =
    'w-full rounded-lg border px-3 py-2 text-base ' +
    'bg-[var(--color-superficie)] text-[var(--color-texto)] ' +
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-hoja)] ' +
    'transition-colors'
  const estado = error
    ? 'border-red-500'
    : 'border-[var(--color-hoja)]'
  return `${base} ${estado}`
}
