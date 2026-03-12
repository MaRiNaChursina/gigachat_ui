import cls from './SearchInput.module.css'

export type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск по чатам…',
}: SearchInputProps) {
  return (
    <div className={cls.root}>
      <span className={cls.icon} aria-hidden="true">
        ⌕
      </span>
      <input
        className={cls.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

