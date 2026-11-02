// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'

import ListadoLotes from './ListadoLotes.jsx'

// ── Lotes de ejemplo ──────────────────────────────────────────────────────────

const HOY = '2026-06-15'

/** Lote en buen estado. */
const loteEnBuenEstado = {
  id: 'a1',
  nombre: 'Arroz',
  cantidad: 2.5,
  unidad: 'kilogramos',
  fechaRecepcion: '2026-06-01',
  fechaVencimiento: '2026-09-01',
}

/** Lote próximo a vencer (dentro de 7 días desde HOY). */
const loteProximoAVencer = {
  id: 'b2',
  nombre: 'Lentejas',
  cantidad: 1,
  unidad: 'kilogramos',
  fechaRecepcion: '2026-06-10',
  fechaVencimiento: '2026-06-20',
}

/** Lote vencido (anterior a HOY). */
const loteVencido = {
  id: 'c3',
  nombre: 'Leche',
  cantidad: 3,
  unidad: 'litros',
  fechaRecepcion: '2026-05-01',
  fechaVencimiento: '2026-06-10',
}

/** Segundo lote de Arroz con diferente vencimiento. */
const loteArroz2 = {
  id: 'd4',
  nombre: 'Arroz',
  cantidad: 1,
  unidad: 'kilogramos',
  fechaRecepcion: '2026-06-12',
  fechaVencimiento: '2026-07-01',
}

const lotes = [loteProximoAVencer, loteVencido, loteEnBuenEstado, loteArroz2]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ListadoLotes', () => {
  it('no renderiza nada si el arreglo de lotes está vacío', () => {
    const { container } = render(
      <ListadoLotes lotes={[]} hoy={HOY} onEditar={vi.fn()} onEliminar={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('muestra todos los lotes, incluidos los vencidos (Req 3.7)', () => {
    render(<ListadoLotes lotes={lotes} hoy={HOY} onEditar={vi.fn()} onEliminar={vi.fn()} />)
    // El componente renderiza tabla + fichas (responsive), por eso Arroz aparece ≥2 veces.
    expect(screen.getAllByText('Arroz').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Lentejas').length).toBeGreaterThanOrEqual(1)
    // El lote vencido "Leche" también debe aparecer.
    expect(screen.getAllByText('Leche').length).toBeGreaterThanOrEqual(1)
  })

  it('muestra dos filas separadas para lotes del mismo alimento (Req 2.2)', () => {
    render(<ListadoLotes lotes={lotes} hoy={HOY} onEditar={vi.fn()} onEliminar={vi.fn()} />)
    // "Arroz" debe aparecer dos veces en la tabla.
    const ocurrenciasArroz = screen.getAllByText('Arroz')
    expect(ocurrenciasArroz.length).toBeGreaterThanOrEqual(2)
  })

  it('muestra la etiqueta "En buen estado" para lotes en buen estado (Req 3.6)', () => {
    render(
      <ListadoLotes
        lotes={[loteEnBuenEstado]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
      />
    )
    expect(screen.getAllByText('En buen estado').length).toBeGreaterThanOrEqual(1)
  })

  it('muestra la etiqueta "Próximo a vencer" para lotes próximos (Req 3.6)', () => {
    render(
      <ListadoLotes
        lotes={[loteProximoAVencer]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
      />
    )
    expect(screen.getAllByText('Próximo a vencer').length).toBeGreaterThanOrEqual(1)
  })

  it('muestra la etiqueta "Vencido" para lotes vencidos (Req 3.6, 3.7)', () => {
    render(
      <ListadoLotes
        lotes={[loteVencido]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
      />
    )
    expect(screen.getAllByText('Vencido').length).toBeGreaterThanOrEqual(1)
  })

  it('formatea la cantidad con separador decimal español', () => {
    render(
      <ListadoLotes
        lotes={[loteEnBuenEstado]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
      />
    )
    // 2.5 en español es "2,5"
    expect(screen.getAllByText('2,5').length).toBeGreaterThanOrEqual(1)
  })

  it('abrevia la unidad "kilogramos" como "kg"', () => {
    render(
      <ListadoLotes
        lotes={[loteEnBuenEstado]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
      />
    )
    expect(screen.getAllByText('kg').length).toBeGreaterThanOrEqual(1)
  })

  it('abrevia la unidad "litros" como "l"', () => {
    render(
      <ListadoLotes
        lotes={[loteVencido]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
      />
    )
    expect(screen.getAllByText('l').length).toBeGreaterThanOrEqual(1)
  })

  it('muestra las fechas en formato DD/MM/YYYY', () => {
    render(
      <ListadoLotes
        lotes={[loteEnBuenEstado]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={vi.fn()}
      />
    )
    // fechaRecepcion "2026-06-01" → "01/06/2026"
    expect(screen.getAllByText('01/06/2026').length).toBeGreaterThanOrEqual(1)
    // fechaVencimiento "2026-09-01" → "01/09/2026"
    expect(screen.getAllByText('01/09/2026').length).toBeGreaterThanOrEqual(1)
  })

  it('llama a onEditar con el lote correcto al pulsar Editar', () => {
    const onEditar = vi.fn()
    render(
      <ListadoLotes
        lotes={[loteEnBuenEstado]}
        hoy={HOY}
        onEditar={onEditar}
        onEliminar={vi.fn()}
      />
    )
    // Pulsar el primer botón "Editar"
    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[0])
    expect(onEditar).toHaveBeenCalledOnce()
    expect(onEditar).toHaveBeenCalledWith(loteEnBuenEstado)
  })

  it('llama a onEliminar con el id correcto al pulsar Eliminar', () => {
    const onEliminar = vi.fn()
    render(
      <ListadoLotes
        lotes={[loteEnBuenEstado]}
        hoy={HOY}
        onEditar={vi.fn()}
        onEliminar={onEliminar}
      />
    )
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    expect(onEliminar).toHaveBeenCalledOnce()
    expect(onEliminar).toHaveBeenCalledWith('a1')
  })

  it('muestra botones Editar y Eliminar en cada lote (Req 6.1)', () => {
    render(
      <ListadoLotes lotes={[loteEnBuenEstado, loteVencido]} hoy={HOY} onEditar={vi.fn()} onEliminar={vi.fn()} />
    )
    // Cada lote tiene un Editar y un Eliminar → 2 lotes × 2 vistas (tabla + fichas) = 4 cada uno
    expect(screen.getAllByRole('button', { name: /editar/i }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByRole('button', { name: /eliminar/i }).length).toBeGreaterThanOrEqual(2)
  })
})
