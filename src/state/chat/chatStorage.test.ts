import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatState } from './types'
import { loadChatStateFromStorage, saveChatStateToStorage } from './chatStorage'

function createLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn(),
    get length() {
      return Object.keys(store).length
    },
    _dump: () => ({ ...store }),
  }
}

describe('chatStorage', () => {
  let ls: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    ls = createLocalStorageMock()
    vi.stubGlobal('localStorage', ls as unknown as Storage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saveChatStateToStorage writes JSON to localStorage', () => {
    const state: ChatState = {
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: null,
      search: '',
    }

    saveChatStateToStorage(state)

    expect(ls.setItem).toHaveBeenCalled()
    const [, raw] = ls.setItem.mock.calls[0] ?? []
    expect(typeof raw).toBe('string')
    expect(JSON.parse(raw as string)).toEqual(state)
  })

  it('loadChatStateFromStorage restores previously saved state', () => {
    const state: ChatState = {
      chats: [
        {
          id: 'c1',
          title: 'Hello',
          lastMessageAt: '2026-01-01',
          messages: [],
        },
      ],
      activeChatId: 'c1',
      isLoading: false,
      error: null,
      search: 'q',
    }

    saveChatStateToStorage(state)
    const loaded = loadChatStateFromStorage()

    expect(loaded).toEqual(state)
  })

  it('loadChatStateFromStorage returns null for invalid JSON', () => {
    ls.getItem.mockImplementation(() => '{not json')

    expect(loadChatStateFromStorage()).toBeNull()
  })

  it('loadChatStateFromStorage returns null when payload has no chats array', () => {
    ls.getItem.mockImplementation(() => JSON.stringify({ foo: 1 }))

    expect(loadChatStateFromStorage()).toBeNull()
  })

  it('loadChatStateFromStorage returns null for empty storage', () => {
    ls.getItem.mockImplementation(() => null)

    expect(loadChatStateFromStorage()).toBeNull()
  })
})
