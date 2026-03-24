import type { Message } from '../../types/message'
import { EmptyState } from '../empty/EmptyState'
import { Button } from '../ui/Button'
import { InputArea } from './InputArea'
import { MessageList } from './MessageList'
import cls from './ChatWindow.module.css'

export type ChatWindowProps = {
  chatTitle: string
  messages: Message[]
  isLoading: boolean
  onSend: (text: string) => void
  onStop: () => void
  onOpenSettings: () => void
  onOpenSidebar?: () => void
  onCopyMessage?: (text: string) => void
}

export function ChatWindow({
  chatTitle,
  messages,
  isLoading,
  onSend,
  onStop,
  onOpenSettings,
  onOpenSidebar,
  onCopyMessage,
}: ChatWindowProps) {
  return (
    <section className={cls.root} aria-label="Чат">
      <header className={cls.header}>
        <div className={cls.headerLeft}>
          <Button
            type="button"
            variant="ghost"
            iconOnly
            className={cls.burger}
            title="Открыть боковую панель"
            onClick={onOpenSidebar}
            disabled={!onOpenSidebar}
          >
            ☰
          </Button>
          <div className={cls.title} title={chatTitle}>
            {chatTitle}
          </div>
        </div>

        <Button type="button" variant="ghost" iconOnly title="Настройки" onClick={onOpenSettings}>
          ⚙
        </Button>
      </header>

      <div className={cls.content}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <MessageList messages={messages} typingVisible={isLoading} onCopyMessage={onCopyMessage} />
        )}
      </div>

      <InputArea isLoading={isLoading} onSend={onSend} onStop={onStop} />
    </section>
  )
}

