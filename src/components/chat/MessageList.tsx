import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../mocks/mockData'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'
import cls from './MessageList.module.css'

export type MessageListProps = {
  messages: ChatMessage[]
  typingVisible?: boolean
  onCopyMessage?: (text: string) => void
}

export function MessageList({ messages, typingVisible, onCopyMessage }: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, typingVisible])

  return (
    <div className={cls.root}>
      <div className={cls.inner}>
        {messages.map((m) => (
          <Message key={m.id} message={m} variant={m.role} onCopy={onCopyMessage} />
        ))}
        {typingVisible ? (
          <div className={cls.typingRow}>
            <TypingIndicator isVisible />
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
    </div>
  )
}

