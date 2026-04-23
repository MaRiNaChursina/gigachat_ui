import { setDefaultResultOrder } from 'node:dns'
import type { VercelRequest, VercelResponse } from '@vercel/node'

try {
  setDefaultResultOrder('ipv4first')
} catch {
  /* ignore */
}

const UPSTREAM_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed')
  }

  const auth = req.headers.authorization
  const upstream = await fetch('https://gigachat.devices.sberbank.ru/api/v1/models', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': UPSTREAM_UA,
      ...(auth ? { Authorization: auth as string } : {}),
    },
  })

  const text = await upstream.text()
  const ct = upstream.headers.get('content-type')
  if (ct) res.setHeader('Content-Type', ct)
  return res.status(upstream.status).send(text)
}
