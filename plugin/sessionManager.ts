import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { resolvePort } from '../composables/resolvePort'
import type { StartRequest } from '../types'

const COLOR_THEMES = {
  dark: 'Default Dark Modern',
  light: 'Default Light Modern',
} as const

const DEFAULT_PORT = 9000
const DEFAULT_START_TIMEOUT_MS = 30_000

type SessionEntry = {
  close: () => Promise<void>
  port: number
  url: string
  userDataDir?: string
}

type SendEvent = (session: string, url: string, state: 'running' | 'error', error?: string) => void

export class SessionManager {
  private sessions = new Map<string, SessionEntry>()
  private usedPorts = new Set<number>()

  async start(request: StartRequest, root: string, send: SendEvent): Promise<void> {
    const {
      colorScheme,
      defaultFolder,
      defaultPort = DEFAULT_PORT,
      fontSize,
      hideActivityBar,
      hideMinimap,
      hideStatusBar,
      port: requestedPort,
      session,
      startTimeout = DEFAULT_START_TIMEOUT_MS,
    } = request

    const existing = this.sessions.get(session)
    if (existing) {
      send(session, existing.url, 'running')
      return
    }

    const port = resolvePort(this.usedPorts, requestedPort, defaultPort)
    this.usedPorts.add(port)

    try {
      const { startCodeServer } = await import('coderaft')

      const absoluteFolder = defaultFolder ? resolve(root, defaultFolder) : root
      const resolvedFolder = existsSync(absoluteFolder) ? absoluteFolder : root

      const settings: Record<string, unknown> = {}
      if (colorScheme) settings['workbench.colorTheme'] = COLOR_THEMES[colorScheme]
      if (fontSize) settings['editor.fontSize'] = fontSize
      if (hideMinimap) settings['editor.minimap.enabled'] = false
      if (hideActivityBar) settings['workbench.activityBar.location'] = 'hidden'
      if (hideStatusBar) settings['workbench.statusBar.visible'] = false

      let userDataDir: string | undefined
      if (Object.keys(settings).length > 0) {
        userDataDir = mkdtempSync(join(tmpdir(), 'livecode-'))
        mkdirSync(join(userDataDir, 'User'), { recursive: true })
        writeFileSync(join(userDataDir, 'User', 'settings.json'), JSON.stringify(settings))
      }

      const handle = await Promise.race([
        startCodeServer({
          defaultFolder: resolvedFolder,
          host: '127.0.0.1',
          port,
          ...(userDataDir ? { vscode: { 'user-data-dir': userDataDir } } : {}),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`timeout after ${startTimeout}ms`)), startTimeout),
        ),
      ])

      this.sessions.set(session, {
        close: () => handle.close(),
        port,
        url: handle.url,
        userDataDir,
      })
      console.log(`[livecode] Session "${session}" running at ${handle.url}`)
      send(session, handle.url, 'running')
    } catch (err) {
      this.usedPorts.delete(port)
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[livecode] Failed to start session "${session}": ${message}`)
      send(session, '', 'error', message)
    }
  }

  stop(session: string): void {
    const entry = this.sessions.get(session)
    if (!entry) return
    entry.close().catch(() => {})
    if (entry.userDataDir) rmSync(entry.userDataDir, { recursive: true, force: true })
    this.sessions.delete(session)
    this.usedPorts.delete(entry.port)
    console.log(`[livecode] Session "${session}" stopped`)
  }

  cleanup(): void {
    for (const [, entry] of this.sessions) {
      entry.close().catch(() => {})
      if (entry.userDataDir) rmSync(entry.userDataDir, { recursive: true, force: true })
    }
    this.sessions.clear()
    this.usedPorts.clear()
  }
}
