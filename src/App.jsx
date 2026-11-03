/**
 * App — raíz de la SPA Manos a la Obra.
 *
 * Gestiona la navegación por estado (sin router), el diálogo de confirmación
 * de borrado y el aviso de error de lectura o escritura.
 *
 * Vistas posibles: "stock" | "vencimientos" | "registrar" | "entregas"
 * La vista inicial es "stock".
 *
 * Requirements: 1.2, 4.1, 4.3, 4.4, 4.5, 5.1, 5.4, 5.5, 6.2, 6.6
 */

import { useState } from 'react'
import { useLotes } from './hooks/useLotes.js'
import { useEntregas } from './hooks/useEntregas.js'
import { fechaLocalHoy } from './utils/fechas.js'
import Marca from './components/Marca.jsx'
import Navegacion from './components/Navegacion.jsx'
import AvisoError from './components/AvisoError.jsx'
import DialogoConfirmar from './components/DialogoConfirmar.jsx'
import StockPage from './pages/StockPage.jsx'
import VencimientosPage from './pages/VencimientosPage.jsx'
import DonacionFormPage from './pages/DonacionFormPage.jsx'
import EntregasPage from './pages/EntregasPage.jsx'

const MENSAJES_ENTREGA = {
  lectura: 'No se pudieron leer las entregas guardadas.',
  escritura:
    'No se pudo guardar el cambio. El stock y las entregas siguen como estaban.',
}

export default function App() {
  // ── Estado de navegación ─────────────────────────────────────────────────
  const [vista, setVista] = useState('stock')

  // ── Lote en edición (null = alta) ────────────────────────────────────────
  const [loteEnEdicion, setLoteEnEdicion] = useState(null)

  // ── Diálogo de confirmación de borrado ───────────────────────────────────
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [loteAEliminar, setLoteAEliminar] = useState(null)

  // ── Hook central de lotes ────────────────────────────────────────────────
  const { lotes, error, crear, actualizar, eliminar, reemplazarLotes } = useLotes()
  const {
    entregas,
    error: errorEntregas,
    registrar,
    anular,
  } = useEntregas()

  // Fecha de hoy, calculada una vez por render.
  const hoy = fechaLocalHoy()

  // ── Navegación ───────────────────────────────────────────────────────────

  function irA(destino) {
    if (destino !== 'registrar') {
      setLoteEnEdicion(null)
    }
    setVista(destino)
  }

  // ── Acciones de edición ──────────────────────────────────────────────────

  function abrirEdicion(lote) {
    setLoteEnEdicion(lote)
    setVista('registrar')
  }

  // ── Guardar (alta o corrección) ──────────────────────────────────────────

  /**
   * Llama a crear o actualizar según si hay lote en edición.
   * Si la operación es válida (ok: true), navega a Stock.
   * Si hay errores de validación (ok: false), devuelve los errores para que
   * FormularioDonacion los muestre y permanezca en el formulario.
   *
   * @param {object} entrada
   * @returns {{ ok: true } | { ok: false, errores: object }}
   */
  function handleGuardar(entrada) {
    let resultado

    if (loteEnEdicion) {
      resultado = actualizar(loteEnEdicion.id, entrada)
    } else {
      resultado = crear(entrada)
    }

    if (resultado.ok) {
      setLoteEnEdicion(null)
      setVista('stock')
    }

    return resultado
  }

  // ── Cancelar formulario ──────────────────────────────────────────────────

  function handleCancelar() {
    setLoteEnEdicion(null)
    setVista('stock')
  }

  // ── Eliminar con confirmación ─────────────────────────────────────────────

  function pedirConfirmacionEliminar(loteId) {
    const lote = lotes.find((l) => l.id === loteId)
    setLoteAEliminar(lote ?? { id: loteId, nombre: '' })
    setDialogoAbierto(true)
  }

  function confirmarEliminar() {
    if (loteAEliminar) {
      eliminar(loteAEliminar.id)
    }
    setDialogoAbierto(false)
    setLoteAEliminar(null)
  }

  function cancelarEliminar() {
    setDialogoAbierto(false)
    setLoteAEliminar(null)
  }

  function handleRegistrarEntrega(entrada) {
    const resultado = registrar(entrada)
    if (resultado.ok && resultado.lotes) {
      reemplazarLotes(resultado.lotes)
    }
    return resultado
  }

  function handleAnularEntrega(id) {
    const resultado = anular(id)
    if (resultado.ok && resultado.lotes) {
      reemplazarLotes(resultado.lotes)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: 'var(--color-fondo)' }}
    >
      {/* Cabecera con marca y navegación */}
      <header
        className="sticky top-0 z-40 bg-[var(--color-superficie)] shadow-sm"
      >
        <div className="mx-auto max-w-3xl px-4 py-3 flex flex-col gap-3">
          <Marca />
          <Navegacion vistaActual={vista} onNavegar={irA} />
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 mx-auto w-full max-w-3xl flex flex-col gap-4 px-0">
        {/* Aviso de error (lectura o escritura) */}
        {(error || errorEntregas) && (
          <div className="px-4 pt-4 flex flex-col gap-3">
            {error && <AvisoError tipo={error} />}
            {errorEntregas && (
              <AvisoError
                tipo={errorEntregas}
                mensaje={MENSAJES_ENTREGA[errorEntregas]}
              />
            )}
          </div>
        )}

        {/* Pantallas */}
        {vista === 'stock' && (
          <StockPage
            lotes={lotes}
            hoy={hoy}
            onEditar={abrirEdicion}
            onEliminar={pedirConfirmacionEliminar}
            onRegistrar={() => irA('registrar')}
          />
        )}

        {vista === 'vencimientos' && (
          <VencimientosPage
            lotes={lotes}
            hoy={hoy}
            onEditar={abrirEdicion}
            onEliminar={pedirConfirmacionEliminar}
          />
        )}

        {vista === 'registrar' && (
          <DonacionFormPage
            loteInicial={loteEnEdicion}
            onGuardar={handleGuardar}
            onCancelar={handleCancelar}
          />
        )}

        {vista === 'entregas' && (
          <EntregasPage
            lotes={lotes}
            hoy={hoy}
            entregas={entregas}
            onGuardar={handleRegistrarEntrega}
            onAnular={handleAnularEntrega}
          />
        )}
      </div>

      {/* Diálogo de confirmación de borrado */}
      <DialogoConfirmar
        abierto={dialogoAbierto}
        loteNombre={loteAEliminar?.nombre ?? ''}
        onConfirmar={confirmarEliminar}
        onCancelar={cancelarEliminar}
      />
    </div>
  )
}
