import type { ChatMessageContextRole } from '../state/chat/types'

type GigachatRole = 'user' | 'assistant' | 'system'

export type GigachatChatCompletionParams = {
  model: string
  messages: { role: ChatMessageContextRole; content: string }[]
  stream: boolean
  temperature?: number
  topP?: number
  maxTokens?: number
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

export async function gigachatChatCompletion({
  model,
  messages,
  stream,
  temperature,
  topP,
  maxTokens,
  abortController,
  onDelta,
}: GigachatChatCompletionParams): Promise<{ text: string }> {
  const authorizationKey = import.meta.env.VITE_GIGACHAT_AUTHORIZATION_KEY as string | undefined
  const scope = (import.meta.env.VITE_GIGACHAT_SCOPE as string | undefined) ?? 'GIGACHAT_API_PERS'

  if (!authorizationKey) {
    throw new Error('Не задана переменная окружения VITE_GIGACHAT_AUTHORIZATION_KEY')
  }

  const token = await getAccessToken({ authorizationKey, scope })

  const res = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
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

async function getAccessToken({ authorizationKey, scope }: { authorizationKey: string; scope: string }) {
  const rqUID = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`

  const res = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${authorizationKey}`,
      RqUID: rqUID,
    },
    body: new URLSearchParams({ scope }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GigaChat token error ${res.status}: ${text || res.statusText}`)
  }

  const json = (await res.json()) as any
  const token = json?.access_token
  if (!token) throw new Error('GigaChat token: access_token не найден')
  return token as string
}

