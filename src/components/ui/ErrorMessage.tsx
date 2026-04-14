import { Button } from './Button'
import cls from './ErrorMessage.module.css'

export type ErrorMessageProps = {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorMessage({ message, onRetry, retryLabel = 'Повторить' }: ErrorMessageProps) {
  return (
    <div className={cls.root} role="alert">
      <span className={cls.icon} aria-hidden="true">
        !
      </span>
      <span className={cls.text}>{message}</span>
      {onRetry ? (
        <Button type="button" variant="ghost" className={cls.retry} onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

