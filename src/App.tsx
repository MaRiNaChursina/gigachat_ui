import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ChatPageLazy, HomePageLazy } from './app/router/routes'
import { AuthForm } from './components/auth/AuthForm'
import { AppLayout } from './components/layout/AppLayout'
import { useAuth } from './features/auth/useAuth'
import { useSettingsTheme } from './features/settings/useSettingsTheme'
import { useChatStore } from './state/chat/ChatProvider'

const SidebarLazy = lazy(() =>
  import('./components/sidebar/Sidebar').then((m) => ({ default: m.Sidebar })),
)

const SettingsPanelLazy = lazy(() =>
  import('./components/settings/SettingsPanel').then((m) => ({ default: m.SettingsPanel })),
)

function RouteFallback() {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100%',
        color: 'var(--color-text)',
        opacity: 0.75,
      }}
    >
      Загрузка…
    </div>
  )
}

function SidebarFallback() {
  return (
    <aside
      style={{
        padding: 16,
        borderRight: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
      aria-label="Список чатов"
    >
      Загрузка…
    </aside>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthed, login, logout } = useAuth()
  const chat = useChatStore()
  const { settings, setSettings, settingsOpen, setSettingsOpen, defaultSettings } = useSettingsTheme()
  const navigate = useNavigate()

  const gigachatSendOptions = useMemo(
    () => ({
      systemPrompt: settings.systemPrompt,
      model: settings.model,
      temperature: settings.temperature,
      topP: settings.topP,
      maxTokens: settings.maxTokens,
      stream: true as const,
    }),
    [
      settings.systemPrompt,
      settings.model,
      settings.temperature,
      settings.topP,
      settings.maxTokens,
    ],
  )

  const handleSend = useCallback(
    (text: string) => chat.sendMessage(text, gigachatSendOptions),
    [chat.sendMessage, gigachatSendOptions],
  )

  const handleStop = useCallback(() => chat.stopGeneration(), [chat.stopGeneration])

  const handleSelectChat = useCallback(
    (id: string) => {
      chat.setActiveChatId(id)
      navigate(`/chat/${id}`)
      setSidebarOpen(false)
    },
    [chat.setActiveChatId, navigate],
  )

  const handleNewChat = useCallback(() => {
    const id = chat.createChat()
    navigate(`/chat/${id}`)
    setSidebarOpen(false)
  }, [chat.createChat, navigate])

  const handleEditChat = useCallback(
    (id: string) => {
      const current = chat.state.chats.find((c) => c.id === id)
      const next = window.prompt('Новое название чата:', current?.title ?? '')
      if (typeof next === 'string') {
        const title = next.trim()
        if (title.length > 0) chat.renameChat(id, title)
      }
    },
    [chat.state.chats, chat.renameChat],
  )

  const handleDeleteChat = useCallback(
    (id: string) => {
      const ok = window.confirm('Удалить чат?')
      if (!ok) return
      const isActive = chat.state.activeChatId === id
      chat.deleteChat(id)
      if (isActive) navigate('/', { replace: true })
    },
    [chat.state.activeChatId, chat.deleteChat, navigate],
  )

  const handleLogout = useCallback(() => {
    logout()
    setSidebarOpen(false)
    setSettingsOpen(false)
  }, [logout, setSettingsOpen])

  const handleOpenSettings = useCallback(() => setSettingsOpen(true), [setSettingsOpen])
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), [])

  if (!isAuthed) {
    return <AuthForm onLogin={login} />
  }

  const sidebar = (
    <Suspense fallback={<SidebarFallback />}>
      <SidebarLazy
        chats={chat.visibleChats}
        activeChatId={chat.state.activeChatId ?? undefined}
        searchValue={chat.state.search}
        onSearchChange={chat.setSearch}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onEditChat={handleEditChat}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
      />
    </Suspense>
  )

  return (
    <>
      <AppLayout sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen} sidebar={sidebar}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePageLazy
                  onSend={handleSend}
                  onStop={handleStop}
                  onOpenSettings={handleOpenSettings}
                  onOpenSidebar={handleOpenSidebar}
                />
              }
            />
            <Route
              path="/chat/:id"
              element={
                <ChatPageLazy
                  onSend={handleSend}
                  onStop={handleStop}
                  onOpenSettings={handleOpenSettings}
                  onOpenSidebar={handleOpenSidebar}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>

      <Suspense fallback={null}>
        <SettingsPanelLazy
          open={settingsOpen}
          value={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
          onSave={() => setSettingsOpen(false)}
          onReset={() => setSettings(defaultSettings)}
        />
      </Suspense>
    </>
  )
}
