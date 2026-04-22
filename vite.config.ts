import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'

import { resolvePort } from './composables/resolvePort'
import type { StartedEvent, StartRequest } from './types'

export { resolvePort }

const DEFAULT_PORT = 9000
const DEFAULT_START_TIMEOUT_MS = 30_000

let previousSigintHandler: (() => void) | null = null
let previousSigtermHandler: (() => void) | null = null
let previousExitHandler: (() => void) | null = null

export default defineConfig({
  plugins: [
    {
      name: 'slidev-addon-livecode',

      configureServer(server) {
        const root = server.config.root
        const sessions = new Map<
          string,
          { close: () => Promise<void>; port: number; url: string }
        >()
        const usedPorts = new Set<number>()

        const sendStartedEvent = (
          session: string,
          url: string,
          state: 'running' | 'error',
          error?: string,
        ): void => {
          server.ws.send('livecode:started', { error, session, state, url } satisfies StartedEvent)
        }

        server.ws.on('livecode:start', async (request: StartRequest) => {
          const {
            defaultFolder,
            openFile,
            defaultPort = DEFAULT_PORT,
            port: requestedPort,
            session,
            startTimeout = DEFAULT_START_TIMEOUT_MS,
          } = request

          const existing = sessions.get(session)
          if (existing) {
            sendStartedEvent(session, existing.url, 'running')
            return
          }

          const port = resolvePort(usedPorts, requestedPort, defaultPort)
          usedPorts.add(port)

          try {
            const { startCodeServer } = await import('coderaft')

            const absoluteFolder = defaultFolder ? resolve(root, defaultFolder) : root
            const resolvedFolder = existsSync(absoluteFolder) ? absoluteFolder : root

            const resolvedOpenFile = openFile ? resolve(root, openFile) : undefined

            const handle = await Promise.race([
              startCodeServer({ defaultFolder: resolvedFolder, openFile: resolvedOpenFile, host: '127.0.0.1', port }),
              new Promise<never>((_, reject) =>
                setTimeout(
                  () => reject(new Error(`timeout after ${startTimeout}ms`)),
                  startTimeout,
                ),
              ),
            ])

            sessions.set(session, { close: () => handle.close(), port, url: handle.url })
            console.log(`[livecode] Session "${session}" running at ${handle.url}`)
            sendStartedEvent(session, handle.url, 'running')
          } catch (err) {
            usedPorts.delete(port)
            const message = err instanceof Error ? err.message : String(err)
            console.error(`[livecode] Failed to start session "${session}": ${message}`)
            sendStartedEvent(session, '', 'error', message)
          }
        })

        server.ws.on('livecode:stop', ({ session }: { session: string }) => {
          const entry = sessions.get(session)
          if (!entry) return
          entry.close().catch(() => {})
          sessions.delete(session)
          usedPorts.delete(entry.port)
          console.log(`[livecode] Session "${session}" stopped`)
        })

        const cleanup = () => {
          for (const [, entry] of sessions) {
            entry.close().catch(() => {})
          }
          sessions.clear()
          usedPorts.clear()
        }

        const sigintHandler = () => {
          cleanup()
          process.exit(0)
        }
        const sigtermHandler = () => {
          cleanup()
          process.exit(0)
        }

        if (previousSigintHandler) process.off('SIGINT', previousSigintHandler)
        if (previousSigtermHandler) process.off('SIGTERM', previousSigtermHandler)
        if (previousExitHandler) process.off('exit', previousExitHandler)

        previousSigintHandler = sigintHandler
        previousSigtermHandler = sigtermHandler
        previousExitHandler = cleanup

        process.on('exit', cleanup)
        process.on('SIGINT', sigintHandler)
        process.on('SIGTERM', sigtermHandler)
        server.httpServer?.on('close', cleanup)
      },
    },
  ],
})
