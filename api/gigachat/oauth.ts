import { randomUUID } from 'node:crypto'
import { setDefaultResultOrder } from 'node:dns'
import type { VercelRequest, VercelResponse } from '@vercel/node'


try {
  setDefaultResultOrder('ipv4first')
} catch {

}


const UPSTREAM_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, RqUID, Accept')
}


function normalizeAuthValue(raw: string | undefined) {
  if (!raw) return ''
  let v = raw.trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim()
  }
  if (/^basic\b/i.test(v)) v = v.replace(/^basic\b\s*/i, '').trim()
  v = v.replace(/\s+/g, '')
  const looksLikeIdSecretPair =
    /^[\w.-]+:[\w.-]+$/.test(v) && v.length < 120 && !/[+/]{2}/.test(v)
  if (looksLikeIdSecretPair) {
    v = Buffer.from(v, 'utf8').toString('base64')
  }
  return v.trim()
}

function scopeFromRequestBody(body: unknown): string {
  if (Buffer.isBuffer(body)) {
    try {
      return new URLSearchParams(body.toString('utf8')).get('scope') ?? ''
    } catch {
      return ''
    }
  }
  if (typeof body === 'object' && body !== null && 'scope' in body) {
    return String((body as Record<string, unknown>).scope ?? '')
  }
  if (typeof body === 'string' && body.length > 0) {
    try {
      return new URLSearchParams(body).get('scope') ?? ''
    } catch {
      return ''
    }
  }
  return ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const reqScope = scopeFromRequestBody(req.body)
  const scope = reqScope || process.env.VITE_GIGACHAT_SCOPE || 'GIGACHAT_API_PERS'
  const bodyString = new URLSearchParams({ scope }).toString()

  const fromHeader = normalizeAuthValue(req.headers.authorization)
  const fromEnv = normalizeAuthValue(
    process.env.GIGACHAT_AUTHORIZATION_KEY || process.env.VITE_GIGACHAT_AUTHORIZATION_KEY,
  )

  const authValue = fromEnv || fromHeader
  const authSource = fromEnv ? 'env' : fromHeader ? 'header' : 'none'
  if (!authValue) {
    return res.status(500).json({
      error: {
        code: 'CONFIG_ERROR',
        message:
          'Authorization key is missing. Set GIGACHAT_AUTHORIZATION_KEY or VITE_GIGACHAT_AUTHORIZATION_KEY in Vercel.',
      },
      diagnostics: {
        authSource,
        scope,
      },
    })
  }

  const rawRq = req.headers['rquid'] ?? req.headers['RqUID']
  const rquid = Array.isArray(rawRq) ? rawRq[0] : rawRq ?? randomUUID()

  const upstream = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${authValue}`,
      RqUID: rquid,
      'User-Agent': UPSTREAM_UA,
    },
    body: bodyString,
  })

  const text = await upstream.text()
  const ct = upstream.headers.get('content-type')
  if (!upstream.ok) {
    return res.status(upstream.status).json({
      error: {
        code: String(upstream.status),
        message: text || upstream.statusText,
      },
      diagnostics: {
        authSource,
        scope,
        hint:
          upstream.status === 500
            ? 'Если тот же ключ с вашего ПК выдаёт токен, а из Vercel — 500, часто виноваты фильтрация по IP/сети облака или отличие TLS/UA; после деплоя проверьте снова.'
            : undefined,
      },
    })
  }

  if (ct) res.setHeader('Content-Type', ct)
  return res.status(upstream.status).send(text)
}
