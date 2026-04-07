import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Message } from './Message'
import cls from './Message.module.css'
import type { Message as Msg } from '../../types/message'

const baseMessage: Msg = {
  id: 'm1',
  role: 'user',
  content: 'Hello **world**',
  timestamp: '12:00',
}

describe('Message', () => {
  it('variant=user: shows message text and user CSS classes', () => {
    const { container } = render(<Message message={{ ...baseMessage, content: 'Plain text' }} variant="user" />)

    expect(screen.getByText('Plain text')).toBeInTheDocument()
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain(cls.rowUser)
    expect(screen.getByText('Plain text').closest(`.${cls.bubble}`)?.className).toContain(cls.bubbleUser)
  })

  it('variant=assistant: shows message text and assistant CSS classes', () => {
    const { container } = render(<Message message={{ ...baseMessage, content: 'Answer' }} variant="assistant" />)

    expect(screen.getByText('Answer')).toBeInTheDocument()
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain(cls.rowAssistant)
    expect(screen.getByText('Answer').closest(`.${cls.bubble}`)?.className).toContain(cls.bubbleAssistant)
  })

  it('shows «Копировать» only for assistant messages', () => {
    const { unmount: unmountUser } = render(<Message message={baseMessage} variant="user" />)
    expect(screen.queryByRole('button', { name: 'Копировать' })).not.toBeInTheDocument()
    unmountUser()

    render(<Message message={{ ...baseMessage, content: 'X' }} variant="assistant" />)
    expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument()
  })
})
