import hljs from 'highlight.js'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { ReactNode } from 'react'
import type { Message as ChatMessage, MessageRole } from '../../types/message'
import cls from './Message.module.css'

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
          <ReactMarkdown
            components={{
              code(props) {
                const p = props as any
                const inline: boolean | undefined = p.inline
                const className: string | undefined = typeof p.className === 'string' ? p.className : undefined
                const children: ReactNode = p.children as ReactNode
                const restProps = p as Record<string, unknown>
                delete restProps.inline

                const text = String(children ?? '').replace(/\n$/, '')
                const language =
                  typeof className === 'string' && className.startsWith('language-')
                    ? className.slice('language-'.length)
                    : ''

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }

                const grammar = language && hljs.getLanguage(language) ? language : undefined
                const highlighted = grammar ? hljs.highlight(text, { language: grammar }).value : hljs.highlightAuto(text).value

                return (
                  <pre>
                    <code
                      className={['hljs', className].filter(Boolean).join(' ')}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </pre>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {isUser ? <div className={cls.avatar} aria-hidden="true">You</div> : null}
    </div>
  )
}

