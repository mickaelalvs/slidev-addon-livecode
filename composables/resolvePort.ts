export function resolvePort(
  usedPorts: Set<number>,
  requestedPort: number | undefined,
  defaultPort: number,
): number {
  if (requestedPort !== undefined) return requestedPort
  let port = defaultPort
  while (usedPorts.has(port)) port++
  return port
}
