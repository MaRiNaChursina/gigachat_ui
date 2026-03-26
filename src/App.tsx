import { useState } from 'react'
import { AuthForm } from './components/auth/AuthForm'
import { ChatWindow } from './components/chat/ChatWindow'
import { AppLayout } from './components/layout/AppLayout'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { Sidebar } from './components/sidebar/Sidebar'
import { useAuth } from './features/auth/useAuth'
import { useChatState } from './features/chat/useChatState'
import { useSettingsTheme } from './features/settings/useSettingsTheme'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthed, login, logout } = useAuth()
  const chat = useChatState()
  const { settings, setSettings, settingsOpen, setSettingsOpen, defaultSettings } = useSettingsTheme()

  if (!isAuthed) {
    return <AuthForm onLogin={login} />
  }

  return (
    <>
      <AppLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        sidebar={
          <Sidebar
            chats={chat.chats}
            activeChatId={chat.activeChat?.id}
            searchValue={chat.search}
            onSearchChange={chat.setSearch}
            onSelectChat={(id) => {
              chat.selectChat(id)
              setSidebarOpen(false)
            }}
            onNewChat={() => {
              chat.createChat()
              setSidebarOpen(false)
            }}
            onDeleteChat={chat.deleteChat}
            onLogout={() => {
              logout()
              setSidebarOpen(false)
              setSettingsOpen(false)
            }}
          />
        }
      >
        <ChatWindow
          chatTitle={chat.activeChat?.title ?? 'Чат'}
          messages={chat.messages}
          isLoading={chat.isLoading}
          onSend={chat.sendMessage}
          onStop={chat.stopGeneration}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </AppLayout>

      <SettingsPanel
        open={settingsOpen}
        value={settings}
        onChange={setSettings}
        onClose={() => setSettingsOpen(false)}
        onSave={() => setSettingsOpen(false)}
        onReset={() => setSettings(defaultSettings)}
      />
    </>
  )
}
