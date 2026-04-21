import { describe, beforeEach, expect, it } from 'vitest'

import { SessionRegistry } from '../useEditorSession'

describe('SessionRegistry', () => {
  let registry: SessionRegistry

  beforeEach(() => {
    registry = new SessionRegistry()
  })

  it('creates a new session with IDLE state', () => {
    const entry = registry.create('test')
    expect(entry.id).toBe('test')
    expect(entry.state).toBe('IDLE')
    expect(entry.url).toBeNull()
  })

  it('returns the same entry on duplicate create', () => {
    const a = registry.create('test')
    const b = registry.create('test')
    expect(a).toBe(b)
  })

  it('transitions to RUNNING and stores the url', () => {
    registry.create('test')
    registry.setRunning('test', 'http://localhost:9000?tkn=abc')
    const entry = registry.get('test')
    expect(entry?.state).toBe('RUNNING')
    expect(entry?.url).toBe('http://localhost:9000?tkn=abc')
  })

  it('transitions to ERROR', () => {
    registry.create('test')
    registry.setError('test')
    expect(registry.get('test')?.state).toBe('ERROR')
  })

  it('teardown sets DESTROYED and removes the session', () => {
    const entry = registry.create('test')
    registry.teardown('test')
    expect(entry.state).toBe('DESTROYED')
    expect(entry.url).toBeNull()
    expect(registry.get('test')).toBeUndefined()
  })

  it('teardown is a no-op for unknown sessions', () => {
    expect(() => registry.teardown('nonexistent')).not.toThrow()
  })

  it('get returns undefined for unknown sessions', () => {
    expect(registry.get('nonexistent')).toBeUndefined()
  })

  it('destroyAll removes all sessions', () => {
    registry.create('a')
    registry.create('b')
    registry.destroyAll()
    expect(registry.get('a')).toBeUndefined()
    expect(registry.get('b')).toBeUndefined()
  })
})
