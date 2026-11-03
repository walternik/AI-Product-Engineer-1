// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import EntregasPage from './EntregasPage.jsx'

const HOY = '2026-11-03'

const LOTES = [
  {
    id: 'arroz',
    nombre: 'Arroz',
    cantidad: 5,
    unidad: 'kilogramos',
    fechaRecepcion: '2026-11-01',
    fechaVencimiento: '2026-11-20',
  },
]

function Pantalla() {
  const [entregas, setEntregas] = useState([])

  function guardar(entrada) {
    setEntregas([
      {
        id: 'nueva',
        familia: entrada.familia,
        nombreAlimento: 'Arroz',
        cantidad: entrada.cantidad,
        unidad: 'kilogramos',
        fechaVencimiento: '2026-11-20',
        fechaEntrega: HOY,
        secuencia: 1,
      },
    ])
  }

  return (
    <EntregasPage
      lotes={LOTES}
      hoy={HOY}
      entregas={entregas}
      onGuardar={guardar}
      onAnular={() => {}}
    />
  )
}

describe('EntregasPage', () => {
  it('muestra la entrega en el historial de la misma pantalla después de guardarla', async () => {
    render(<Pantalla />)

    await userEvent.click(screen.getByRole('button', { name: /arroz/i }))
    await userEvent.type(screen.getByLabelText(/familia/i), 'Familia Gómez')
    await userEvent.type(screen.getByLabelText(/cantidad/i), '1')
    await userEvent.click(screen.getByRole('button', { name: /registrar entrega/i }))

    expect(screen.getByRole('table')).toHaveTextContent('Familia Gómez')
    expect(screen.getByRole('table')).toHaveTextContent('Arroz')
  })
})
