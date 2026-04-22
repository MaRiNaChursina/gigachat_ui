# GigaChat UI

Интерфейс чата в стиле ChatGPT на `React + TypeScript + Vite` с интеграцией GigaChat API, стримингом ответа (SSE), историей чатов и настройками модели.

## Демо

- **Репозиторий:** `https://github.com/<username>/<repo>`
- **Публичное приложение:** `https://YOUR_PROJECT.vercel.app`
- **Скриншоты/видео работы:** добавьте сюда 2-4 скриншота или ссылку на запись экрана.
- **Скриншот анализа бандла:** `docs/bundle-analysis.png`

## Стек

| Технология | Версия |
| ---------- | ------ |
| React | `^18.2.0` |
| TypeScript | `~5.9.3` |
| Vite | `^5.4.0` |
| React Router DOM | `^7.13.2` |
| State management | `Context API + useReducer` |
| HTTP | `Fetch API` |
| Markdown | `react-markdown` |
| Подсветка кода | `highlight.js` |
| Стили | `CSS Modules` |
| Тесты | `Vitest + Testing Library` |

## Запуск локально

1. Клонировать репозиторий:
   ```bash
   git clone https://github.com/<username>/<repo>.git
   cd frontend
   ```
2. Установить зависимости:
   ```bash
   npm install
   ```
3. Создать `.env` на основе `.env.example` и заполнить переменные.
4. Запустить приложение:
   ```bash
   npm run dev
   ```

Дополнительные команды:

```bash
npm run build
npm run preview
npm test
npm run analyze
```

## Env

| Переменная | Описание |
| ---------- | -------- |
| `VITE_GIGACHAT_AUTHORIZATION_KEY` | Authorization Key (base64) для получения OAuth токена GigaChat. Передавать без префикса `Basic `. |
| `VITE_GIGACHAT_SCOPE` | Scope для OAuth. Обычно `GIGACHAT_API_PERS`. |
| `VITE_BASE_PATH` | Базовый путь для сборки (актуально для GitHub Pages). |
| `VITE_GIGACHAT_PROXY_BASE` | Опционально: внешний URL прокси `.../api/gigachat` для статического хостинга без serverless. |

> Секреты храните только в переменных окружения (`.env`, Vercel Environment Variables, GitHub Secrets), не в коде.

## Деплой

Рекомендуемый вариант — **Vercel**:

1. Import Project из GitHub.
2. Framework: `Vite`.
3. Добавить Environment Variables:
   - `VITE_GIGACHAT_AUTHORIZATION_KEY`
   - `VITE_GIGACHAT_SCOPE`
4. Нажать **Deploy**.

Для Vercel в проекте уже есть serverless-прокси `api/gigachat/*`, чтобы обходить CORS при запросах к GigaChat.

## Самопроверка перед сдачей

- [ ] Есть ссылка на GitHub репозиторий.
- [ ] README заполнен (Демо, Стек, Запуск локально, Env).
- [ ] Приложение открывается по публичной ссылке.
- [ ] Токен GigaChat хранится только в env.
- [ ] Поиск работает по названию и содержимому чатов.
- [ ] Переименование/удаление чатов работает.
- [ ] Ошибки изолированы через `ErrorBoundary`.
- [ ] В репозитории есть `docs/bundle-analysis.png`.
