/**
 * useEntregas — carga el historial y expone registrar y anular.
 *
 * No siembra entregas de demostración. Un fallo de lectura o escritura
 * conserva la lista que ya estaba en memoria.
 */

import { useState, useEffect } from 'react'
import {
  obtenerEntregas,
  registrarEntrega,
  anularEntrega,
} from '../services/entregas.js'

export function useEntregas() {
  const [entregas, setEntregas] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const resultado = obtenerEntregas()

    if (!resultado.ok) {
      setEntregas([])
      setError('lectura')
      return
    }

    setEntregas(resultado.entregas)
    setError(null)
  }, [])

  function registrar(entrada) {
    const resultado = registrarEntrega(entrada)

    if (resultado.errores) {
      return { ok: false, errores: resultado.errores }
    }

    if (!resultado.ok) {
      setError(resultado.error)
      return { ok: false, error: resultado.error }
    }

    setEntregas(resultado.entregas)
    setError(null)
    return { ok: true, entregas: resultado.entregas, lotes: resultado.lotes }
  }

  function anular(id) {
    const resultado = anularEntrega(id)

    if (!resultado.ok) {
      setError(resultado.error)
      return { ok: false, error: resultado.error }
    }

    setEntregas(resultado.entregas)
    setError(null)
    return { ok: true, entregas: resultado.entregas, lotes: resultado.lotes }
  }

  return { entregas, error, registrar, anular }
}
