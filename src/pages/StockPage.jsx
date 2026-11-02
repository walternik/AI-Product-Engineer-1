/**
 * StockPage — pantalla principal de stock.
 *
 * Muestra el resumen de totales agrupados, el listado completo de lotes y,
 * cuando no hay lotes, el estado vacío con el enlace al registro.
 *
 * Props:
 *   - lotes: arreglo de lotes ya ordenados por fechaVencimiento ascendente.
 *   - hoy: fecha actual en formato "YYYY-MM-DD".
 *   - onEditar(lote): llamado al pulsar Editar en un lote.
 *   - onEliminar(loteId): llamado al pulsar Eliminar en un lote.
 *   - onRegistrar(): llamado al pulsar el enlace de registro en el estado vacío.
 *
 * Requisitos: 2.1, 2.3, 2.4, 6.1, 6.2
 */

import ResumenStock from '../components/ResumenStock.jsx'
import ListadoLotes from '../components/ListadoLotes.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import { agruparTotales } from '../utils/agruparTotales.js'

export default function StockPage({ lotes, hoy, onEditar, onEliminar, onRegistrar }) {
  const hayLotes = lotes && lotes.length > 0
  const totales = hayLotes ? agruparTotales(lotes) : []

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)]">Stock</h1>

      {hayLotes ? (
        <>
          <ResumenStock totales={totales} />
          <ListadoLotes
            lotes={lotes}
            hoy={hoy}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        </>
      ) : (
        <EstadoVacio tipo="stock" onRegistrar={onRegistrar} />
      )}
    </main>
  )
}
