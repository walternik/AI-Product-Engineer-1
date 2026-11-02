// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import DialogoConfirmar from './DialogoConfirmar.jsx'

describe('DialogoConfirmar', () => {
  it('no renderiza nada cuando abierto es false', () => {
    const { container } = render(
      <DialogoConfirmar
        loteNombre="Arroz"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
        abierto={false}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra el nombre del lote para que el voluntario sepa qué va a eliminar', () => {
    render(
      <DialogoConfirmar
        loteNombre="Arroz"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
        abierto={true}
      />
    )
    expect(screen.getByText('Arroz')).toBeInTheDocument()
  })

  it('llama a onCancelar y no a onConfirmar cuando se cancela', async () => {
    const onConfirmar = vi.fn()
    const onCancelar = vi.fn()

    render(
      <DialogoConfirmar
        loteNombre="Lentejas"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
        abierto={true}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancelar).toHaveBeenCalledOnce()
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('llama a onConfirmar cuando se confirma la eliminación', async () => {
    const onConfirmar = vi.fn()
    const onCancelar = vi.fn()

    render(
      <DialogoConfirmar
        loteNombre="Fideos"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
        abierto={true}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onConfirmar).toHaveBeenCalledOnce()
  })
})
