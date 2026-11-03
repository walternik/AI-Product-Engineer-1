// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import HistorialEntregas from './HistorialEntregas.jsx'

const ENTREGAS = [
  {
    id: 'vieja',
    familia: 'Pérez',
    nombreAlimento: 'Fideos',
    cantidad: 2,
    unidad: 'unidades',
    fechaVencimiento: '2026-12-01',
    fechaEntrega: '2026-11-01',
    secuencia: 1,
  },
  {
    id: 'tarde',
    familia: 'Gómez',
    nombreAlimento: 'Arroz',
    cantidad: 1.5,
    unidad: 'kilogramos',
    fechaVencimiento: '2026-11-08',
    fechaEntrega: '2026-11-03',
    secuencia: 2,
  },
  {
    id: 'temprano',
    familia: 'López',
    nombreAlimento: 'Leche',
    cantidad: 1,
    unidad: 'litros',
    fechaVencimiento: '2026-11-05',
    fechaEntrega: '2026-11-03',
    secuencia: 1,
  },
]

describe('HistorialEntregas', () => {
  it('explica cómo registrar la primera entrega cuando no hay historial', () => {
    render(<HistorialEntregas entregas={[]} onAnular={vi.fn()} />)

    expect(
      screen.getByText(/todavía no hay entregas registradas/i)
    ).toBeInTheDocument()
  })

  it('lista familia, alimento, cantidad y vencimiento con la fecha más reciente primero', () => {
    render(<HistorialEntregas entregas={ENTREGAS} onAnular={vi.fn()} />)

    const filas = screen.getAllByRole('row').slice(1)
    const textos = filas.map((fila) => fila.textContent)

    expect(textos[0]).toContain('López')
    expect(textos[0]).toContain('Leche')
    expect(textos[0]).toContain('l')
    expect(textos[0]).toContain('05/11/2026')
    expect(textos[1]).toContain('Gómez')
    expect(textos[1]).toContain('Arroz')
    expect(textos[2]).toContain('Pérez')
    expect(textos[2]).toContain('Fideos')
  })

  it('no anula si se cancela la confirmación', async () => {
    const onAnular = vi.fn()
    render(<HistorialEntregas entregas={ENTREGAS} onAnular={onAnular} />)

    const filas = screen.getAllByRole('row').slice(1)
    await userEvent.click(within(filas[0]).getByRole('button', { name: 'Anular' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onAnular).not.toHaveBeenCalled()
  })

  it('anula la entrega cuando se confirma', async () => {
    const onAnular = vi.fn()
    render(<HistorialEntregas entregas={ENTREGAS} onAnular={onAnular} />)

    const filas = screen.getAllByRole('row').slice(1)
    await userEvent.click(within(filas[0]).getByRole('button', { name: 'Anular' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onAnular).toHaveBeenCalledOnce()
    expect(onAnular).toHaveBeenCalledWith('temprano')
  })
})
