import { useEffect, useState } from 'react'
import type { SettingsState } from '../../components/settings/SettingsPanel'

const defaultSettings: SettingsState = {
  model: 'GigaChat',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  systemPrompt: '',
  theme: 'dark',
}

export function useSettingsTheme() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  return {
    settings,
    setSettings,
    settingsOpen,
    setSettingsOpen,
    defaultSettings,
  }
}

