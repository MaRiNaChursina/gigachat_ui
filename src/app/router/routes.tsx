import { lazy } from 'react'

export const HomePageLazy = lazy(() =>
  import('../../pages/HomePage').then((m) => ({ default: m.HomePage })),
)

export const ChatPageLazy = lazy(() =>
  import('../../pages/ChatPage').then((m) => ({ default: m.ChatPage })),
)
