import hljs from 'highlight.js'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'

export type MessageMarkdownBodyProps = {
  content: string
}

export default function MessageMarkdownBody({ content }: MessageMarkdownBodyProps) {
  return (
    <ReactMarkdown
      components={{
        a({ href, children, ...rest }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          )
        },
        code(props) {
          const p = props as {
            inline?: boolean
            className?: string
            children?: ReactNode
          }
          const inline = p.inline
          const className = typeof p.className === 'string' ? p.className : undefined
          const children = p.children as ReactNode

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
          const highlighted = grammar
            ? hljs.highlight(text, { language: grammar }).value
            : hljs.highlightAuto(text).value

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
      {content}
    </ReactMarkdown>
  )
}
