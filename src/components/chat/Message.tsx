import { lazy, Suspense, useEffect, useState } from 'react'
import type { Message as ChatMessage, MessageRole } from '../../types/message'
import cls from './Message.module.css'

const MessageMarkdownBody = lazy(() => import('./MessageMarkdownBody'))

export type MessageProps = {
  message: ChatMessage
  variant: MessageRole
  onCopy?: (text: string) => void
}

export function Message({ message, variant, onCopy }: MessageProps) {
  const isUser = variant === 'user'
  const authorLabel = isUser ? 'Вы' : 'Ассистент'
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeoutId = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      onCopy?.(message.content)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={[cls.row, isUser ? cls.rowUser : cls.rowAssistant].join(' ')}>
      {!isUser ? <div className={cls.avatar} aria-hidden="true">G</div> : null}

      <div className={[cls.bubble, isUser ? cls.bubbleUser : cls.bubbleAssistant].join(' ')}>
        {!isUser ? (
          <button
            type="button"
            className={[cls.copyBtn, copied ? cls.copyBtnDone : ''].join(' ')}
            title="Копировать"
            onClick={handleCopy}
          >
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
        ) : null}

        <div className={cls.meta}>
          <div className={cls.author}>{authorLabel}</div>
          <div className={cls.time}>{message.timestamp}</div>
        </div>

        <div className={cls.content}>
          {message.image ? (
            <div className={cls.imageWrap}>
              <img src={message.image.dataUrl} alt={message.image.name || 'user image'} className={cls.image} />
            </div>
          ) : null}
          <Suspense fallback={<div className={cls.mdFallback}>{message.content}</div>}>
            <MessageMarkdownBody content={message.content} />
          </Suspense>
        </div>
      </div>

      {isUser ? <div className={cls.avatar} aria-hidden="true">You</div> : null}
    </div>
  )
}
