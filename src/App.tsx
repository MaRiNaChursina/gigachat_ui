import { useState } from 'react'
import { AuthForm } from './components/auth/AuthForm'
import { AppLayout } from './components/layout/AppLayout'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { Sidebar } from './components/sidebar/Sidebar'
import { useAuth } from './features/auth/useAuth'
import { useSettingsTheme } from './features/settings/useSettingsTheme'
import { useChatStore } from './state/chat/ChatProvider'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ChatPage } from './pages/ChatPage'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthed, login, logout } = useAuth()
  const chat = useChatStore()
  const { settings, setSettings, settingsOpen, setSettingsOpen, defaultSettings } = useSettingsTheme()
  const navigate = useNavigate()

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
            chats={chat.visibleChats}
            activeChatId={chat.state.activeChatId ?? undefined}
            searchValue={chat.state.search}
            onSearchChange={chat.setSearch}
            onSelectChat={(id) => {
              chat.setActiveChatId(id)
              navigate(`/chat/${id}`)
              setSidebarOpen(false)
            }}
            onNewChat={() => {
              const id = chat.createChat()
              navigate(`/chat/${id}`)
              setSidebarOpen(false)
            }}
            onEditChat={(id) => {
              const current = chat.state.chats.find((c) => c.id === id)
              const next = window.prompt('Новое название чата:', current?.title ?? '')
              if (typeof next === 'string') {
                const title = next.trim()
                if (title.length > 0) chat.renameChat(id, title)
              }
            }}
            onDeleteChat={(id) => {
              const ok = window.confirm('Удалить чат?')
              if (!ok) return
              const isActive = chat.state.activeChatId === id
              chat.deleteChat(id)
              if (isActive) navigate('/', { replace: true })
            }}
            onLogout={() => {
              logout()
              setSidebarOpen(false)
              setSettingsOpen(false)
            }}
          />
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSend={(text) =>
                  chat.sendMessage(text, {
                    systemPrompt: settings.systemPrompt,
                    model: settings.model,
                    temperature: settings.temperature,
                    topP: settings.topP,
                    maxTokens: settings.maxTokens,
                    stream: true,
                  })
                }
                onStop={chat.stopGeneration}
                onOpenSettings={() => setSettingsOpen(true)}
                onOpenSidebar={() => setSidebarOpen(true)}
              />
            }
          />
          <Route
            path="/chat/:id"
            element={
              <ChatPage
                onSend={(text) =>
                  chat.sendMessage(text, {
                    systemPrompt: settings.systemPrompt,
                    model: settings.model,
                    temperature: settings.temperature,
                    topP: settings.topP,
                    maxTokens: settings.maxTokens,
                    stream: true,
                  })
                }
                onStop={chat.stopGeneration}
                onOpenSettings={() => setSettingsOpen(true)}
                onOpenSidebar={() => setSidebarOpen(true)}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
