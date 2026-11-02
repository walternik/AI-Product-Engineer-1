// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import FormularioDonacion from './FormularioDonacion.jsx'

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Rellena el formulario con datos válidos de alta.
 */
function rellenarFormularioValido() {
  fireEvent.change(screen.getByLabelText(/nombre del alimento/i), {
    target: { name: 'nombre', value: 'Arroz' },
  })
  fireEvent.change(screen.getByLabelText(/cantidad/i), {
    target: { name: 'cantidad', value: '2' },
  })
  fireEvent.change(screen.getByLabelText(/unidad/i), {
    target: { name: 'unidad', value: 'kilogramos' },
  })
  fireEvent.change(screen.getByLabelText(/fecha de vencimiento/i), {
    target: { name: 'fechaVencimiento', value: '2030-12-31' },
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FormularioDonacion — alta', () => {
  it('al enviar el formulario vacío muestra el error de nombre en español y no llama a onGuardar', () => {
    const onGuardar = vi.fn()
    const onCancelar = vi.fn()

    render(<FormularioDonacion onGuardar={onGuardar} onCancelar={onCancelar} />)

    fireEvent.submit(screen.getByRole('button', { name: /registrar/i }).closest('form'))

    // El mensaje de error de nombre debe aparecer junto al campo.
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    // No debe llamar al guardado.
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('al enviar con cantidad 0 muestra el error de cantidad en español y no llama a onGuardar', () => {
    const onGuardar = vi.fn()
    const onCancelar = vi.fn()

    render(<FormularioDonacion onGuardar={onGuardar} onCancelar={onCancelar} />)

    fireEvent.change(screen.getByLabelText(/nombre del alimento/i), {
      target: { name: 'nombre', value: 'Lentejas' },
    })
    fireEvent.change(screen.getByLabelText(/cantidad/i), {
      target: { name: 'cantidad', value: '0' },
    })
    fireEvent.change(screen.getByLabelText(/unidad/i), {
      target: { name: 'unidad', value: 'kilogramos' },
    })
    fireEvent.change(screen.getByLabelText(/fecha de vencimiento/i), {
      target: { name: 'fechaVencimiento', value: '2030-12-31' },
    })

    fireEvent.submit(screen.getByRole('button', { name: /registrar/i }).closest('form'))

    expect(screen.getByText('La cantidad debe ser mayor que cero.')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('al enviar con datos válidos llama a onGuardar con los datos del formulario', () => {
    const onGuardar = vi.fn()
    const onCancelar = vi.fn()

    render(<FormularioDonacion onGuardar={onGuardar} onCancelar={onCancelar} />)

    rellenarFormularioValido()

    fireEvent.submit(screen.getByRole('button', { name: /registrar/i }).closest('form'))

    expect(onGuardar).toHaveBeenCalledOnce()
    const entrada = onGuardar.mock.calls[0][0]
    expect(entrada.nombre).toBe('Arroz')
    expect(entrada.cantidad).toBe(2)
    expect(entrada.unidad).toBe('kilogramos')
    expect(entrada.fechaVencimiento).toBe('2030-12-31')
  })
})

describe('FormularioDonacion — corrección', () => {
  const loteInicial = {
    id: 'abc-123',
    nombre: 'Aceite',
    cantidad: 3,
    unidad: 'litros',
    fechaVencimiento: '2027-06-01',
    fechaRecepcion: '2026-01-15',
  }

  it('en modo corrección precarga todos los campos del lote, incluida la fecha de recepción', () => {
    const onGuardar = vi.fn()
    const onCancelar = vi.fn()

    render(
      <FormularioDonacion
        loteInicial={loteInicial}
        onGuardar={onGuardar}
        onCancelar={onCancelar}
      />
    )

    expect(screen.getByLabelText(/nombre del alimento/i)).toHaveValue('Aceite')
    expect(screen.getByLabelText(/cantidad/i)).toHaveValue(3)
    expect(screen.getByLabelText(/unidad/i)).toHaveValue('litros')
    expect(screen.getByLabelText(/fecha de vencimiento/i)).toHaveValue('2027-06-01')
    expect(screen.getByLabelText(/fecha de recepción/i)).toHaveValue('2026-01-15')
  })
})
