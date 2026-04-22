import type { ChatMessageContextRole } from '../state/chat/types'

type GigachatRole = 'user' | 'assistant' | 'system'

export type GigachatChatCompletionParams = {
  model: string
  messages: { role: ChatMessageContextRole; content: string }[]
  stream: boolean
  temperature?: number
  topP?: number
  maxTokens?: number
  repetitionPenalty?: number
  abortController: AbortController
  onDelta?: (chunk: string) => void
}

type GigachatStreamEvent =
  | {
      choices?: Array<{
        delta?: { content?: string; role?: string }
        index?: number
        finish_reason?: string
      }>
      [k: string]: unknown
    }
  | [string]

/**
 * В dev Vite проксирует на Sber (vite.config).
 * В prod — тот же origin `/api/gigachat/*` (serverless на Vercel, см. `api/gigachat/`), иначе CORS.
 * Для статики без API (например только GitHub Pages) задайте полный URL прокси: VITE_GIGACHAT_PROXY_BASE.
 */
function gigachatProxyBase(): string {
  const custom = (import.meta.env.VITE_GIGACHAT_PROXY_BASE as string | undefined)?.trim()
  if (custom) return custom.replace(/\/$/, '')
  if (import.meta.env.DEV) return ''
  return '/api/gigachat'
}

function gigachatOAuthUrl() {
  if (import.meta.env.DEV) return '/__proxy/gigachat/oauth'
  return `${gigachatProxyBase()}/oauth`
}

function gigachatChatCompletionsUrl() {
  if (import.meta.env.DEV) return '/__proxy/gigachat/api/v1/chat/completions'
  return `${gigachatProxyBase()}/v1/chat/completions`
}

/** Убирает типичные ошибки .env: пробелы, CRLF, лишний префикс Basic, кавычки; при необходимости кодирует «id:secret» в Base64. */
export function normalizeGigachatAuthorizationKey(raw: string): string {
  let k = raw.trim()
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim()
  }
  if (/^basic\b/i.test(k)) {
    k = k.replace(/^basic\b\s*/i, '').trim()
  }
  // Иногда ключ копируется с переносами/пробелами из UI — удаляем всю whitespace-разметку.
  k = k.replace(/\s+/g, '')
  // В кабинете дают готовый Base64; если вставили сырую пару client_id:client_secret:
  const looksLikeIdSecretPair = /^[\w.-]+:[\w.-]+$/.test(k) && k.length < 120 && !/[+/]{2}/.test(k)
  if (looksLikeIdSecretPair && typeof btoa === 'function') {
    k = btoa(k)
  }
  return k.trim()
}

function normalizeScope(raw: string | undefined, fallback: string) {
  const s = (raw ?? fallback).trim()
  return s.length > 0 ? s : fallback
}

export async function gigachatChatCompletion({
  model,
  messages,
  stream,
  temperature,
  topP,
  maxTokens,
  repetitionPenalty,
  abortController,
  onDelta,
}: GigachatChatCompletionParams): Promise<{ text: string }> {
  const rawKey = import.meta.env.VITE_GIGACHAT_AUTHORIZATION_KEY as string | undefined
  const scope = normalizeScope(import.meta.env.VITE_GIGACHAT_SCOPE as string | undefined, 'GIGACHAT_API_PERS')

  // В локальной разработке ключ обязателен (браузер -> dev proxy -> Sber).
  // В проде на Vercel можно не передавать VITE_* ключ: serverless-функция возьмет server env.
  if (import.meta.env.DEV && !rawKey?.trim()) {
    throw new Error('Не задана переменная окружения VITE_GIGACHAT_AUTHORIZATION_KEY')
  }

  const authorizationKey = rawKey?.trim() ? normalizeGigachatAuthorizationKey(rawKey) : undefined

  const token = await getAccessToken({ authorizationKey, scope })

  const res = await fetch(gigachatChatCompletionsUrl(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role as GigachatRole, content: m.content })),
      stream,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      repetition_penalty: repetitionPenalty ?? 1,
      update_interval: 0,
    }),
    signal: abortController.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GigaChat error ${res.status}: ${text || res.statusText}`)
  }

  if (!stream) {
    const json = (await res.json()) as any
    const assistantText = json?.choices?.[0]?.message?.content ?? ''
    return { text: assistantText }
  }

  if (!res.body) {
    throw new Error('GigaChat streaming: отсутствует body у ответа')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')

  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE events are separated by blank lines.
    const parts = buffer.split(/\n\n/)
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue
      if (!trimmed.startsWith('data:')) {
        continue
      }

      // Robustly extract data payload (supports `data:` on its own line).
      const firstDataIdx = part.indexOf('data:')
      const dataStr = part.slice(firstDataIdx + 'data:'.length).trim()
      if (!dataStr) continue
      if (dataStr === '[DONE]') {
        return { text: fullText }
      }

      try {
        const evt = JSON.parse(dataStr) as GigachatStreamEvent
        const chunk = (evt as any)?.choices?.[0]?.delta?.content
        if (typeof chunk === 'string' && chunk.length > 0) {
          fullText += chunk
          onDelta?.(chunk)
        }
      } catch {
        // ignore malformed chunk
      }
    }
  }

  return { text: fullText }
}

async function getAccessToken({ authorizationKey, scope }: { authorizationKey?: string; scope: string }) {
  const rqUID = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`

  const res = await fetch(gigachatOAuthUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...(authorizationKey ? { Authorization: `Basic ${authorizationKey}` } : {}),
      RqUID: rqUID,
    },
    body: new URLSearchParams({ scope }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const hint =
      res.status === 500
        ? ' Проверьте ключ (одна строка Base64 из кабинета, без «Basic »), VITE_GIGACHAT_SCOPE (часто GIGACHAT_API_PERS), что ключ не отозван и dev-сервер перезапущен после правки .env.'
        : ''
    throw new Error(`GigaChat token error ${res.status}: ${text || res.statusText}.${hint}`)
  }

  const json = (await res.json()) as any
  const token = json?.access_token
  if (!token) throw new Error('GigaChat token: access_token не найден')
  return token as string
}

