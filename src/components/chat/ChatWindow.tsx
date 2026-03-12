import type { ChatMessage } from '../../mocks/mockData'
import { EmptyState } from '../empty/EmptyState'
import { Button } from '../ui/Button'
import { InputArea } from './InputArea'
import { MessageList } from './MessageList'
import cls from './ChatWindow.module.css'

export type ChatWindowProps = {
  chatTitle: string
  messages: ChatMessage[]
  typingVisible?: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  onOpenSettings: () => void
  onOpenSidebar?: () => void
  onCopyMessage?: (text: string) => void
}

export function ChatWindow({
  chatTitle,
  messages,
  typingVisible,
  inputValue,
  onInputChange,
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
          <MessageList messages={messages} typingVisible={typingVisible} onCopyMessage={onCopyMessage} />
        )}
      </div>

      <InputArea value={inputValue} onChange={onInputChange} onSend={onSend} onStop={onStop} />
    </section>
  )
}

