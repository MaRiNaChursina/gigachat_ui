import type { Chat } from '../../mocks/mockData'
import { Button } from '../ui/Button'
import { ChatList } from './ChatList'
import { SearchInput } from './SearchInput'
import cls from './Sidebar.module.css'

export type SidebarProps = {
  chats: Chat[]
  activeChatId?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onLogout: () => void
}

export function Sidebar({
  chats,
  activeChatId,
  searchValue,
  onSearchChange,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onLogout,
}: SidebarProps) {
  return (
    <aside className={cls.root} aria-label="Список чатов">
      <div className={cls.topRow}>
        <div className={cls.brand}>GigaChat UI</div>
        <Button type="button" variant="ghost" iconOnly title="Выйти" onClick={onLogout}>
          Выйти
        </Button>
      </div>

      <Button className={cls.newChatBtn} variant="primary" onClick={onNewChat}>
        <span aria-hidden="true">＋</span> Новый чат
      </Button>

      <SearchInput value={searchValue} onChange={onSearchChange} />

      <div className={cls.divider} />

      <ChatList
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
      />
    </aside>
  )
}

