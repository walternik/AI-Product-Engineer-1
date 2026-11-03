// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import FormularioEntrega from './FormularioEntrega.jsx'

const HOY = '2026-11-03'

const LOTES = [
  {
    id: 'leche',
    nombre: 'Leche',
    cantidad: 2,
    unidad: 'litros',
    fechaRecepcion: '2026-10-20',
    fechaVencimiento: '2026-11-01',
  },
  {
    id: 'arroz',
    nombre: 'Arroz',
    cantidad: 5,
    unidad: 'kilogramos',
    fechaRecepcion: '2026-11-01',
    fechaVencimiento: '2026-12-20',
  },
]

describe('FormularioEntrega', () => {
  it('muestra el lote que vence antes primero y deshabilita el vencido', () => {
    render(
      <FormularioEntrega lotes={LOTES} hoy={HOY} onGuardar={vi.fn()} />
    )

    const opciones = screen.getAllByRole('button').filter((boton) =>
      boton.textContent.includes('Leche') || boton.textContent.includes('Arroz')
    )

    expect(opciones[0]).toHaveTextContent('Leche')
    expect(opciones[1]).toHaveTextContent('Arroz')
    expect(opciones[0]).toBeDisabled()
    expect(screen.getByText('No se entrega alimento vencido.')).toBeInTheDocument()
    expect(screen.getByText('Vencido')).toBeInTheDocument()
    expect(screen.getByText('En buen estado')).toBeInTheDocument()
  })

  it('al enviar sin familia muestra el error junto al campo y no guarda', async () => {
    const onGuardar = vi.fn()
    render(
      <FormularioEntrega lotes={LOTES} hoy={HOY} onGuardar={onGuardar} />
    )

    await userEvent.click(screen.getByRole('button', { name: /arroz/i }))
    await userEvent.click(screen.getByRole('button', { name: /registrar entrega/i }))

    expect(screen.getByText('El nombre de la familia es obligatorio.')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('al enviar una entrega válida llama a onGuardar con el lote elegido', async () => {
    const onGuardar = vi.fn()
    render(
      <FormularioEntrega lotes={LOTES} hoy={HOY} onGuardar={onGuardar} />
    )

    await userEvent.click(screen.getByRole('button', { name: /arroz/i }))
    await userEvent.type(screen.getByLabelText(/familia/i), 'Familia Gómez')
    await userEvent.type(screen.getByLabelText(/cantidad/i), '1.5')
    await userEvent.click(screen.getByRole('button', { name: /registrar entrega/i }))

    expect(onGuardar).toHaveBeenCalledOnce()
    expect(onGuardar).toHaveBeenCalledWith({
      loteId: 'arroz',
      familia: 'Familia Gómez',
      cantidad: 1.5,
      fecha: '',
    })
  })
})
