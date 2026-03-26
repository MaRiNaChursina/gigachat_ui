import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Chat, ChatMessage } from '../../mocks/mockData'
import { mockChats, mockMessagesByChatId } from '../../mocks/mockData'
import { getNowTimeLabel, getTodayIsoDate } from '../../shared/lib/time'

export function useChatState() {
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [messagesByChatId, setMessagesByChatId] =
    useState<Record<string, ChatMessage[]>>(mockMessagesByChatId)
  const [activeChatId, setActiveChatId] = useState<string>(mockChats[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const responseTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current !== null) {
        window.clearTimeout(responseTimeoutRef.current)
      }
    }
  }, [])

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return chats
    return chats.filter((c) => c.title.toLowerCase().includes(q))
  }, [search, chats])

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) ?? chats[0],
    [activeChatId, chats],
  )

  const messages = useMemo(() => {
    if (!activeChat?.id) return []
    return messagesByChatId[activeChat.id] ?? []
  }, [activeChat?.id, messagesByChatId])

  const selectChat = useCallback((id: string) => setActiveChatId(id), [])

  const createChat = useCallback(() => {
    const id = `c${Date.now()}`
    setChats((prev) => {
      const newChat: Chat = {
        id,
        title: `Новый чат ${prev.length + 1}`,
        lastMessageAt: getTodayIsoDate(),
      }
      return [newChat, ...prev]
    })
    setMessagesByChatId((prev) => ({ ...prev, [id]: [] }))
    setActiveChatId(id)
  }, [])

  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== chatId)
      setActiveChatId((current) => (current === chatId ? next[0]?.id ?? '' : current))
      return next
    })
    setMessagesByChatId((prev) => {
      const next = { ...prev }
      delete next[chatId]
      return next
    })
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      const trimmedText = text.trim()
      if (!trimmedText || !activeChat?.id || isLoading) return

      if (responseTimeoutRef.current !== null) {
        window.clearTimeout(responseTimeoutRef.current)
      }

      const userMsg: ChatMessage = {
        id: `m${Date.now()}`,
        role: 'user',
        timestamp: getNowTimeLabel(),
        content: trimmedText,
      }

      setMessagesByChatId((prev) => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] ?? []), userMsg],
      }))

      setChats((prev) =>
        prev.map((c) => (c.id === activeChat.id ? { ...c, lastMessageAt: getTodayIsoDate() } : c)),
      )

      setIsLoading(true)
      const activeId = activeChat.id
      const timeoutMs = 1000 + Math.floor(Math.random() * 1000)

      responseTimeoutRef.current = window.setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `m${Date.now()}-assistant`,
          role: 'assistant',
          timestamp: getNowTimeLabel(),
          content: 'Принял сообщение. Это моковый ответ ассистента для домашнего задания.',
        }

        setMessagesByChatId((prev) => ({
          ...prev,
          [activeId]: [...(prev[activeId] ?? []), assistantMsg],
        }))
        setIsLoading(false)
        responseTimeoutRef.current = null
      }, timeoutMs)
    },
    [activeChat, isLoading],
  )

  const stopGeneration = useCallback(() => {
    if (responseTimeoutRef.current !== null) {
      window.clearTimeout(responseTimeoutRef.current)
      responseTimeoutRef.current = null
    }
    setIsLoading(false)
  }, [])

  return {
    chats: filteredChats,
    activeChat,
    activeChatId,
    messages,
    search,
    setSearch,
    isLoading,
    selectChat,
    createChat,
    deleteChat,
    sendMessage,
    stopGeneration,
    // also export raw setters if needed later
    setActiveChatId,
  }
}

