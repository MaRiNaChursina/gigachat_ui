import { memo } from 'react'
import cls from './ChatItem.module.css'
import type { Chat } from '../../mocks/mockData'

export type ChatItemProps = {
  chat: Chat
  active?: boolean
  onSelect: (chatId: string) => void
  onEdit?: (chatId: string) => void
  onDelete?: (chatId: string) => void
}

export const ChatItem = memo(function ChatItem({ chat, active, onSelect, onEdit, onDelete }: ChatItemProps) {
  return (
    <div
      className={[cls.root, active ? cls.active : undefined].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chat.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(chat.id)
      }}
    >
      <div className={cls.title} title={chat.title}>
        {chat.title}
      </div>
      <div className={cls.date}>{chat.lastMessageAt}</div>
      <div className={cls.actions}>
        <button
          className={cls.actionBtn}
          type="button"
          title="Редактировать"
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(chat.id)
          }}
        >
          {'\u270E'}
        </button>
        <button
          className={[cls.actionBtn, cls.actionDanger].join(' ')}
          type="button"
          title="Удалить"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(chat.id)
          }}
        >
          {'\uD83D\uDDD1'}
        </button>
      </div>
    </div>
  )
})
