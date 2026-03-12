import { useCallback, useMemo, useState } from 'react'
import type { Chat, ChatMessage } from '../../mocks/mockData'
import { mockChats, mockMessagesByChatId } from '../../mocks/mockData'
import { getNowTimeLabel, getTodayIsoDate } from '../../shared/lib/time'

export function useChatState() {
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [messagesByChatId, setMessagesByChatId] =
    useState<Record<string, ChatMessage[]>>(mockMessagesByChatId)
  const [activeChatId, setActiveChatId] = useState<string>(mockChats[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')

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

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || !activeChat?.id) return

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      authorLabel: 'Вы',
      createdAt: getNowTimeLabel(),
      content: text,
    }

    setMessagesByChatId((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] ?? []), newMsg],
    }))

    setChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, lastMessageAt: getTodayIsoDate() } : c)),
    )

    setInput('')
  }, [activeChat?.id, input])

  return {
    chats: filteredChats,
    activeChat,
    activeChatId,
    messages,
    search,
    setSearch,
    input,
    setInput,
    selectChat,
    createChat,
    deleteChat,
    sendMessage,
    // also export raw setters if needed later
    setActiveChatId,
  }
}

