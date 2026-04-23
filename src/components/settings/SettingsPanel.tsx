import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import cls from './SettingsPanel.module.css'

export type ModelId = string
export type ThemeId = 'dark' | 'light'

export type SettingsState = {
  model: ModelId
  temperature: number
  topP: number
  maxTokens: number
  repetitionPenalty: number
  systemPrompt: string
  theme: ThemeId
}

export type SettingsPanelProps = {
  open: boolean
  value: SettingsState
  availableModels?: string[]
  modelsLoading?: boolean
  modelsError?: string | null
  onReloadModels?: () => void
  onChange: (next: SettingsState) => void
  onClose: () => void
  onSave: () => void
  onReset: () => void
}

export function SettingsPanel({
  open,
  value,
  availableModels,
  modelsLoading,
  modelsError,
  onReloadModels,
  onChange,
  onClose,
  onSave,
  onReset,
}: SettingsPanelProps) {
  if (!open) return null
  const modelOptions = availableModels?.length
    ? availableModels
    : ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max']
  const modelExists = modelOptions.includes(value.model)

  return (
    <div
      className={cls.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Настройки"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={cls.panel}>
        <div className={cls.header}>
          <h2 className={cls.title}>Настройки</h2>
          <Button type="button" variant="ghost" iconOnly title="Закрыть" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className={cls.content}>
          <div className={cls.field}>
            <div className={cls.label}>Модель</div>
            <select
              className={cls.select}
              value={value.model}
              onChange={(e) => onChange({ ...value, model: e.target.value as ModelId })}
            >
              {modelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {modelsLoading ? <div className={cls.hint}>Проверка доступных моделей…</div> : null}
            {modelsError ? (
              <div className={cls.errorRow}>
                <span className={cls.errorText}>{modelsError}</span>
                <Button type="button" variant="ghost" onClick={onReloadModels}>
                  Обновить
                </Button>
              </div>
            ) : null}
            {!modelsError && !modelsLoading && !modelExists ? (
              <div className={cls.warnText}>Текущая модель недоступна для этого ключа. Выберите из списка.</div>
            ) : null}
          </div>

          <Slider
            label="Temperature"
            min={0}
            max={2}
            step={0.01}
            value={value.temperature}
            onChange={(v) => onChange({ ...value, temperature: v })}
            formatValue={(v) => v.toFixed(2)}
          />

          <Slider
            label="Top-P"
            min={0}
            max={1}
            step={0.01}
            value={value.topP}
            onChange={(v) => onChange({ ...value, topP: v })}
            formatValue={(v) => v.toFixed(2)}
          />

          <Slider
            label="Repetition penalty"
            min={0}
            max={2}
            step={0.01}
            value={value.repetitionPenalty}
            onChange={(v) => onChange({ ...value, repetitionPenalty: v })}
            formatValue={(v) => v.toFixed(2)}
          />

          <div className={cls.field}>
            <div className={cls.label}>Max Tokens</div>
            <input
              className={cls.input}
              type="number"
              min={1}
              step={1}
              value={value.maxTokens}
              onChange={(e) => onChange({ ...value, maxTokens: Number(e.target.value) })}
            />
          </div>

          <div className={cls.field}>
            <div className={cls.label}>System Prompt</div>
            <textarea
              className={cls.textarea}
              value={value.systemPrompt}
              onChange={(e) => onChange({ ...value, systemPrompt: e.target.value })}
              placeholder="Например: Ты — полезный ассистент…"
            />
          </div>

          <div className={[cls.field, cls.row].join(' ')}>
            <div>
              <div className={cls.label}>Тема</div>
            </div>
            <Toggle
              checked={value.theme === 'light'}
              onChange={(checked) => onChange({ ...value, theme: checked ? 'light' : 'dark' })}
              label={value.theme === 'light' ? 'Светлая' : 'Тёмная'}
            />
          </div>
        </div>

        <div className={cls.footer}>
          <Button type="button" variant="ghost" onClick={onReset}>
            Сбросить
          </Button>
          <Button type="button" variant="primary" onClick={onSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}

