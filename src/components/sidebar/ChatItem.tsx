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
  const handleEdit = (e?: { stopPropagation: () => void; preventDefault?: () => void }) => {
    e?.stopPropagation()
    e?.preventDefault?.()
    onEdit?.(chat.id)
  }

  return (
    <div
      className={[cls.root, active ? cls.active : undefined].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chat.id)}
      onDoubleClick={() => onEdit?.(chat.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(chat.id)
        }
        if (e.key === 'F2') {
          e.preventDefault()
          onEdit?.(chat.id)
        }
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
          aria-label="Редактировать чат"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleEdit}
        >
          {'\u270E'}
        </button>
        <button
          className={[cls.actionBtn, cls.actionDanger].join(' ')}
          type="button"
          title="Удалить"
          aria-label="Удалить чат"
          onMouseDown={(e) => e.stopPropagation()}
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
