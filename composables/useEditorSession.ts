import { reactive } from 'vue'

import type { SessionEntry } from '../types'

export class SessionRegistry {
  private sessions = new Map<string, SessionEntry>()

  create(id: string): SessionEntry {
    const existing = this.sessions.get(id)
    if (existing) return existing

    const entry = reactive<SessionEntry>({ id, state: 'IDLE', url: null })
    this.sessions.set(id, entry)
    return entry
  }

  get(id: string): SessionEntry | undefined {
    return this.sessions.get(id)
  }

  setRunning(id: string, url: string): void {
    const entry = this.sessions.get(id)
    if (!entry) return
    entry.url = url
    entry.state = 'RUNNING'
  }

  setError(id: string): void {
    const entry = this.sessions.get(id)
    if (entry) entry.state = 'ERROR'
  }

  teardown(id: string): void {
    const entry = this.sessions.get(id)
    if (!entry) return
    entry.state = 'DESTROYED'
    entry.url = null
    this.sessions.delete(id)
  }

  destroyAll(): void {
    for (const id of this.sessions.keys()) {
      this.teardown(id)
    }
  }
}
