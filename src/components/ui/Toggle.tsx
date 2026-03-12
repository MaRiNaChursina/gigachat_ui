import cls from './Toggle.module.css'

export type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={[cls.root, checked ? cls.checked : undefined].filter(Boolean).join(' ')}>
      <input
        className={cls.input}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={cls.track} aria-hidden="true">
        <span className={cls.thumb} />
      </span>
      {label ? <span className={cls.label}>{label}</span> : null}
    </label>
  )
}

