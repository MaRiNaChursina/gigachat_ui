import ReactMarkdown from 'react-markdown'
import type { ChatMessage, MessageRole } from '../../mocks/mockData'
import cls from './Message.module.css'

export type MessageProps = {
  message: ChatMessage
  variant: MessageRole
  onCopy?: (text: string) => void
}

export function Message({ message, variant, onCopy }: MessageProps) {
  const isUser = variant === 'user'

  return (
    <div className={[cls.row, isUser ? cls.rowUser : cls.rowAssistant].join(' ')}>
      {!isUser ? <div className={cls.avatar} aria-hidden="true">G</div> : null}

      <div className={[cls.bubble, isUser ? cls.bubbleUser : cls.bubbleAssistant].join(' ')}>
        <button
          type="button"
          className={cls.copyBtn}
          title="Копировать"
          onClick={() => onCopy?.(message.content)}
        >
          ⧉
        </button>

        <div className={cls.meta}>
          <div className={cls.author}>{message.authorLabel}</div>
          <div className={cls.time}>{message.createdAt}</div>
        </div>

        <div className={cls.content}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>

      {isUser ? <div className={cls.avatar} aria-hidden="true">You</div> : null}
    </div>
  )
}

