import { useMemo, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'
import type { Chat } from '../../mocks/mockData'
import type { Message } from '../../types/message'

type ChatRow = Chat & { messages?: Message[] }

const sampleChats: ChatRow[] = [
  { id: 'c1', title: 'План на семестр', lastMessageAt: '2026-03-12' },
  { id: 'c2', title: 'Идеи для проекта', lastMessageAt: '2026-03-11' },
  { id: 'c3', title: 'Краткий конспект: JSX', lastMessageAt: '2026-03-10' },
]

function filterChatsBySearch(chats: ChatRow[], search: string) {
  const q = search.trim().toLowerCase()
  if (!q) return chats
  return chats.filter((c) => {
    if (c.title.toLowerCase().includes(q)) return true
    return (c.messages ?? []).some((m) => m.content?.toLowerCase().includes(q) ?? false)
  })
}

function SidebarHarness({ initialChats }: { initialChats: ChatRow[] }) {
  const [search, setSearch] = useState('')
  const visible = useMemo(() => filterChatsBySearch(initialChats, search), [search, initialChats])

  return (
    <Sidebar
      chats={visible}
      searchValue={search}
      onSearchChange={setSearch}
      onSelectChat={vi.fn()}
      onNewChat={vi.fn()}
      onDeleteChat={vi.fn()}
      onLogout={vi.fn()}
    />
  )
}

describe('Sidebar', () => {
  it('with empty search shows all chat titles', () => {
    render(<SidebarHarness initialChats={sampleChats} />)

    expect(screen.getByText('План на семестр')).toBeInTheDocument()
    expect(screen.getByText('Идеи для проекта')).toBeInTheDocument()
    expect(screen.getByText('Краткий конспект: JSX')).toBeInTheDocument()
  })

  it('filters chat list by search text (title match)', async () => {
    const user = userEvent.setup()
    render(<SidebarHarness initialChats={sampleChats} />)

    await user.type(screen.getByPlaceholderText('Поиск по чатам…'), 'jsx')

    expect(screen.getByText('Краткий конспект: JSX')).toBeInTheDocument()
    expect(screen.queryByText('План на семестр')).not.toBeInTheDocument()
    expect(screen.queryByText('Идеи для проекта')).not.toBeInTheDocument()
  })

  it('filters chat list by search text (message body match)', async () => {
    const user = userEvent.setup()
    const chats: ChatRow[] = [
      {
        id: 'c1',
        title: 'Без совпадения в названии',
        lastMessageAt: '2026-03-12',
        messages: [
          { id: 'm1', role: 'user', content: 'Обсуждали useMemo и производительность', timestamp: '10:00' },
        ],
      },
      {
        id: 'c2',
        title: 'Другой диалог',
        lastMessageAt: '2026-03-11',
        messages: [{ id: 'm2', role: 'assistant', content: 'Короткий ответ', timestamp: '11:00' }],
      },
    ]
    render(<SidebarHarness initialChats={chats} />)

    await user.type(screen.getByPlaceholderText('Поиск по чатам…'), 'usememo')

    expect(screen.getByText('Без совпадения в названии')).toBeInTheDocument()
    expect(screen.queryByText('Другой диалог')).not.toBeInTheDocument()
  })

  it('clicking delete triggers confirmation (handler as in App)', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const onDeleteChat = vi.fn((id: string) => {
      const ok = window.confirm('Удалить чат?')
      if (!ok) return
      void id
    })

    render(
      <Sidebar
        chats={sampleChats}
        searchValue=""
        onSearchChange={vi.fn()}
        onSelectChat={vi.fn()}
        onNewChat={vi.fn()}
        onDeleteChat={onDeleteChat}
        onLogout={vi.fn()}
      />,
    )

    await user.click(screen.getAllByTitle('Удалить')[0])

    expect(confirmSpy).toHaveBeenCalledWith('Удалить чат?')

    confirmSpy.mockRestore()
  })
})
