import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InputArea } from './InputArea'

describe('InputArea', () => {
  it('calls onSend with trimmed text when clicking «Отправить» with non-empty input', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<InputArea isLoading={false} onSend={onSend} onStop={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Напишите сообщение…'), '  hello  ')
    await user.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith({ text: 'hello', image: undefined })
  })

  it('calls onSend on Enter (without Shift) when input is non-empty', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<InputArea isLoading={false} onSend={onSend} onStop={vi.fn()} />)

    const field = screen.getByPlaceholderText('Напишите сообщение…')
    await user.type(field, 'hi{Enter}')

    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith({ text: 'hi', image: undefined })
  })

  it('disables «Отправить» when the field is empty or whitespace-only', () => {
    render(<InputArea isLoading={false} onSend={vi.fn()} onStop={vi.fn()} />)

    const send = screen.getByRole('button', { name: 'Отправить' })
    expect(send).toBeDisabled()
  })
})
