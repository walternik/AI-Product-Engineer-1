/**
 * useLotes — hook de estado central para Manos a la Obra.
 *
 * Al montar, carga la lista de lotes a través del servicio.
 * Expone crear, actualizar y eliminar como acciones que delegan al servicio
 * y sincronizan la lista en memoria.
 *
 * Devuelve:
 *   - lotes:      lista guardada, ordenada por fechaVencimiento asc y nombre.
 *   - error:      null | "lectura" | "escritura"
 *   - crear(entrada)      → { ok: true } | { ok: false, errores: object }
 *   - actualizar(id, entrada) → { ok: true } | { ok: false, errores: object }
 *   - eliminar(id)        → void
 *
 * Requirements: 1.2, 4.1, 4.3, 4.4, 4.5, 5.1, 5.4, 5.5
 */

import { useState, useEffect } from 'react'
import {
  obtenerLotes,
  guardarLote,
  actualizarLote,
  eliminarLote,
} from '../services/lotes.js'
import { ordenarLotes } from '../utils/ordenarLotes.js'

export function useLotes() {
  const [lotes, setLotes] = useState([])
  const [error, setError] = useState(null)

  // ── Carga inicial ────────────────────────────────────────────────────────

  useEffect(() => {
    const resultado = obtenerLotes()

    if (resultado.tipo === 'fallo-lectura') {
      setLotes([])
      setError('lectura')
      return
    }

    // tipo === 'ok'
    setLotes(ordenarLotes(resultado.lotes))
    setError(null)
  }, [])

  // ── Crear ────────────────────────────────────────────────────────────────

  /**
   * Intenta crear un lote nuevo.
   * @param {object} entrada — campos del lote sin `id`.
   * @returns {{ ok: true } | { ok: false, errores: object }}
   */
  function crear(entrada) {
    const resultado = guardarLote(entrada)

    if (resultado.tipo === 'fallo-validacion') {
      return { ok: false, errores: resultado.errores }
    }

    if (resultado.tipo === 'fallo-escritura') {
      setError('escritura')
      return { ok: true } // La validación pasó; navegamos pero avisamos del fallo.
    }

    // tipo === 'ok'
    setLotes(ordenarLotes(resultado.lotes))
    setError(null)
    return { ok: true }
  }

  // ── Actualizar ───────────────────────────────────────────────────────────

  /**
   * Intenta actualizar un lote existente.
   * @param {string} id
   * @param {object} entrada — campos nuevos del lote (sin `id`).
   * @returns {{ ok: true } | { ok: false, errores: object }}
   */
  function actualizar(id, entrada) {
    const resultado = actualizarLote(id, entrada)

    if (resultado.tipo === 'fallo-validacion') {
      return { ok: false, errores: resultado.errores }
    }

    if (resultado.tipo === 'fallo-escritura') {
      setError('escritura')
      return { ok: true } // Datos válidos; navegamos pero avisamos del fallo.
    }

    if (resultado.tipo === 'no-encontrado') {
      // El lote ya no existe; actualizamos la lista sin ese lote.
      setLotes((prev) => ordenarLotes(prev.filter((l) => l.id !== id)))
      return { ok: true }
    }

    // tipo === 'ok'
    setLotes(ordenarLotes(resultado.lotes))
    setError(null)
    return { ok: true }
  }

  // ── Eliminar ─────────────────────────────────────────────────────────────

  /**
   * Elimina el lote con `id` de la lista y del almacenamiento.
   * @param {string} id
   */
  function eliminar(id) {
    const resultado = eliminarLote(id)

    if (resultado.tipo === 'fallo-escritura') {
      setError('escritura')
      return
    }

    // tipo === 'ok'
    setLotes(ordenarLotes(resultado.lotes))
    setError(null)
  }

  return { lotes, error, crear, actualizar, eliminar }
}
