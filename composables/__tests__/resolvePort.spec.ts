import { describe, expect, it } from 'vitest'

import { resolvePort } from '../resolvePort'

describe('resolvePort', () => {
  it('returns the requested port when provided', () => {
    expect(resolvePort(new Set(), 9001, 9000)).toBe(9001)
  })

  it('returns the default port when none requested', () => {
    expect(resolvePort(new Set(), undefined, 9000)).toBe(9000)
  })

  it('increments past a taken default port', () => {
    expect(resolvePort(new Set([9000]), undefined, 9000)).toBe(9001)
  })

  it('skips multiple consecutive taken ports', () => {
    expect(resolvePort(new Set([9000, 9001, 9002]), undefined, 9000)).toBe(9003)
  })
})
