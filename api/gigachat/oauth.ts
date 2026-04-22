import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, RqUID, Accept')
}

function normalizeAuthValue(raw: string | undefined) {
  if (!raw) return ''
  let v = raw.trim()
  if (/^basic\b/i.test(v)) v = v.replace(/^basic\b\s*/i, '')
  v = v.replace(/\s+/g, '')
  return v
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const reqScope =
    typeof req.body === 'object' && req.body && 'scope' in req.body
      ? String((req.body as Record<string, unknown>).scope ?? '')
      : ''
  const scope = reqScope || process.env.VITE_GIGACHAT_SCOPE || 'GIGACHAT_API_PERS'
  const bodyString = new URLSearchParams({ scope }).toString()

  const fromHeader = normalizeAuthValue(req.headers.authorization)
  const fromEnv = normalizeAuthValue(
    process.env.GIGACHAT_AUTHORIZATION_KEY || process.env.VITE_GIGACHAT_AUTHORIZATION_KEY,
  )
  const authValue = fromHeader || fromEnv
  if (!authValue) {
    return res.status(500).json({
      error: {
        code: 'CONFIG_ERROR',
        message:
          'Authorization key is missing. Set GIGACHAT_AUTHORIZATION_KEY or VITE_GIGACHAT_AUTHORIZATION_KEY in Vercel.',
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
    },
    body: bodyString,
  })

  const text = await upstream.text()
  const ct = upstream.headers.get('content-type')
  if (ct) res.setHeader('Content-Type', ct)
  return res.status(upstream.status).send(text)
}
