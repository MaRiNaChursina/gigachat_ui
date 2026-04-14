import { describe, expect, it } from 'vitest'
import { normalizeGigachatAuthorizationKey } from './gigachat'

describe('normalizeGigachatAuthorizationKey', () => {
  it('trims and strips Basic prefix', () => {
    expect(normalizeGigachatAuthorizationKey('  QkFTRTY0 ')).toBe('QkFTRTY0')
    expect(normalizeGigachatAuthorizationKey('Basic QkFTRTY0')).toBe('QkFTRTY0')
    expect(normalizeGigachatAuthorizationKey('basic QkFTRTY0')).toBe('QkFTRTY0')
  })

  it('encodes client_id:client_secret style pair to base64', () => {
    const pair = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:ffffffff-1111-2222-3333-444444444444'
    expect(normalizeGigachatAuthorizationKey(pair)).toBe(btoa(pair))
  })
})
