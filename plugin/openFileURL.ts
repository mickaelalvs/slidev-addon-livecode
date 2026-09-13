/**
 * Adds the `openFile` payload to an editor URL.
 *
 * The authority has to be the host actually serving the editor. A literal
 * `remote` puts the file outside the workspace, so VS Code attaches no
 * tsconfig to it and the language features stay silent on that tab.
 */
export function withOpenFile(url: URL, file: string): URL {
  url.searchParams.set(
    'payload',
    JSON.stringify([['openFile', `vscode-remote://${url.host}${file}`]]),
  )
  return url
}
