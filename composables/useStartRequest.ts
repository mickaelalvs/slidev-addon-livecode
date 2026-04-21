import type { StartedEvent, StartRequest } from '../types'

const DEFAULT_CLIENT_TIMEOUT_MS = 35_000

export function requestStart(request: StartRequest, serverTimeout?: number): Promise<string> {
  if (!import.meta.hot) {
    throw new Error('[livecode] requestStart requires Vite HMR (not available in production build)')
  }

  const { session } = request
  const clientTimeout = serverTimeout ? serverTimeout + 5_000 : DEFAULT_CLIENT_TIMEOUT_MS

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      import.meta.hot!.off('livecode:started', handler)
      reject(new Error(`[livecode] Start timeout for session "${session}" (${clientTimeout}ms)`))
    }, clientTimeout)

    function handler(data: StartedEvent): void {
      if (data.session !== session) return
      clearTimeout(timeout)
      import.meta.hot!.off('livecode:started', handler)
      if (data.state === 'error') {
        reject(
          new Error(
            `[livecode] Failed to start session "${session}": ${data.error ?? 'unknown error'}`,
          ),
        )
      } else {
        resolve(data.url)
      }
    }

    import.meta.hot!.on('livecode:started', handler)
    import.meta.hot!.send('livecode:start', request)
  })
}

export function requestStop(session: string): void {
  import.meta.hot?.send('livecode:stop', { session })
}
