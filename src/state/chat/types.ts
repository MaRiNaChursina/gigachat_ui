import type { Message, MessageRole } from '../../types/message'

export type Chat = {
  id: string
  title: string
  lastMessageAt: string
  messages: Message[]
}

export type ChatState = {
  chats: Chat[]
  activeChatId: string | null
  isLoading: boolean
  error: string | null
  search: string
}

export type ChatAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'CREATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: { chatId: string } }
  | { type: 'RENAME_CHAT'; payload: { chatId: string; title: string } }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message; lastMessageAt: string } }
  | {
      type: 'APPEND_ASSISTANT_CHUNK'
      payload: { chatId: string; messageId: string; chunk: string }
    }
  | {
      type: 'SET_MESSAGE_CONTENT'
      payload: { chatId: string; messageId: string; content: string }
    }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REPLACE_STATE'; payload: ChatState }

export type ChatSendMessageParams = {
  text: string
  systemPrompt?: string
  model: string
  temperature?: number
  topP?: number
  maxTokens?: number
  stream?: boolean
}

export type ChatMessageContextRole = MessageRole | 'system'

