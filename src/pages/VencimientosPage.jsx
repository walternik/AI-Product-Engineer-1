/**
 * VencimientosPage — pantalla de vencimientos.
 *
 * Separa los lotes en dos grupos:
 *   1. «Próximos a vencer» — estado "proximo-a-vencer".
 *   2. «Vencidos» — estado "vencido".
 *
 * Cada grupo se ordena por fechaVencimiento ascendente y muestra su propio
 * estado vacío cuando no tiene lotes.
 *
 * Props:
 *   - lotes: todos los lotes (sin ordenar; la página filtra y ordena).
 *   - hoy: fecha actual en formato "YYYY-MM-DD".
 *   - onEditar(lote): llamado al pulsar Editar en un lote.
 *   - onEliminar(loteId): llamado al pulsar Eliminar en un lote.
 *
 * Requisitos: 3.4, 3.5, 3.7, 6.1, 6.2
 */

import ListadoLotes from '../components/ListadoLotes.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import { estadoDeLote } from '../utils/vencimiento.js'
import { ordenarLotes } from '../utils/ordenarLotes.js'

export default function VencimientosPage({ lotes, hoy, onEditar, onEliminar }) {
  // Clasificar y ordenar cada grupo por fechaVencimiento ascendente.
  const proximosAVencer = ordenarLotes(
    (lotes ?? []).filter((l) => estadoDeLote(l.fechaVencimiento, hoy) === 'proximo-a-vencer')
  )

  const vencidos = ordenarLotes(
    (lotes ?? []).filter((l) => estadoDeLote(l.fechaVencimiento, hoy) === 'vencido')
  )

  return (
    <main className="flex flex-col gap-8 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)]">Vencimientos</h1>

      {/* Grupo: Próximos a vencer */}
      <section aria-labelledby="titulo-proximos">
        <h2
          id="titulo-proximos"
          className="text-lg font-bold text-[var(--color-texto)] mb-3"
        >
          Próximos a vencer
        </h2>

        {proximosAVencer.length > 0 ? (
          <ListadoLotes
            lotes={proximosAVencer}
            hoy={hoy}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ) : (
          <EstadoVacio tipo="proximo-a-vencer" />
        )}
      </section>

      {/* Grupo: Vencidos */}
      <section aria-labelledby="titulo-vencidos">
        <h2
          id="titulo-vencidos"
          className="text-lg font-bold text-[var(--color-texto)] mb-3"
        >
          Vencidos
        </h2>

        {vencidos.length > 0 ? (
          <ListadoLotes
            lotes={vencidos}
            hoy={hoy}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ) : (
          <EstadoVacio tipo="vencido" />
        )}
      </section>
    </main>
  )
}
