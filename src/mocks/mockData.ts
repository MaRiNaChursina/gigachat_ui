import type { Message } from '../types/message'

export type Chat = {
  id: string
  title: string
  lastMessageAt: string
}

export type ChatMessage = Message

export const mockChats: Chat[] = [
  { id: 'c1', title: 'План на семестр по магистратуре МФТИ', lastMessageAt: '2026-03-12' },
  { id: 'c2', title: 'Идеи для итогового проекта: чат-ассистент', lastMessageAt: '2026-03-11' },
  { id: 'c3', title: 'Краткий конспект: JSX и Props', lastMessageAt: '2026-03-10' },
  { id: 'c4', title: 'Список вопросов', lastMessageAt: '2026-03-09' },
  { id: 'c5', title: 'Подготовка к собеседованию (frontend)', lastMessageAt: '2026-03-08' },
]

export const mockMessagesByChatId: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'm1',
      role: 'assistant',
      timestamp: '10:02',
      content:
        'Привет! Вот набросок плана:\n\n- **React**: компоненты, JSX, props\n- **TS**: типы, дженерики, утилиты\n- **Практика**: мини-проекты каждую неделю\n\n```ts\ntype WeekPlan = { week: number; topic: string }\n```',
    },
    {
      id: 'm2',
      role: 'user',
      timestamp: '10:03',
      content: 'Сделай, пожалуйста, *чуть* более подробный план на 4 недели.',
    },
    {
      id: 'm3',
      role: 'assistant',
      timestamp: '10:04',
      content:
        'Ок:\n\n1. Неделя 1 — компоненты и **props**\n2. Неделя 2 — состояние и эффекты\n3. Неделя 3 — роутинг и формы\n4. Неделя 4 — финальная сборка и polish',
    },
    {
      id: 'm4',
      role: 'user',
      timestamp: '10:05',
      content: 'Добавь рекомендации по чтению документации (React/TS).',
    },
    {
      id: 'm5',
      role: 'assistant',
      timestamp: '10:06',
      content:
        'Рекомендую:\n\n- React: разделы про *composition* и rendering\n- TypeScript: **type narrowing**, unions, generics\n- Практика: переписывать небольшие компоненты с JS на TS',
    },
    {
      id: 'm6',
      role: 'user',
      timestamp: '10:07',
      content: 'Спасибо!',
    },
  ],
  c2: [
    {
      id: 'm1',
      role: 'assistant',
      timestamp: '18:10',
      content: 'Можно сделать: **чат**, заметки, или трекер задач. Что ближе?',
    },
    {
      id: 'm2',
      role: 'user',
      timestamp: '18:11',
      content: 'Чат-ассистент. Хочу UI как в мессенджере.',
    },
    {
      id: 'm3',
      role: 'assistant',
      timestamp: '18:12',
      content:
        'Отлично. Начни с layout + sidebar + messages. Markdown можно рендерить через `react-markdown`.',
    },
    {
      id: 'm4',
      role: 'user',
      timestamp: '18:13',
      content: 'Сделаем на CSS variables и адаптив.',
    },
    {
      id: 'm5',
      role: 'assistant',
      timestamp: '18:14',
      content: 'Да. На mobile sidebar лучше как drawer с overlay.',
    },
    {
      id: 'm6',
      role: 'user',
      timestamp: '18:15',
      content: 'Понял.',
    },
  ],
  c3: [],
  c4: [],
  c5: [],
}

