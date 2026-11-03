/**
 * EntregasPage — formulario de entrega arriba e historial abajo.
 *
 * Props:
 *   - lotes: stock actual.
 *   - hoy: fecha local YYYY-MM-DD.
 *   - entregas: historial guardado.
 *   - onGuardar(entrada): persiste una entrega válida.
 *   - onAnular(id): anula una entrega confirmada.
 */

import FormularioEntrega from '../components/FormularioEntrega.jsx'
import HistorialEntregas from '../components/HistorialEntregas.jsx'

export default function EntregasPage({ lotes, hoy, entregas, onGuardar, onAnular }) {
  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)]">Entregas</h1>
      <FormularioEntrega lotes={lotes} hoy={hoy} onGuardar={onGuardar} />
      <HistorialEntregas entregas={entregas} onAnular={onAnular} />
    </main>
  )
}
