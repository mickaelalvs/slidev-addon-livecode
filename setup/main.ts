import { defineAppSetup } from '@slidev/types'

import { SessionRegistry } from '../composables/useEditorSession'

export const REGISTRY_KEY = Symbol('livecode-registry')

export default defineAppSetup(({ app }) => {
  const registry = new SessionRegistry()
  app.provide(REGISTRY_KEY, registry)
})
