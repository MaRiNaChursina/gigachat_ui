import { useState } from 'react'
import type { Message } from '../../types/message'
import type { MessageImage } from '../../types/message'
import { useChatStore } from '../../state/chat/ChatProvider'
import { ErrorBoundary } from '../ErrorBoundary'
import { EmptyState } from '../empty/EmptyState'
import { Button } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'
import { InputArea } from './InputArea'
import { MessageList } from './MessageList'
import cls from './ChatWindow.module.css'

export type ChatWindowProps = {
  chatId?: string
  chatTitle: string
  messages: Message[]
  isLoading: boolean
  onSend: (payload: { text: string; image?: MessageImage }) => void
  onStop: () => void
  onOpenSettings: () => void
  onOpenSidebar?: () => void
  onCopyMessage?: (text: string) => void
}

export function ChatWindow({
  chatId,
  chatTitle,
  messages,
  isLoading,
  onSend,
  onStop,
  onOpenSettings,
  onOpenSidebar,
  onCopyMessage,
}: ChatWindowProps) {
  const { state, clearError } = useChatStore()
  const [messageListErrorKey, setMessageListErrorKey] = useState(0)

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
            {'\u2630'}
          </Button>
          <div className={cls.title} title={chatTitle}>
            {chatTitle}
          </div>
        </div>

        <Button type="button" variant="ghost" iconOnly title="Настройки" onClick={onOpenSettings}>
          {'\u2699'}
        </Button>
      </header>

      <div className={cls.content}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <ErrorBoundary
            key={`${chatId ?? 'default'}-${messageListErrorKey}`}
            fallback={
              <div className={cls.messageError}>
                <p className={cls.messageErrorText}>Не удалось отобразить сообщения.</p>
                <Button type="button" variant="primary" onClick={() => setMessageListErrorKey((k) => k + 1)}>
                  Повторить
                </Button>
              </div>
            }
          >
            <MessageList messages={messages} typingVisible={isLoading} onCopyMessage={onCopyMessage} />
          </ErrorBoundary>
        )}
      </div>

      <div className={cls.footer}>
        <InputArea isLoading={isLoading} onSend={onSend} onStop={onStop} />
        {state.error ? (
          <div className={cls.apiError}>
            <ErrorMessage message={state.error} onRetry={clearError} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
