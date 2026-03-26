import { ChatWindow } from '../components/chat/ChatWindow'
import { useChatStore } from '../state/chat/ChatProvider'

export type HomePageProps = {
  onSend: (text: string) => void
  onStop: () => void
  onOpenSettings: () => void
  onOpenSidebar: () => void
}

export function HomePage({ onSend, onStop, onOpenSettings, onOpenSidebar }: HomePageProps) {
  const chat = useChatStore()
  const activeChat = chat.state.activeChatId ? chat.state.chats.find((c) => c.id === chat.state.activeChatId) : null

  return (
    <ChatWindow
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

