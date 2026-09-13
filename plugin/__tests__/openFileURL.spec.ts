import { describe, expect, it } from 'vitest'

import { withOpenFile } from '../openFileURL'

function payloadOf(url: URL): [string, string][] {
  return JSON.parse(url.searchParams.get('payload')!)
}

describe('withOpenFile', () => {
  it('uses the serving host as the URI authority', () => {
    const url = withOpenFile(new URL('http://localhost:9000/'), '/repo/src/a.ts')
    expect(payloadOf(url)).toEqual([['openFile', 'vscode-remote://localhost:9000/repo/src/a.ts']])
  })

  it('never emits the literal remote authority', () => {
    const url = withOpenFile(new URL('http://127.0.0.1:6063/'), '/repo/src/a.ts')
    expect(url.searchParams.get('payload')).not.toContain('vscode-remote://remote')
  })

  it('keeps a non default port in the authority', () => {
    const url = withOpenFile(new URL('http://localhost:1234/'), '/repo/b.tsx')
    expect(payloadOf(url)[0][1]).toBe('vscode-remote://localhost:1234/repo/b.tsx')
  })

  it('preserves the rest of the URL', () => {
    const url = withOpenFile(new URL('http://localhost:9000/?folder=/repo'), '/repo/c.ts')
    expect(url.searchParams.get('folder')).toBe('/repo')
  })
})
