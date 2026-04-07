# React + TypeScript + Vite

- Запуск приложения: `npm run dev`
- Сборка: `npm run build`

## Тесты

Команда: `npm test` (Vitest, окружение jsdom). Режим наблюдения: `npm run test:watch`.

Что покрыто:

- `src/state/chat/chatReducer.test.ts` — действия `ADD_MESSAGE`, `CREATE_CHAT`, `DELETE_CHAT`, `RENAME_CHAT`.
- `src/state/chat/chatStorage.test.ts` — сохранение/загрузка состояния в `localStorage`, мок через `vi.stubGlobal`, устойчивость к невалидному JSON.
- `src/components/chat/InputArea.test.tsx` — отправка по кнопке и Enter, блокировка пустого ввода.
- `src/components/chat/Message.test.tsx` — варианты `user` / `assistant`, кнопка «Копировать» только у ассистента.
- `src/components/sidebar/Sidebar.test.tsx` — поиск по названиям чатов, подтверждение удаления (как в `App`).
- `src/api/gigachat.test.ts` — пример `vi.mock` для API GigaChat без реальных HTTP-запросов.
