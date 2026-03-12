import { useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'
import cls from './AuthForm.module.css'

export type AuthScope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP'

export type AuthFormProps = {
  onLogin: (params: { credentialsBase64: string; scope: AuthScope }) => void
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [credentialsBase64, setCredentialsBase64] = useState('')
  const [scope, setScope] = useState<AuthScope>('GIGACHAT_API_PERS')
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => credentialsBase64.trim().length > 0, [credentialsBase64])

  return (
    <div className={cls.root}>
      <form
        className={cls.card}
        onSubmit={(e) => {
          e.preventDefault()
          if (!canSubmit) {
            setError('Credentials не должны быть пустыми')
            return
          }
          setError(null)
          onLogin({ credentialsBase64: credentialsBase64.trim(), scope })
        }}
      >
        <div>
          <h1 className={cls.title}>Авторизация</h1>
          <p className={cls.subtitle}>Введите credentials (Base64) и выберите scope.</p>
        </div>

        <div className={cls.field}>
          <div className={cls.label}>Credentials (Base64)</div>
          <input
            className={cls.input}
            type="password"
            value={credentialsBase64}
            onChange={(e) => setCredentialsBase64(e.target.value)}
            placeholder="••••••••••"
          />
          {error ? <ErrorMessage message={error} /> : null}
        </div>

        <div className={cls.field}>
          <div className={cls.label}>Scope</div>
          <div className={cls.radios}>
            {(
              [
                { id: 'GIGACHAT_API_PERS', label: 'GIGACHAT_API_PERS' },
                { id: 'GIGACHAT_API_B2B', label: 'GIGACHAT_API_B2B' },
                { id: 'GIGACHAT_API_CORP', label: 'GIGACHAT_API_CORP' },
              ] as const
            ).map((opt) => (
              <label key={opt.id} className={cls.radioRow}>
                <input
                  type="radio"
                  name="scope"
                  value={opt.id}
                  checked={scope === opt.id}
                  onChange={() => setScope(opt.id)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={cls.footer}>
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            Войти
          </Button>
        </div>
      </form>
    </div>
  )
}

