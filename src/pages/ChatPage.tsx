import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChatWindow } from '../components/chat/ChatWindow'
import { useChatStore } from '../state/chat/ChatProvider'

export type ChatPageProps = {
  onSend: (text: string) => void
  onStop: () => void
  onOpenSettings: () => void
  onOpenSidebar: () => void
}

export function ChatPage({ onSend, onStop, onOpenSettings, onOpenSidebar }: ChatPageProps) {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const chat = useChatStore()

  const id = params.id
  const chats = chat.state.chats
  const activeChatId = chat.state.activeChatId
  const setActiveChatId = chat.setActiveChatId

  useEffect(() => {
    if (!id) return
    const exists = chats.some((c) => c.id === id)
    if (!exists) {
      navigate('/', { replace: true })
      return
    }
    if (activeChatId !== id) {
      setActiveChatId(id)
    }
  }, [id, chats, activeChatId, navigate, setActiveChatId])

  const activeChat = id ? chats.find((c) => c.id === id) : null

  if (id && !activeChat) return <Navigate to="/" replace />

  return (
    <ChatWindow
      chatId={id}
      chatTitle={activeChat?.title ?? 'Чат'}
      messages={activeChat?.messages ?? []}
      isLoading={chat.state.isLoading}
      onSend={onSend}
      onStop={onStop}
      onOpenSettings={onOpenSettings}
      onOpenSidebar={onOpenSidebar}
    />
  )
}

