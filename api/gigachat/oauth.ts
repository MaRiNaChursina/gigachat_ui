import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, RqUID, Accept')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const bodyString =
    typeof req.body === 'string'
      ? req.body
      : req.body && typeof req.body === 'object'
        ? new URLSearchParams(req.body as Record<string, string>).toString()
        : ''

  const auth = req.headers.authorization
  const rawRq = req.headers['rquid'] ?? req.headers['RqUID']
  const rquid = Array.isArray(rawRq) ? rawRq[0] : rawRq ?? randomUUID()

  const upstream = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...(auth ? { Authorization: auth } : {}),
      RqUID: rquid,
    },
    body: bodyString,
  })

  const text = await upstream.text()
  const ct = upstream.headers.get('content-type')
  if (ct) res.setHeader('Content-Type', ct)
  return res.status(upstream.status).send(text)
}
