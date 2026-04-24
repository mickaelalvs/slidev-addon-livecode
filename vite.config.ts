import { defineConfig } from 'vite'

import { resolvePort } from './composables/resolvePort'
import { SessionManager } from './plugin/sessionManager'
import type { StartedEvent, StartRequest } from './types'

export { resolvePort }

let previousSigintHandler: (() => void) | null = null
let previousSigtermHandler: (() => void) | null = null
let previousExitHandler: (() => void) | null = null

export default defineConfig({
  plugins: [
    {
      name: 'slidev-addon-livecode',

      configureServer(server) {
        const manager = new SessionManager()

        const send = (
          session: string,
          url: string,
          state: 'running' | 'error',
          error?: string,
        ): void => {
          server.ws.send('livecode:started', { error, session, state, url } satisfies StartedEvent)
        }

        server.ws.on('livecode:start', (request: StartRequest) => {
          manager.start(request, server.config.root, send)
        })

        server.ws.on('livecode:stop', ({ session }: { session: string }) => {
          manager.stop(session)
        })

        const cleanup = () => manager.cleanup()

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
