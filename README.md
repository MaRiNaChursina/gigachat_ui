# GigaChat UI

Интерфейс чата в стиле ChatGPT на `React + TypeScript + Vite` с интеграцией GigaChat API, стримингом ответа (SSE), историей чатов и настройками модели.

## Демо

- **Репозиторий:** `https://github.com/MaRiNaChursina/gigachat_ui`
- **Публичное приложение:** `https://gigachat-ui-three.vercel.app`(API временно не работает при сборки приложения)
- **Видео работы:** https://drive.google.com/file/d/1o9LVuA-0Uf1hUlmZhfCOVAl-mMLF7aMB/view?usp=drive_link


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
   git clone https://github.com/MaRiNaChursina/gigachat_ui.git
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
| `VITE_GIGACHAT_PROXY_BASE` | Опционально: внешний URL backend-прокси `.../api/gigachat` (используется и в dev, и в prod как приоритетный fallback). |


## Деплой

Рекомендуемый вариант — **Vercel**:

1. Import Project из GitHub.
2. Framework: `Vite`.
3. Добавить Environment Variables:
   - `VITE_GIGACHAT_AUTHORIZATION_KEY`
   - `VITE_GIGACHAT_SCOPE`
4. Нажать **Deploy**.

Для Vercel в проекте уже есть serverless-прокси `api/gigachat/*`, чтобы обходить CORS при запросах к GigaChat.

## Multimodal (изображения)

- В поле ввода доступна кнопка `🖼` для прикрепления изображения.
- Перед отправкой показывается превью, файл можно удалить.
- Пользовательское сообщение отправляется в GigaChat как multimodal `content` (`text` + `image_url`).
- Картинка сохраняется в истории и отображается в сообщениях пользователя.

