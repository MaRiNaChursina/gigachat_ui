import cls from './EmptyState.module.css'

export type EmptyStateProps = {
  title?: string
  subtitle?: string
}

export function EmptyState({
  title = 'Начните новый диалог',
  subtitle = 'Создайте чат в боковой панели и отправьте первое сообщение.',
}: EmptyStateProps) {
  return (
    <div className={cls.root}>
      <div className={cls.card}>
        <div className={cls.icon} aria-hidden="true">
          💬
        </div>
        <h2 className={cls.title}>{title}</h2>
        <p className={cls.subtitle}>{subtitle}</p>
      </div>
    </div>
  )
}

