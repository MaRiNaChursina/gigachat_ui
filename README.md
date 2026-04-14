# GigaChat UI

Клиент чата на React + TypeScript (Vite) с ответами GigaChat API, ленивой загрузкой экранов и изоляцией ошибок.

## Демо

**Хостинги:**  Vercel — `https://YOUR_PROJECT.vercel.app`

**Скриншот:** анализ бандла — `docs/bundle-analysis.png` (интерактивный отчёт: `npm run analyze` → `docs/bundle-stats.html`).

Краткая запись экрана или дополнительные скриншоты работы чата можно добавить в этот раздел после публикации.

## Стек

| Технология | Версия (см. `package.json`) |
| ----------------- | ----------------------------- |
| React             | ^18.2.0                       |
| TypeScript        | ~5.9.3                        |
| Vite              | ^5.4.0                        |
| React Router DOM  | ^7.13.2                       |
| Состояние чата    | React Context + `useReducer` (`ChatProvider`) |
| Стили | CSS Modules                   |
| Markdown / код    | `react-markdown`, `highlight.js` (отдельные чанки) |

## Запуск локально

1. Клонировать репозиторий и перейти в каталог проекта:
   ```bash
   git clone <URL_репозитория>
   cd frontend
   ```
2. Установить зависимости:
   ```bash
   npm install
   ```
3. Создать файл `.env` по образцу `.env.example` и заполнить переменные (без коммита секретов).
4. Запустить dev-сервер:
   ```bash
   npm run dev
   ```

**GigaChat и «Failed to fetch»:** запросы с страницы в браузере к `*.sberbank.ru` без своего backend блокируются **CORS**. В режиме `npm run dev` Vite **проксирует** OAuth и чат (см. `vite.config.ts`, префикс `/__proxy/gigachat/…`). Статическая выкладка (GitHub Pages и т.п.) без прокси снова упирается в CORS — нужен серверный прокси или serverless-функция.

Сборка продакшена: `npm run build`. Просмотр сборки: `npm run preview`.

Анализ бандла (treemap + отчёт в `docs/bundle-stats.html`):

```bash
npm run analyze
```

Скриншот визуализатора в `docs/bundle-analysis.png` (нужен Chromium для Playwright):

```bash
npx playwright install chromium
npm run docs:bundle-png
```

## Env (переменные окружения)

| Переменная | Описание |
| ---------- | -------- |
| `VITE_GIGACHAT_AUTHORIZATION_KEY` | Base64-строка для заголовка `Authorization: Basic …` при запросе OAuth-токена GigaChat. В код не вшивать. |
| `VITE_GIGACHAT_SCOPE` | Область OAuth (по умолчанию `GIGACHAT_API_PERS`). |
| `VITE_BASE_PATH` | Базовый URL-путь приложения при сборке (локально или CI). На GitHub Pages workflow по умолчанию задаёт `/<имя-репозитория>/`. Для сайта с корня `username.github.io` задайте переменную репозитория `VITE_BASE_PATH` = `/`. |
| `VITE_GIGACHAT_PROXY_BASE` | Опционально: полный URL прокси (`…/api/gigachat`), если фронт на статике (GitHub Pages), а serverless с тем же кодом задеплоен на Vercel. На одном Vercel-проекте не нужен — используется `/api/gigachat` по умолчанию. |

В продакшне секреты GigaChat задавайте в GitHub **Secrets** (Pages) или в панели другого хостинга.




## Тесты

```bash
npm test
```

Режим наблюдения: `npm run test:watch`.
