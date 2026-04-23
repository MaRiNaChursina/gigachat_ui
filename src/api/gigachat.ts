import type { ChatMessageContextRole } from '../state/chat/types'

type GigachatRole = 'user' | 'assistant' | 'system'
type GigachatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } | string }

export type GigachatModel = {
  id: string
  object?: string
  owned_by?: string
}

export type GigachatChatCompletionParams = {
  model: string
  messages: { role: ChatMessageContextRole; content: string | GigachatContentPart[] }[]
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


function gigachatProxyBase(): string {
  const custom = (import.meta.env.VITE_GIGACHAT_PROXY_BASE as string | undefined)?.trim()
  if (custom) return custom.replace(/\/$/, '')
  if (import.meta.env.DEV) return ''
  return '/api/gigachat'
}

function gigachatOAuthUrl() {
  const custom = gigachatProxyBase()
  if (custom) return `${custom}/oauth`
  if (import.meta.env.DEV) return '/__proxy/gigachat/oauth'
  return '/api/gigachat/oauth'
}

function gigachatChatCompletionsUrl() {
  const custom = gigachatProxyBase()
  if (custom) return `${custom}/v1/chat/completions`
  if (import.meta.env.DEV) return '/__proxy/gigachat/api/v1/chat/completions'
  return '/api/gigachat/v1/chat/completions'
}

function gigachatModelsUrl() {
  const custom = gigachatProxyBase()
  if (custom) return `${custom}/v1/models`
  if (import.meta.env.DEV) return '/__proxy/gigachat/api/v1/models'
  return '/api/gigachat/v1/models'
}


export function normalizeGigachatAuthorizationKey(raw: string): string {
  let k = raw.trim()
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim()
  }
  if (/^basic\b/i.test(k)) {
    k = k.replace(/^basic\b\s*/i, '').trim()
  }

  k = k.replace(/\s+/g, '')

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

 
  if (import.meta.env.DEV && !rawKey?.trim()) {
    throw new Error('Не задана переменная окружения VITE_GIGACHAT_AUTHORIZATION_KEY')
  }

  const authorizationKey = rawKey?.trim() ? normalizeGigachatAuthorizationKey(rawKey) : undefined

  const token = await getAccessToken({ authorizationKey, scope })

  const hasMultimodal = messages.some((m) => Array.isArray(m.content))
  const commonPayload = {
    model,
    stream,
    temperature,
    top_p: topP,
    max_tokens: maxTokens,
    repetition_penalty: repetitionPenalty ?? 1,
    update_interval: 0,
  }
  const makeMessages = (imageUrlAsString: boolean) =>
    messages.map((m) => ({
      role: m.role as GigachatRole,
      content: Array.isArray(m.content)
        ? m.content.map((part) => {
            if (part.type !== 'image_url') return part
            const raw = typeof part.image_url === 'string' ? part.image_url : part.image_url.url
            return imageUrlAsString
              ? ({ type: 'image_url', image_url: raw } as const)
              : ({ type: 'image_url', image_url: { url: raw } } as const)
          })
        : m.content,
    }))

  const doRequest = (imageUrlAsString: boolean) =>
    fetch(gigachatChatCompletionsUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...commonPayload,
        messages: makeMessages(imageUrlAsString),
      }),
      signal: abortController.signal,
    })

  let res = await doRequest(false)
  if (!res.ok && res.status === 400 && hasMultimodal) {
    const firstErrText = await res.text().catch(() => '')
    if (/invalid json syntax/i.test(firstErrText)) {
      // Для некоторых конфигураций GigaChat multimodal требует image_url как строку, а не объект {url}.
      res = await doRequest(true)
    } else {
      throw new Error(`GigaChat error ${res.status}: ${firstErrText || res.statusText}`)
    }
  }

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

    const parts = buffer.split(/\n\n/)
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue
      if (!trimmed.startsWith('data:')) {
        continue
      }

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

      }
    }
  }

  return { text: fullText }
}

export async function gigachatGetModels(): Promise<GigachatModel[]> {
  const rawKey = import.meta.env.VITE_GIGACHAT_AUTHORIZATION_KEY as string | undefined
  const scope = normalizeScope(import.meta.env.VITE_GIGACHAT_SCOPE as string | undefined, 'GIGACHAT_API_PERS')

  if (import.meta.env.DEV && !rawKey?.trim()) {
    throw new Error('Не задана переменная окружения VITE_GIGACHAT_AUTHORIZATION_KEY')
  }

  const authorizationKey = rawKey?.trim() ? normalizeGigachatAuthorizationKey(rawKey) : undefined
  const token = await getAccessToken({ authorizationKey, scope })

  const res = await fetch(gigachatModelsUrl(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GigaChat models error ${res.status}: ${text || res.statusText}`)
  }

  const json = (await res.json()) as { data?: GigachatModel[] }
  return Array.isArray(json.data) ? json.data : []
}

async function getAccessToken({ authorizationKey, scope }: { authorizationKey?: string; scope: string }) {
  const rqUID = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`
  const url = gigachatOAuthUrl()

  const res = await fetch(url, {
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
    type OAuthErrorPayload = {
      diagnostics?: { authSource?: string; scope?: string; hint?: string }
      error?: { message?: string }
    }
    let parsed: OAuthErrorPayload | null = null
    try {
      parsed = JSON.parse(text) as OAuthErrorPayload
    } catch {
      parsed = null
    }
    const details = [
      parsed?.diagnostics?.authSource ? `authSource=${parsed.diagnostics.authSource}` : null,
      parsed?.diagnostics?.scope ? `scope=${parsed.diagnostics.scope}` : null,
      `oauthUrl=${url}`,
    ]
      .filter(Boolean)
      .join(', ')
    const hint =
      res.status === 500
        ? ` Проверьте: (1) одинаковый ключ в PowerShell, .env и Vercel; (2) scope; (3) после правки .env перезапущен dev-сервер. ${parsed?.diagnostics?.hint ?? ''}`
        : ''
    const upstreamMessage = parsed?.error?.message || text || res.statusText
    throw new Error(`GigaChat token error ${res.status}: ${upstreamMessage}. [${details}]${hint}`)
  }

  const json = (await res.json()) as any
  const token = json?.access_token
  if (!token) throw new Error('GigaChat token: access_token не найден')
  return token as string
}

