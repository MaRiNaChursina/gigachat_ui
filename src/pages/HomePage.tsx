import type { MessageImage } from '../types/message'
import { ChatWindow } from '../components/chat/ChatWindow'
import { useChatStore } from '../state/chat/ChatProvider'

export type HomePageProps = {
  onSend: (payload: { text: string; image?: MessageImage }) => void
  onStop: () => void
  onOpenSettings: () => void
  onOpenSidebar: () => void
}

export function HomePage({ onSend, onStop, onOpenSettings, onOpenSidebar }: HomePageProps) {
  const chat = useChatStore()
  const activeChat = chat.state.activeChatId ? chat.state.chats.find((c) => c.id === chat.state.activeChatId) : null

  return (
    <ChatWindow
      chatId={chat.state.activeChatId ?? undefined}
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

