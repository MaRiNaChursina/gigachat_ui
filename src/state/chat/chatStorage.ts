import type { ChatState } from './types'

const STORAGE_KEY = 'gigachat_ui_chat_state_v1'

export function loadChatStateFromStorage(): ChatState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ChatState

    if (!parsed || !Array.isArray(parsed.chats)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveChatStateToStorage(state: ChatState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / security errors
  }
}

