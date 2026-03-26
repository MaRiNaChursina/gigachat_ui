import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { mockChats, mockMessagesByChatId } from '../../mocks/mockData'
import { getNowTimeLabel, getTodayIsoDate } from '../../shared/lib/time'
import type { Chat, ChatMessageContextRole, ChatState, ChatSendMessageParams } from './types'
import type { Message } from '../../types/message'
import { chatReducer } from './chatReducer'
import { loadChatStateFromStorage, saveChatStateToStorage } from './chatStorage'
import { gigachatChatCompletion } from '../../api/gigachat'

export type ChatStoreValue = {
  state: ChatState
  visibleChats: Chat[]
  setSearch: (value: string) => void
  setActiveChatId: (chatId: string) => void
  createChat: () => string
  renameChat: (chatId: string, title: string) => void
  deleteChat: (chatId: string) => void
  sendMessage: (text: string, params: Omit<ChatSendMessageParams, 'text'>) => Promise<void>
  stopGeneration: () => void
}

const ChatContext = createContext<ChatStoreValue | null>(null)

function buildInitialState(): ChatState {
  const fromStorage = loadChatStateFromStorage()
  if (fromStorage) return fromStorage

  const chats: Chat[] = mockChats.map((c) => {
    const messages = mockMessagesByChatId[c.id] ?? []
    return {
      id: c.id,
      title: c.title,
      lastMessageAt: c.lastMessageAt,
      messages,
    }
  })

  const activeChatId = chats[0]?.id ?? null
  return {
    chats,
    activeChatId,
    isLoading: false,
    error: null,
    search: '',
  }
}

function getDefaultChatTitle(chatsCount: number, content: string) {
  const trimmed = content.trim().replace(/\s+/g, ' ')
  if (trimmed.length >= 3) {
    const firstLine = trimmed.split('\n')[0] ?? ''
    const maxLen = 38
    const sliced = firstLine.trim().slice(0, maxLen)
    return sliced.length >= 3 ? sliced : `Диалог ${chatsCount}`
  }
  if (chatsCount === 1) return 'Новый чат'
  return `Диалог ${chatsCount}`
}

