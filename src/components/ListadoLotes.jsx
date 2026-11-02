/**
 * ListadoLotes — muestra los lotes como tabla (pantallas amplias) o fichas (pantallas estrechas).
 *
 * Props:
 *   - lotes: arreglo de lotes `{ id, nombre, cantidad, unidad, fechaRecepcion, fechaVencimiento }`,
 *            ya ordenados por fechaVencimiento ascendente.
 *   - hoy: fecha actual en formato "YYYY-MM-DD" (para calcular estadoDeLote).
 *   - onEditar(lote): llamado al pulsar el botón Editar de un lote.
 *   - onEliminar(loteId): llamado al pulsar el botón Eliminar de un lote.
 *
 * Reglas de diseño:
 *   - Todos los lotes se muestran, incluidos los vencidos (Req 3.7).
 *   - Lotes con igual nombre ocupan filas separadas (Req 2.2).
 *   - La cantidad usa separador decimal en español, sin ceros al final.
 *   - La unidad se abrevia: kilogramos → kg, litros → l, unidades → unidades.
 *   - Las fechas se muestran en formato DD/MM/YYYY.
 *   - En pantallas estrechas (< md) la tabla se reemplaza por fichas con los mismos datos y acciones.
 */

import { estadoDeLote } from '../utils/vencimiento.js'
import EtiquetaEstado from './EtiquetaEstado.jsx'
import Boton from './Boton.jsx'

// ── Helpers de formato ──────────────────────────────────────────────────────

/**
 * Formatea un número con separador decimal español y sin ceros finales.
 * @param {number} numero
 * @returns {string}
 */
function formatearCantidad(numero) {
  // toLocaleString('es') usa coma como separador decimal en español.
  return numero.toLocaleString('es')
}

/**
 * Abrevia el nombre de la unidad según las reglas del diseño.
 * @param {'kilogramos'|'litros'|'unidades'} unidad
 * @returns {string}
 */
function abreviarUnidad(unidad) {
  if (unidad === 'kilogramos') return 'kg'
  if (unidad === 'litros') return 'l'
  return 'unidades'
}

/**
 * Formatea una fecha "YYYY-MM-DD" a "DD/MM/YYYY".
 * @param {string} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

// ── Componente principal ────────────────────────────────────────────────────

export default function ListadoLotes({ lotes, hoy, onEditar, onEliminar }) {
  if (!lotes || lotes.length === 0) return null

  return (
    <>
      {/* Tabla para pantallas amplias (md en adelante) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-hoja)] text-white">
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Alimento</th>
              <th className="px-4 py-3 font-semibold text-right">Cantidad</th>
              <th className="px-4 py-3 font-semibold">Unidad</th>
              <th className="px-4 py-3 font-semibold">Recepción</th>
              <th className="px-4 py-3 font-semibold">Vencimiento</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((lote, indice) => {
              const estado = estadoDeLote(lote.fechaVencimiento, hoy)
              const esPar = indice % 2 === 0
              return (
                <tr
                  key={lote.id}
                  className={`border-b border-[var(--color-hoja)]/10 ${esPar ? 'bg-[var(--color-superficie)]' : 'bg-[var(--color-fondo)]/40'}`}
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-texto)]">{lote.nombre}</td>
                  <td className="px-4 py-3 text-right text-[var(--color-texto)]">
                    {formatearCantidad(lote.cantidad)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-secundario)]">
                    {abreviarUnidad(lote.unidad)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-secundario)]">
                    {formatearFecha(lote.fechaRecepcion)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-secundario)]">
                    {formatearFecha(lote.fechaVencimiento)}
                  </td>
                  <td className="px-4 py-3">
                    <EtiquetaEstado estado={estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Boton
                        variante="secundaria"
                        onClick={() => onEditar(lote)}
                        className="text-sm px-3 py-1.5 min-h-[36px]"
                      >
                        Editar
                      </Boton>
                      <Boton
                        variante="destructiva"
                        onClick={() => onEliminar(lote.id)}
                        className="text-sm px-3 py-1.5 min-h-[36px]"
                      >
                        Eliminar
                      </Boton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Fichas para pantallas estrechas (< md) */}
      <ul className="flex flex-col gap-4 md:hidden" role="list">
        {lotes.map((lote) => {
          const estado = estadoDeLote(lote.fechaVencimiento, hoy)
          return (
            <li
              key={lote.id}
              className="bg-[var(--color-superficie)] rounded-xl shadow-sm border border-[var(--color-hoja)]/10 p-4"
            >
              {/* Cabecera de la ficha */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-[var(--color-texto)]">{lote.nombre}</h3>
                <EtiquetaEstado estado={estado} />
              </div>

              {/* Datos del lote */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                <dt className="text-[var(--color-texto-secundario)] font-medium">Cantidad</dt>
                <dd className="text-[var(--color-texto)] text-right">
                  {formatearCantidad(lote.cantidad)} {abreviarUnidad(lote.unidad)}
                </dd>

                <dt className="text-[var(--color-texto-secundario)] font-medium">Recepción</dt>
                <dd className="text-[var(--color-texto)] text-right">
                  {formatearFecha(lote.fechaRecepcion)}
                </dd>

                <dt className="text-[var(--color-texto-secundario)] font-medium">Vencimiento</dt>
                <dd className="text-[var(--color-texto)] text-right">
                  {formatearFecha(lote.fechaVencimiento)}
                </dd>
              </dl>

              {/* Acciones */}
              <div className="flex gap-2 justify-end">
                <Boton
                  variante="secundaria"
                  onClick={() => onEditar(lote)}
                  className="text-sm flex-1"
                >
                  Editar
                </Boton>
                <Boton
                  variante="destructiva"
                  onClick={() => onEliminar(lote.id)}
                  className="text-sm flex-1"
                >
                  Eliminar
                </Boton>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
