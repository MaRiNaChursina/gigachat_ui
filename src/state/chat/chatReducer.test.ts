import { describe, expect, it } from 'vitest'
import { chatReducer } from './chatReducer'
import type { Chat, ChatState } from './types'
import type { Message } from '../../types/message'

function makeMessage(partial: Partial<Message> & Pick<Message, 'id'>): Message {
  return {
    role: 'user',
    content: '',
    timestamp: '10:00',
    ...partial,
  }
}

function makeChat(partial: Partial<Chat> & Pick<Chat, 'id'>): Chat {
  return {
    title: 'T',
    lastMessageAt: '2026-01-01',
    messages: [],
    ...partial,
  }
}

function baseState(overrides: Partial<ChatState> = {}): ChatState {
  return {
    chats: [],
    activeChatId: null,
    isLoading: false,
    error: null,
    search: '',
    ...overrides,
  }
}

describe('chatReducer', () => {
  it('ADD_MESSAGE: appends message to the end of the chat messages array', () => {
    const m1 = makeMessage({ id: 'm1', content: 'a' })
    const m2 = makeMessage({ id: 'm2', content: 'b' })
    const state = baseState({
      chats: [makeChat({ id: 'c1', messages: [m1] })],
      activeChatId: 'c1',
    })

    const next = chatReducer(state, {
      type: 'ADD_MESSAGE',
      payload: { chatId: 'c1', message: m2, lastMessageAt: '2026-02-02' },
    })

    expect(next.chats[0].messages).toHaveLength(2)
    expect(next.chats[0].messages[1]).toEqual(m2)
    expect(next.chats[0].lastMessageAt).toBe('2026-02-02')
  })

  it('CREATE_CHAT: prepends chat, sets activeChatId to new id', () => {
    const existing = makeChat({ id: 'old', title: 'Old' })
    const created = makeChat({ id: 'new', title: 'New' })
    const state = baseState({ chats: [existing], activeChatId: 'old' })

    const next = chatReducer(state, { type: 'CREATE_CHAT', payload: created })

    expect(next.chats).toHaveLength(2)
    expect(next.chats[0]).toEqual(created)
    expect(next.activeChatId).toBe('new')
    expect(new Set(next.chats.map((c) => c.id)).size).toBe(2)
  })

  it('DELETE_CHAT: removes chat; resets activeChatId when deleting active chat', () => {
    const a = makeChat({ id: 'a', title: 'A' })
    const b = makeChat({ id: 'b', title: 'B' })
    const state = baseState({ chats: [a, b], activeChatId: 'a' })

    const next = chatReducer(state, { type: 'DELETE_CHAT', payload: { chatId: 'a' } })

    expect(next.chats.map((c) => c.id)).toEqual(['b'])
    expect(next.activeChatId).toBe('b')
  })

  it('DELETE_CHAT: when deleting non-active chat, activeChatId stays the same', () => {
    const a = makeChat({ id: 'a', title: 'A' })
    const b = makeChat({ id: 'b', title: 'B' })
    const state = baseState({ chats: [a, b], activeChatId: 'a' })

    const next = chatReducer(state, { type: 'DELETE_CHAT', payload: { chatId: 'b' } })

    expect(next.activeChatId).toBe('a')
  })

  it('DELETE_CHAT: when deleting last chat, activeChatId becomes null', () => {
    const only = makeChat({ id: 'only', title: 'Only' })
    const state = baseState({ chats: [only], activeChatId: 'only' })

    const next = chatReducer(state, { type: 'DELETE_CHAT', payload: { chatId: 'only' } })

    expect(next.chats).toHaveLength(0)
    expect(next.activeChatId).toBeNull()
  })

  it('RENAME_CHAT: updates title for matching id', () => {
    const a = makeChat({ id: 'a', title: 'Old' })
    const b = makeChat({ id: 'b', title: 'B' })
    const state = baseState({ chats: [a, b], activeChatId: 'a' })

    const next = chatReducer(state, {
      type: 'RENAME_CHAT',
      payload: { chatId: 'a', title: 'Renamed' },
    })

    expect(next.chats.find((c) => c.id === 'a')?.title).toBe('Renamed')
    expect(next.chats.find((c) => c.id === 'b')?.title).toBe('B')
  })
})
