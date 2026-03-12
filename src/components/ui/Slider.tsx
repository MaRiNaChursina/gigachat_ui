import cls from './Slider.module.css'

export type SliderProps = {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export function Slider({
  label,
  min,
  max,
  step = 0.01,
  value,
  onChange,
  formatValue,
}: SliderProps) {
  const shown = formatValue ? formatValue(value) : String(value)

  return (
    <div className={cls.root}>
      <div className={cls.topRow}>
        <div className={cls.label}>{label}</div>
        <div className={cls.value}>{shown}</div>
      </div>
      <input
        className={cls.range}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