function getNextChatId() {
  return `c${Date.now()}`
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, buildInitialState)
  const abortControllerRef = useRef<AbortController | null>(null)

  const persistTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (persistTimerRef.current !== null) window.clearTimeout(persistTimerRef.current)
    persistTimerRef.current = window.setTimeout(() => {
      saveChatStateToStorage({ ...state, search: '' })
    }, 250)
    return () => {
      if (persistTimerRef.current !== null) window.clearTimeout(persistTimerRef.current)
    }
  }, [state.chats, state.activeChatId])

  const setSearch = useCallback((value: string) => {
    dispatch({ type: 'SET_SEARCH', payload: value })
  }, [])

  const setActiveChatId = useCallback((chatId: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId })
  }, [])

  const createChat = useCallback((): string => {
    const id = getNextChatId()
    const title = state.chats.length === 0 ? 'Новый чат' : `Диалог ${state.chats.length + 1}`
    const newChat: Chat = {
      id,
      title,
      lastMessageAt: getTodayIsoDate(),
      messages: [],
    }
    dispatch({ type: 'CREATE_CHAT', payload: newChat })
    return id
  }, [state.chats.length])

  const renameChat = useCallback((chatId: string, title: string) => {
    dispatch({ type: 'RENAME_CHAT', payload: { chatId, title } })
  }, [])

  const deleteChat = useCallback((chatId: string) => {
    dispatch({ type: 'DELETE_CHAT', payload: { chatId } })
  }, [])

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [])

  const sendMessage = useCallback(
    async (text: string, params: Omit<ChatSendMessageParams, 'text'>) => {
      const activeChatId = state.activeChatId
      if (!activeChatId) return
      const trimmed = text.trim()
      if (!trimmed) return
      if (state.isLoading) return

      const todayIso = getTodayIsoDate()
      abortControllerRef.current?.abort()
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      dispatch({ type: 'SET_ERROR', payload: null })
      dispatch({ type: 'SET_LOADING', payload: true })

      // Build user message.
      const userMessage: Message = {
        id: `m${Date.now()}`,
        role: 'user',
        timestamp: getNowTimeLabel(),
        content: trimmed,
      }

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { chatId: activeChatId, message: userMessage, lastMessageAt: todayIso },
      })

      // If it was empty, generate title from first message.
      const currentChat = state.chats.find((c) => c.id === activeChatId)
      const prevMessages = currentChat?.messages ?? []
      const wasEmpty = prevMessages.length === 0
      if (wasEmpty) {
        const nextTitle = getDefaultChatTitle(state.chats.length + 1, trimmed)
        dispatch({ type: 'RENAME_CHAT', payload: { chatId: activeChatId, title: nextTitle } })
      }

      // Add assistant draft that will be filled by streaming.
      const assistantMessageId = `m${Date.now()}-a`
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        timestamp: getNowTimeLabel(),
        content: '',
      }
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { chatId: activeChatId, message: assistantMessage, lastMessageAt: todayIso },
      })

      const contextMessages: { role: ChatMessageContextRole; content: string }[] = []
      if (params.systemPrompt?.trim()) {
        contextMessages.push({ role: 'system', content: params.systemPrompt.trim() })
      }
      for (const m of prevMessages) contextMessages.push({ role: m.role, content: m.content })
      // Include the current user message as well (it was not yet present in `prevMessages` from closure).
      contextMessages.push({ role: 'user', content: trimmed })

      try {
        const result = await gigachatChatCompletion({
          model: params.model,
          temperature: params.temperature,
          topP: params.topP,
          maxTokens: params.maxTokens,
          stream: params.stream ?? true,
          abortController,
          messages: contextMessages,
          onDelta: (chunk) => {
            dispatch({
              type: 'APPEND_ASSISTANT_CHUNK',
              payload: { chatId: activeChatId, messageId: assistantMessageId, chunk },
            })
          },
        })

        dispatch({ type: 'SET_LOADING', payload: false })
        void result
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Unknown error')
        if (abortController.signal.aborted) return
        // Fallback: if streaming failed, retry with regular REST response.
        if (params.stream ?? true) {
          try {
            const fallbackController = new AbortController()
            abortControllerRef.current = fallbackController
            const fallback = await gigachatChatCompletion({
              model: params.model,
              temperature: params.temperature,
              topP: params.topP,
              maxTokens: params.maxTokens,
              stream: false,
              abortController: fallbackController,
              messages: contextMessages,
            })

            dispatch({
              type: 'SET_MESSAGE_CONTENT',
              payload: { chatId: activeChatId, messageId: assistantMessageId, content: fallback.text },
            })
            dispatch({ type: 'SET_LOADING', payload: false })
            return
          } catch (fallbackError) {
            const fallbackErr =
              fallbackError instanceof Error ? fallbackError : new Error('Unknown fallback error')
            dispatch({ type: 'SET_ERROR', payload: fallbackErr.message })
            dispatch({ type: 'SET_LOADING', payload: false })
            return
          }
        }

        dispatch({ type: 'SET_ERROR', payload: err.message })
        dispatch({ type: 'SET_LOADING', payload: false })
      } finally {
        if (abortControllerRef.current === abortController) abortControllerRef.current = null
      }
    },
    [state.activeChatId, state.isLoading, state.chats],
  )

  const filteredChats = useMemo(() => {
    const q = state.search.trim().toLowerCase()
    if (!q) return state.chats

    return state.chats.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true
      const lastMsg = c.messages[c.messages.length - 1]
      if (lastMsg?.content?.toLowerCase().includes(q)) return true
      return false
    })
  }, [state.chats, state.search])

  const value = useMemo<ChatStoreValue>(() => {
    return {
      state,
      visibleChats: filteredChats,
      setSearch,
      setActiveChatId,
      createChat,
      renameChat,
      deleteChat,
      sendMessage,
      stopGeneration,
    }
  }, [filteredChats, state, setSearch, setActiveChatId, createChat, renameChat, deleteChat, sendMessage, stopGeneration])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatStore() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatStore must be used within ChatProvider')
  return ctx
}

