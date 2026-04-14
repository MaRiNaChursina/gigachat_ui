import { render, screen, waitFor } from '@testing-library/react'
import { Suspense, type ReactElement } from 'react'
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

function renderMessage(ui: ReactElement) {
  return render(<Suspense fallback={null}>{ui}</Suspense>)
}

describe('Message', () => {
  it('variant=user: shows message text and user CSS classes', async () => {
    const { container } = renderMessage(<Message message={{ ...baseMessage, content: 'Plain text' }} variant="user" />)

    await waitFor(() => {
      expect(screen.getByText('Plain text')).toBeInTheDocument()
    })
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain(cls.rowUser)
    expect(screen.getByText('Plain text').closest(`.${cls.bubble}`)?.className).toContain(cls.bubbleUser)
  })

  it('variant=assistant: shows message text and assistant CSS classes', async () => {
    const { container } = renderMessage(<Message message={{ ...baseMessage, content: 'Answer' }} variant="assistant" />)

    await waitFor(() => {
      expect(screen.getByText('Answer')).toBeInTheDocument()
    })
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain(cls.rowAssistant)
    expect(screen.getByText('Answer').closest(`.${cls.bubble}`)?.className).toContain(cls.bubbleAssistant)
  })

  it('shows «Копировать» only for assistant messages', async () => {
    const { unmount: unmountUser } = renderMessage(<Message message={baseMessage} variant="user" />)
    await waitFor(() => expect(screen.getByText(/Hello/)).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Копировать' })).not.toBeInTheDocument()
    unmountUser()

    renderMessage(<Message message={{ ...baseMessage, content: 'X' }} variant="assistant" />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument()
    })
  })
})
