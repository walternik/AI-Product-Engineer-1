// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import ResumenStock from './ResumenStock.jsx'

// ── Totales de ejemplo ───────────────────────────────────────────────────────

const totales = [
  { nombre: 'Arroz', unidad: 'kilogramos', total: 3.5 },
  { nombre: 'Leche', unidad: 'litros', total: 6 },
  { nombre: 'Conservas', unidad: 'unidades', total: 24 },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ResumenStock', () => {
  it('no renderiza nada si el arreglo de totales está vacío', () => {
    const { container } = render(<ResumenStock totales={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('muestra el título "Total disponible"', () => {
    render(<ResumenStock totales={totales} />)
    expect(screen.getByText('Total disponible')).toBeInTheDocument()
  })

  it('muestra cada nombre de alimento (Req 2.5)', () => {
    render(<ResumenStock totales={totales} />)
    expect(screen.getByText('Arroz')).toBeInTheDocument()
    expect(screen.getByText('Leche')).toBeInTheDocument()
    expect(screen.getByText('Conservas')).toBeInTheDocument()
  })

  it('formatea el total con separador decimal español', () => {
    render(<ResumenStock totales={totales} />)
    // 3.5 → "3,5" en español
    expect(screen.getByText('3,5')).toBeInTheDocument()
  })

  it('muestra números enteros sin decimales', () => {
    render(<ResumenStock totales={totales} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('abrevia "kilogramos" como "kg"', () => {
    render(<ResumenStock totales={[{ nombre: 'Arroz', unidad: 'kilogramos', total: 1 }]} />)
    expect(screen.getByText('kg')).toBeInTheDocument()
  })

  it('abrevia "litros" como "l"', () => {
    render(<ResumenStock totales={[{ nombre: 'Leche', unidad: 'litros', total: 2 }]} />)
    expect(screen.getByText('l')).toBeInTheDocument()
  })

  it('muestra "unidades" sin abreviar', () => {
    render(<ResumenStock totales={[{ nombre: 'Conservas', unidad: 'unidades', total: 5 }]} />)
    expect(screen.getByText('unidades')).toBeInTheDocument()
  })

  it('muestra una entrada por cada par nombre+unidad (Req 2.5)', () => {
    render(<ResumenStock totales={totales} />)
    const elementos = screen.getAllByRole('listitem')
    expect(elementos).toHaveLength(totales.length)
  })
})
