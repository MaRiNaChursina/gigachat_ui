import { describe, expect, it, vi } from 'vitest'

vi.mock('./gigachat', () => ({
  gigachatChatCompletion: vi.fn(),
}))

import { gigachatChatCompletion } from './gigachat'

describe('gigachat API (vi.mock)', () => {
  it('does not perform real network calls when the module is mocked', async () => {
    vi.mocked(gigachatChatCompletion).mockResolvedValue({ text: 'mocked' })

    const result = await gigachatChatCompletion({
      model: 'GigaChat',
      messages: [{ role: 'user', content: 'ping' }],
      stream: false,
      abortController: new AbortController(),
    })

    expect(result.text).toBe('mocked')
    expect(gigachatChatCompletion).toHaveBeenCalledTimes(1)
  })
})
