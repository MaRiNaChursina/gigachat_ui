import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

export const config = {
  maxDuration: 120,
}

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const auth = req.headers.authorization
  const upstream = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: (req.headers.accept as string) || 'application/json',
      ...(auth ? { Authorization: auth as string } : {}),
    },
    body: JSON.stringify(req.body),
  })

  if (!upstream.ok) {
    const t = await upstream.text()
    return res.status(upstream.status).send(t)
  }

  const ct = upstream.headers.get('content-type')
  if (ct) res.setHeader('Content-Type', ct)

  res.status(upstream.status)

  if (upstream.body) {
    try {
      await pipeline(Readable.fromWeb(upstream.body as import('stream/web').ReadableStream), res)
    } catch {
      const buf = await upstream.arrayBuffer()
      res.end(Buffer.from(buf))
    }
  } else {
    res.end()
  }
}
