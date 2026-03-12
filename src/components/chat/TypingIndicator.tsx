import cls from './TypingIndicator.module.css'

export type TypingIndicatorProps = {
  isVisible?: boolean
}

export function TypingIndicator({ isVisible = true }: TypingIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className={cls.root} aria-label="Ассистент печатает">
      <span className={cls.dot} />
      <span className={cls.dot} />
      <span className={cls.dot} />
    </div>
  )
}

