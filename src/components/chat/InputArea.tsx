import { useEffect, useMemo, useRef } from 'react'
import { Button } from '../ui/Button'
import cls from './InputArea.module.css'

export type InputAreaProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
}

export function InputArea({ value, onChange, onSend, onStop }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const canSend = useMemo(() => value.trim().length > 0, [value])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = 'auto'

    const style = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(style.lineHeight || '20') || 20
    const paddingY =
      (Number.parseFloat(style.paddingTop || '0') || 0) +
      (Number.parseFloat(style.paddingBottom || '0') || 0)
    const borderY =
      (Number.parseFloat(style.borderTopWidth || '0') || 0) +
      (Number.parseFloat(style.borderBottomWidth || '0') || 0)
    const maxHeight = lineHeight * 5 + paddingY + borderY

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }, [value])

  return (
    <div className={cls.root}>
      <div className={cls.box}>
        <div className={cls.textareaWrap}>
          <textarea
            ref={textareaRef}
            className={cls.textarea}
            rows={1}
            value={value}
            placeholder="Напишите сообщение…"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canSend) onSend()
              }
            }}
          />
          <div className={cls.actionsRow}>
            <p className={cls.hint}>Enter — отправить, Shift+Enter — перенос строки</p>
            <Button type="button" variant="ghost" iconOnly title="Прикрепить изображение">
              🖼
            </Button>
          </div>
        </div>

        <div className={cls.sideButtons}>
          <Button type="button" variant="ghost" onClick={onStop} title="Стоп (заглушка)">
            Стоп
          </Button>
          <Button type="button" variant="primary" disabled={!canSend} onClick={onSend}>
            Отправить
          </Button>
        </div>
      </div>
    </div>
  )
}

