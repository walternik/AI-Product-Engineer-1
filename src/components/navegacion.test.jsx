// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import Navegacion from './Navegacion.jsx'

// ── Renderizado básico ────────────────────────────────────────────────────

describe('Navegacion — destinos visibles', () => {
  it('muestra las etiquetas de texto de cada sección', () => {
    render(<Navegacion vistaActual="stock" onNavegar={() => {}} />)

    expect(screen.getByText('Stock')).toBeInTheDocument()
    expect(screen.getByText('Vencimientos')).toBeInTheDocument()
    expect(screen.getByText('Registrar')).toBeInTheDocument()
    expect(screen.getByText('Entregas')).toBeInTheDocument()
  })
})

// ── Destino activo ────────────────────────────────────────────────────────

describe('Navegacion — control activo según vistaActual', () => {
  it('marca Stock con aria-current="page" cuando vistaActual="stock"', () => {
    render(<Navegacion vistaActual="stock" onNavegar={() => {}} />)

    const botonStock = screen.getByRole('button', { name: /stock/i })
    expect(botonStock).toHaveAttribute('aria-current', 'page')
  })

  it('no marca Vencimientos ni Registrar cuando vistaActual="stock"', () => {
    render(<Navegacion vistaActual="stock" onNavegar={() => {}} />)

    const botonVencimientos = screen.getByRole('button', { name: /vencimientos/i })
    const botonRegistrar = screen.getByRole('button', { name: /registrar/i })

    expect(botonVencimientos).not.toHaveAttribute('aria-current')
    expect(botonRegistrar).not.toHaveAttribute('aria-current')
  })

  it('marca Vencimientos con aria-current="page" cuando vistaActual="vencimientos"', () => {
    render(<Navegacion vistaActual="vencimientos" onNavegar={() => {}} />)

    const botonVencimientos = screen.getByRole('button', { name: /vencimientos/i })
    expect(botonVencimientos).toHaveAttribute('aria-current', 'page')
  })

  it('no marca Stock ni Registrar cuando vistaActual="vencimientos"', () => {
    render(<Navegacion vistaActual="vencimientos" onNavegar={() => {}} />)

    const botonStock = screen.getByRole('button', { name: /stock/i })
    const botonRegistrar = screen.getByRole('button', { name: /registrar/i })

    expect(botonStock).not.toHaveAttribute('aria-current')
    expect(botonRegistrar).not.toHaveAttribute('aria-current')
  })

  it('marca Registrar con aria-current="page" cuando vistaActual="registrar"', () => {
    render(<Navegacion vistaActual="registrar" onNavegar={() => {}} />)

    const botonRegistrar = screen.getByRole('button', { name: /registrar/i })
    expect(botonRegistrar).toHaveAttribute('aria-current', 'page')
  })

  it('no marca Stock ni Vencimientos cuando vistaActual="registrar"', () => {
    render(<Navegacion vistaActual="registrar" onNavegar={() => {}} />)

    const botonStock = screen.getByRole('button', { name: /stock/i })
    const botonVencimientos = screen.getByRole('button', { name: /vencimientos/i })

    expect(botonStock).not.toHaveAttribute('aria-current')
    expect(botonVencimientos).not.toHaveAttribute('aria-current')
  })
})

// ── Callback de navegación ─────────────────────────────────────────────────

describe('Navegacion — callback onNavegar', () => {
  it('llama onNavegar con "stock" al hacer clic en Stock', async () => {
    const onNavegar = vi.fn()
    render(<Navegacion vistaActual="vencimientos" onNavegar={onNavegar} />)

    await userEvent.click(screen.getByRole('button', { name: /stock/i }))

    expect(onNavegar).toHaveBeenCalledOnce()
    expect(onNavegar).toHaveBeenCalledWith('stock')
  })

  it('llama onNavegar con "vencimientos" al hacer clic en Vencimientos', async () => {
    const onNavegar = vi.fn()
    render(<Navegacion vistaActual="stock" onNavegar={onNavegar} />)

    await userEvent.click(screen.getByRole('button', { name: /vencimientos/i }))

    expect(onNavegar).toHaveBeenCalledOnce()
    expect(onNavegar).toHaveBeenCalledWith('vencimientos')
  })

  it('llama onNavegar con "registrar" al hacer clic en Registrar', async () => {
    const onNavegar = vi.fn()
    render(<Navegacion vistaActual="stock" onNavegar={onNavegar} />)

    await userEvent.click(screen.getByRole('button', { name: /registrar/i }))

    expect(onNavegar).toHaveBeenCalledOnce()
    expect(onNavegar).toHaveBeenCalledWith('registrar')
  })

  it('marca Entregas con aria-current="page" cuando vistaActual="entregas"', () => {
    render(<Navegacion vistaActual="entregas" onNavegar={() => {}} />)

    expect(screen.getByRole('button', { name: /entregas/i })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('llama onNavegar con "entregas" al hacer clic en Entregas', async () => {
    const onNavegar = vi.fn()
    render(<Navegacion vistaActual="stock" onNavegar={onNavegar} />)

    await userEvent.click(screen.getByRole('button', { name: /entregas/i }))

    expect(onNavegar).toHaveBeenCalledOnce()
    expect(onNavegar).toHaveBeenCalledWith('entregas')
  })
})
