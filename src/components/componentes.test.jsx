// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import EtiquetaEstado from './EtiquetaEstado.jsx'
import AvisoError from './AvisoError.jsx'

// ── EtiquetaEstado ────────────────────────────────────────────────────────────

describe('EtiquetaEstado', () => {
  it('muestra "En buen estado" cuando el estado es "en-buen-estado"', () => {
    render(<EtiquetaEstado estado="en-buen-estado" />)
    expect(screen.getByText('En buen estado')).toBeInTheDocument()
  })

  it('muestra "Próximo a vencer" cuando el estado es "proximo-a-vencer"', () => {
    render(<EtiquetaEstado estado="proximo-a-vencer" />)
    expect(screen.getByText('Próximo a vencer')).toBeInTheDocument()
  })

  it('muestra "Vencido" cuando el estado es "vencido"', () => {
    render(<EtiquetaEstado estado="vencido" />)
    expect(screen.getByText('Vencido')).toBeInTheDocument()
  })
})

// ── AvisoError ────────────────────────────────────────────────────────────────

describe('AvisoError', () => {
  it('muestra el mensaje de lectura fallida en español', () => {
    render(<AvisoError tipo="lectura" />)
    expect(
      screen.getByText(
        'No se pudieron leer las donaciones guardadas. No se reemplazaron por datos de ejemplo.'
      )
    ).toBeInTheDocument()
  })

  it('muestra el mensaje de escritura fallida en español', () => {
    render(<AvisoError tipo="escritura" />)
    expect(
      screen.getByText(
        'No se pudo guardar el cambio. La información del navegador sigue como estaba.'
      )
    ).toBeInTheDocument()
  })
})
