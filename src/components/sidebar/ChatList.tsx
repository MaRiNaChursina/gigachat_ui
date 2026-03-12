import { useEffect, useRef } from 'react'
import type { Chat } from '../../mocks/mockData'
import { ChatItem } from './ChatItem'
import cls from './ChatList.module.css'

export type ChatListProps = {
  chats: Chat[]
  activeChatId?: string
  onSelectChat: (chatId: string) => void
  onEditChat?: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onEditChat,
  onDeleteChat,
}: ChatListProps) {
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight)
    if (el.scrollTop > maxScrollTop) el.scrollTop = maxScrollTop
  }, [chats.length])

  return (
    <div ref={listRef} className={cls.root}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          active={chat.id === activeChatId}
          onSelect={onSelectChat}
          onEdit={onEditChat}
          onDelete={onDeleteChat}
        />
      ))}
    </div>
  )
}

