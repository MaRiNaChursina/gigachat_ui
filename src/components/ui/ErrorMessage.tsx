import cls from './ErrorMessage.module.css'

export type ErrorMessageProps = {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className={cls.root} role="alert">
      <span className={cls.icon} aria-hidden="true">
        !
      </span>
      <span>{message}</span>
    </div>
  )
}

