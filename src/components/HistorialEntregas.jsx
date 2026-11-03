/**
 * HistorialEntregas — lista las entregas y pide confirmación antes de anular.
 *
 * Props:
 *   - entregas: arreglo de entregas guardadas.
 *   - onAnular(id): llamado solo cuando el voluntario confirma la anulación.
 */

import { useState } from 'react'
import Boton from './Boton.jsx'
import DialogoConfirmar from './DialogoConfirmar.jsx'

function formatearCantidad(numero) {
  return numero.toLocaleString('es')
}

function abreviarUnidad(unidad) {
  if (unidad === 'kilogramos') return 'kg'
  if (unidad === 'litros') return 'l'
  return 'unidades'
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function ordenarEntregas(entregas) {
  return [...entregas].sort((a, b) => {
    if (a.fechaEntrega > b.fechaEntrega) return -1
    if (a.fechaEntrega < b.fechaEntrega) return 1
    return (a.secuencia ?? 0) - (b.secuencia ?? 0)
  })
}

export default function HistorialEntregas({ entregas = [], onAnular }) {
  const [entregaAAnular, setEntregaAAnular] = useState(null)
  const lista = ordenarEntregas(entregas)

  function confirmarAnulacion() {
    if (entregaAAnular) onAnular(entregaAAnular.id)
    setEntregaAAnular(null)
  }

  return (
    <section className="bg-[var(--color-superficie)] rounded-xl p-6 shadow-sm w-full">
      <h2 className="text-xl font-bold text-[var(--color-texto)] mb-4">
        Entregas registradas
      </h2>

      {lista.length === 0 ? (
        <p role="status" className="text-base text-[var(--color-texto-secundario)]">
          Todavía no hay entregas registradas. Completá el formulario de arriba para anotar la primera.
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-hoja)] text-white">
                  <th className="px-4 py-3 font-semibold rounded-tl-lg">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Familia</th>
                  <th className="px-4 py-3 font-semibold">Alimento</th>
                  <th className="px-4 py-3 font-semibold text-right">Cantidad</th>
                  <th className="px-4 py-3 font-semibold">Unidad</th>
                  <th className="px-4 py-3 font-semibold">Vencimiento</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((entrega) => (
                  <tr key={entrega.id} className="border-b border-[var(--color-hoja)]/10">
                    <td className="px-4 py-3">{formatearFecha(entrega.fechaEntrega)}</td>
                    <td className="px-4 py-3 font-medium">{entrega.familia}</td>
                    <td className="px-4 py-3">{entrega.nombreAlimento}</td>
                    <td className="px-4 py-3 text-right">{formatearCantidad(entrega.cantidad)}</td>
                    <td className="px-4 py-3">{abreviarUnidad(entrega.unidad)}</td>
                    <td className="px-4 py-3">{formatearFecha(entrega.fechaVencimiento)}</td>
                    <td className="px-4 py-3 text-right">
                      <Boton
                        variante="secundaria"
                        onClick={() => setEntregaAAnular(entrega)}
                        className="text-sm px-3 py-1.5 min-h-[36px]"
                      >
                        Anular
                      </Boton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-4 md:hidden" role="list">
            {lista.map((entrega) => (
              <li
                key={entrega.id}
                className="rounded-xl border border-[var(--color-hoja)]/10 p-4"
              >
                <p className="font-bold text-[var(--color-texto)]">{entrega.familia}</p>
                <p className="text-sm text-[var(--color-texto-secundario)] mt-1">
                  {formatearFecha(entrega.fechaEntrega)} · {entrega.nombreAlimento} ·{' '}
                  {formatearCantidad(entrega.cantidad)} {abreviarUnidad(entrega.unidad)}
                </p>
                <p className="text-sm text-[var(--color-texto-secundario)]">
                  Vence {formatearFecha(entrega.fechaVencimiento)}
                </p>
                <div className="mt-3 flex justify-end">
                  <Boton variante="secundaria" onClick={() => setEntregaAAnular(entrega)}>
                    Anular
                  </Boton>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <DialogoConfirmar
        abierto={entregaAAnular != null}
        loteNombre={entregaAAnular?.familia ?? ''}
        titulo="Anular entrega"
        descripcion={
          entregaAAnular
            ? `¿Querés anular la entrega a ${entregaAAnular.familia}? La cantidad vuelve al stock.`
            : ''
        }
        onConfirmar={confirmarAnulacion}
        onCancelar={() => setEntregaAAnular(null)}
      />
    </section>
  )
}
