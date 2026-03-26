import type { ChatAction, Chat, ChatState } from './types'
import type { Message } from '../../types/message'

function upsertChatMessages(chats: Chat[], chatId: string, updater: (messages: Message[]) => Message[]) {
  return chats.map((c) => {
    if (c.id !== chatId) return c
    return { ...c, messages: updater(c.messages) }
  })
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'REPLACE_STATE': {
      return action.payload
    }
    case 'SET_SEARCH': {
      return { ...state, search: action.payload }
    }
    case 'SET_ACTIVE_CHAT': {
      return { ...state, activeChatId: action.payload }
    }
    case 'CREATE_CHAT': {
      const chats = [action.payload, ...state.chats]
      return { ...state, chats, activeChatId: action.payload.id }
    }
    case 'DELETE_CHAT': {
      const chats = state.chats.filter((c) => c.id !== action.payload.chatId)
      const deletedActive = state.activeChatId === action.payload.chatId
      return {
        ...state,
        chats,
        activeChatId: deletedActive ? chats[0]?.id ?? null : state.activeChatId,
      }
    }
    case 'RENAME_CHAT': {
      return {
        ...state,
        chats: state.chats.map((c) => (c.id === action.payload.chatId ? { ...c, title: action.payload.title } : c)),
      }
    }
    case 'ADD_MESSAGE': {
      return {
        ...state,
        chats: upsertChatMessages(state.chats, action.payload.chatId, (messages) => [
          ...messages,
          action.payload.message,
        ]).map((c) => {
          if (c.id !== action.payload.chatId) return c
          return { ...c, lastMessageAt: action.payload.lastMessageAt }
        }),
      }
    }
    case 'APPEND_ASSISTANT_CHUNK': {
      return {
        ...state,
        chats: state.chats.map((c) => {
          if (c.id !== action.payload.chatId) return c
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== action.payload.messageId) return m
              return { ...m, content: m.content + action.payload.chunk }
            }),
          }
        }),
      }
    }
    case 'SET_MESSAGE_CONTENT': {
      return {
        ...state,
        chats: state.chats.map((c) => {
          if (c.id !== action.payload.chatId) return c
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === action.payload.messageId ? { ...m, content: action.payload.content } : m,
            ),
          }
        }),
      }
    }
    case 'SET_LOADING': {
      return { ...state, isLoading: action.payload }
    }
    case 'SET_ERROR': {
      return { ...state, error: action.payload }
    }
    default: {
      return state
    }
  }
}

